"""Single distribution manifest contract for packaging and the native plugin."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PayloadFile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    path: str = Field(min_length=1, max_length=240, pattern=r"^[A-Za-z0-9_./ -]+$")
    size: int = Field(ge=0)
    sha256: str = Field(pattern=r"^[a-f0-9]{64}$")


class EngineManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    manifest_version: Literal[1]
    protocol_version: Literal[1]
    engine_version: str = Field(pattern=r"^[0-9]+\.[0-9]+\.[0-9]+$")
    platform: Literal["win32"]
    architecture: Literal["x86_64"]
    entrypoint: Literal["evidra-engine.exe"]
    files: list[PayloadFile] = Field(min_length=1, max_length=10000)
