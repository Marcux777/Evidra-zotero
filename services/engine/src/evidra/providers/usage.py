"""Atomic monetary reservations and durable uncertainty, independent of provider I/O."""

import json
import sqlite3
from datetime import UTC, datetime
from decimal import Decimal
from typing import Literal

from pydantic import Field

from evidra.domain.errors import EvidraError
from evidra.providers.models import PriceConfig, StrictModel
from evidra.providers.profiles import ProfileService, remember, replay, revision
from evidra.scope.service import ScopeContext


class CallIdentity(StrictModel):
    """Assigned by the trusted job consumer, never model content or an unscoped HTTP body."""

    call_id: str = Field(min_length=1, max_length=200)
    job_id: str = Field(min_length=1, max_length=200)
    session_id: str = Field(min_length=1, max_length=200)
    repair_of: str | None = None


class InputBound(StrictModel):
    """Internal verified bound; estimates and character counts are not accepted.

    The trusted consumer must bind this receipt to the exact serialized request,
    model and tokenization rules. It is deliberately absent from HTTP input routes.
    """

    tokens: int = Field(ge=0)
    provenance: Literal["PROVIDER_REPORTED", "PROBED"]
    source: str = Field(min_length=1)


class BudgetWrite(StrictModel):
    kind: Literal["call", "job", "session"]
    identity: str = Field(min_length=1, max_length=200)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    ceiling: Decimal = Field(ge=0, allow_inf_nan=False)
    expected_revision: int = Field(ge=0)
    idempotency_key: str = Field(min_length=1, max_length=200)


class Budget(StrictModel):
    kind: Literal["call", "job", "session"]
    identity: str
    currency: str
    ceiling: Decimal
    revision: int


class UsageRecord(StrictModel):
    call_id: str
    notebook_id: str
    snapshot_id: str
    profile_id: str
    profile_revision: int
    job_id: str
    session_id: str
    repair_of: str | None
    state: Literal["RESERVED", "SENT", "CONFIRMED", "BILLING_UNKNOWN", "NOT_SENT"]
    reserved: Decimal | None
    currency: str | None
    price_version: str | None
    input_tokens: int | None
    output_tokens: int | None
    cost: Decimal | None
    error: str | None
    created_at: str
    updated_at: str


class UsagePage(StrictModel):
    items: list[UsageRecord]
    offset: int
    limit: int
    total: int


def record(row: sqlite3.Row) -> UsageRecord:
    fields = {key: row[key] for key in UsageRecord.model_fields if key != "price_version"}
    fields["price_version"] = json.loads(row["price"])["version"] if row["price"] else None
    return UsageRecord(**fields)


def cost(price: PriceConfig, inputs: int, outputs: int) -> Decimal:
    return (inputs * price.input_per_million + outputs * price.output_per_million) / Decimal(
        1_000_000
    )


class UsageService:
    def __init__(self, profiles: ProfileService):
        self.profiles, self.scopes = profiles, profiles.scopes
        self.database = profiles.database
        # A stopped process does not prove that dispatched requests were free.
        with self.database.transaction() as connection:
            connection.execute(
                "UPDATE provider_calls SET state='BILLING_UNKNOWN',"
                "error='ENGINE_INTERRUPTED' WHERE state='SENT' AND profile_id IN "
                "(SELECT id FROM provider_profiles WHERE owner=?)",
                (profiles.owner,),
            )
            connection.execute(
                "UPDATE provider_calls SET state='NOT_SENT' WHERE state='RESERVED' "
                "AND profile_id IN (SELECT id FROM provider_profiles WHERE owner=?)",
                (profiles.owner,),
            )

    def add_price(self, price: PriceConfig) -> PriceConfig:
        self.scopes.authorize(self.scopes.principal, "manage")
        with self.database.transaction() as connection:
            row = connection.execute(
                "SELECT config FROM provider_prices WHERE owner=? AND version=?",
                (self.profiles.owner, price.version),
            ).fetchone()
            if row and PriceConfig.model_validate_json(row["config"]) != price:
                raise EvidraError("REVISION_CONFLICT", "A price version is immutable.")
            connection.execute(
                "INSERT OR IGNORE INTO provider_prices VALUES(?,?,?)",
                (self.profiles.owner, price.version, price.model_dump_json()),
            )
            return price

    def set_budget(self, context: ScopeContext, body: BudgetWrite) -> Budget:
        with self.scopes.guarded(context, capability="commit") as connection:
            target = f"budget:{context.notebook_id}:{body.kind}:{body.identity}"
            previous = replay(connection, self.profiles.owner, target, body)
            if previous:
                return Budget(**previous)
            row = connection.execute(
                "SELECT revision FROM provider_budgets WHERE notebook_id=? "
                "AND kind=? AND identity=?",
                (context.notebook_id, body.kind, body.identity),
            ).fetchone()
            revision(row["revision"] if row else 0, body.expected_revision)
            result = Budget(
                kind=body.kind,
                identity=body.identity,
                currency=body.currency,
                ceiling=body.ceiling,
                revision=body.expected_revision + 1,
            )
            connection.execute(
                "INSERT INTO provider_budgets VALUES(?,?,?,?,?,?) ON CONFLICT("
                "notebook_id,kind,identity) DO UPDATE SET revision=excluded.revision,"
                "currency=excluded.currency,ceiling=excluded.ceiling",
                (
                    context.notebook_id,
                    body.kind,
                    body.identity,
                    result.revision,
                    body.currency,
                    str(body.ceiling),
                ),
            )
            remember(connection, self.profiles.owner, target, body, result)
            return result

    def reserve(
        self,
        context: ScopeContext,
        profile_id: str,
        identity: CallIdentity,
        max_output_tokens: int,
        bound: InputBound | None,
    ) -> UsageRecord:
        with self.scopes.guarded(context, capability="commit") as connection:
            profile = self.profiles.load(connection, profile_id)
            if connection.execute(
                "SELECT 1 FROM provider_calls WHERE call_id=?", (identity.call_id,)
            ).fetchone():
                raise EvidraError("CALL_ALREADY_EXISTS", "A recorded call cannot be resent.")
            if identity.repair_of:
                original = connection.execute(
                    "SELECT * FROM provider_calls WHERE call_id=? "
                    "AND notebook_id=? AND job_id=? AND session_id=?",
                    (identity.repair_of, context.notebook_id, identity.job_id, identity.session_id),
                ).fetchone()
                if (
                    original is None
                    or original["repair_of"] is not None
                    or original["error"] != "INVALID_OUTPUT"
                    or connection.execute(
                        "SELECT 1 FROM provider_calls WHERE repair_of=?", (identity.repair_of,)
                    ).fetchone()
                ):
                    raise EvidraError(
                        "REPAIR_NOT_ALLOWED", "Only one explicit repair is permitted."
                    )
            budgets = connection.execute(
                "SELECT * FROM provider_budgets WHERE notebook_id=? AND "
                "((kind='call' AND identity=?) OR (kind='job' AND identity=?) OR "
                "(kind='session' AND identity=?))",
                (context.notebook_id, identity.call_id, identity.job_id, identity.session_id),
            ).fetchall()
            prices = [
                PriceConfig.model_validate_json(r["config"])
                for r in connection.execute(
                    "SELECT config FROM provider_prices WHERE owner=?", (self.profiles.owner,)
                )
            ]
            applicable = [
                p
                for p in prices
                if p.adapter == profile.adapter
                and p.model == profile.model
                and p.effective_date <= datetime.now(UTC).date()
            ]
            price = (
                max(applicable, key=lambda p: (p.effective_date, p.version)) if applicable else None
            )
            if budgets and price is None:
                raise EvidraError("PRICE_UNKNOWN", "A monetary ceiling requires versioned pricing.")
            if budgets and bound is None:
                raise EvidraError(
                    "TOKEN_BOUND_REQUIRED", "A monetary ceiling requires a verified input bound."
                )
            reserved = cost(price, bound.tokens, max_output_tokens) if price and bound else None
            for budget in budgets:
                if price is None or budget["currency"] != price.currency:
                    raise EvidraError("CURRENCY_MISMATCH", "Budget and price currencies differ.")
                column = {"call": "call_id", "job": "job_id", "session": "session_id"}[
                    budget["kind"]
                ]
                rows = connection.execute(
                    f"SELECT * FROM provider_calls WHERE notebook_id=? AND {column}=? AND state!=?",
                    (context.notebook_id, budget["identity"], "NOT_SENT"),
                )
                committed = Decimal(0)
                for row in rows:
                    amount = row["cost"] if row["state"] == "CONFIRMED" else row["reserved"]
                    if amount is None or row["currency"] != price.currency:
                        raise EvidraError(
                            "BILLING_UNKNOWN", "Unknown prior billing blocks this ceiling."
                        )
                    committed += Decimal(amount)
                if reserved is None or committed + reserved > Decimal(budget["ceiling"]):
                    raise EvidraError("BUDGET_EXCEEDED", "The monetary ceiling would be exceeded.")
            now = datetime.now(UTC).isoformat()
            connection.execute(
                "INSERT INTO provider_calls(call_id,notebook_id,snapshot_id,profile_id,"
                "profile_revision,job_id,session_id,repair_of,state,reserved,currency,price,input_bound,"
                "max_output_tokens,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (
                    identity.call_id,
                    context.notebook_id,
                    context.snapshot_id,
                    profile_id,
                    profile.revision,
                    identity.job_id,
                    identity.session_id,
                    identity.repair_of,
                    "RESERVED",
                    str(reserved) if reserved is not None else None,
                    price.currency if price else None,
                    price.model_dump_json() if price else None,
                    bound.model_dump_json() if bound else None,
                    max_output_tokens,
                    now,
                    now,
                ),
            )
            return record(
                connection.execute(
                    "SELECT * FROM provider_calls WHERE call_id=?", (identity.call_id,)
                ).fetchone()
            )

    def mark_sent(self, call_id: str) -> None:
        with self.database.transaction() as connection:
            changed = connection.execute(
                "UPDATE provider_calls SET state='SENT',updated_at=? "
                "WHERE call_id=? AND state='RESERVED'",
                (datetime.now(UTC).isoformat(), call_id),
            ).rowcount
            if changed != 1:
                raise EvidraError("CALL_ALREADY_EXISTS", "The call cannot be sent again.")

    def finish(
        self,
        call_id: str,
        inputs: int | None,
        outputs: int | None,
        *,
        error: str | None = None,
        confirmed: bool = True,
    ) -> None:
        # Internal accounting must survive content scope revocation/heartbeat expiry.
        # This write contains no research text and cannot commit a generation result.
        with self.database.transaction() as connection:
            row = connection.execute(
                "SELECT * FROM provider_calls WHERE call_id=?", (call_id,)
            ).fetchone()
            if row is None or row["state"] not in ["RESERVED", "SENT"]:
                raise EvidraError("CALL_ALREADY_EXISTS", "The call is already reconciled.")
            known = confirmed and inputs is not None and outputs is not None
            actual = None
            if known and row["price"] is not None:
                assert inputs is not None and outputs is not None
                actual = cost(PriceConfig.model_validate_json(row["price"]), inputs, outputs)
            state = (
                "NOT_SENT"
                if row["state"] == "RESERVED"
                else "CONFIRMED"
                if known
                else "BILLING_UNKNOWN"
            )
            if (
                actual is not None
                and row["reserved"] is not None
                and actual > Decimal(row["reserved"])
            ):
                error = "RESERVATION_EXCEEDED"
            connection.execute(
                "UPDATE provider_calls SET state=?,input_tokens=?,output_tokens=?,"
                "cost=?,error=?,updated_at=? WHERE call_id=?",
                (
                    state,
                    inputs,
                    outputs,
                    str(actual) if actual is not None else None,
                    error,
                    datetime.now(UTC).isoformat(),
                    call_id,
                ),
            )

    def read(self, context: ScopeContext, call_id: str) -> UsageRecord:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            row = connection.execute(
                "SELECT * FROM provider_calls WHERE call_id=? AND notebook_id=? AND snapshot_id=?",
                (call_id, context.notebook_id, context.snapshot_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Call not found in this scope.")
            return record(row)

    def list(self, context: ScopeContext, offset: int, limit: int) -> UsagePage:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            params = (context.notebook_id, context.snapshot_id)
            rows = connection.execute(
                "SELECT * FROM provider_calls WHERE notebook_id=? AND snapshot_id=? "
                "ORDER BY created_at,call_id LIMIT ? OFFSET ?",
                (*params, limit, offset),
            )
            items = [record(row) for row in rows]
            total = connection.execute(
                "SELECT COUNT(*) FROM provider_calls WHERE notebook_id=? AND snapshot_id=?", params
            ).fetchone()[0]
            return UsagePage(items=items, offset=offset, limit=limit, total=total)
