import { useEffect, useRef, useState } from 'react';
import type { ConnectionPage, ExternalNote, ExternalNotePage, McpSetup } from '../bridge/types';
import { catalog } from './i18n';
import { MatrixEvidence } from './MatrixEvidence';
import { NoteOutbox, NotePreview } from './NotePreview';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';

/** JSON quoting also forms valid TOML basic strings; PowerShell uses literal single quotes. */
export function mcpConfiguration(setup: McpSetup) {
    const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
    const args = ['mcp', '--connection-file', setup.connection_file];
    return `# Codex (PowerShell)\ncodex mcp add evidra -- ${quote(setup.executable)} mcp --connection-file ${quote(setup.connection_file)}\n\n`
        + `# Codex config.toml\n[mcp_servers.evidra]\ncommand = ${JSON.stringify(setup.executable)}\nargs = ${JSON.stringify(args)}\n\n`
        + `# Claude Code (PowerShell)\nclaude mcp add --transport stdio --scope local evidra -- ${quote(setup.executable)} mcp --connection-file ${quote(setup.connection_file)}\n\n`
        + `# Gemini CLI settings.json\n${JSON.stringify({ mcpServers: { evidra: { command: setup.executable, args } } }, null, 2)}`;
}

export function Mcp(props: ResearchScope) {
    const { bridge, notebook_id, snapshot_id, locale } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale).mcp;
    const [open, setOpen] = useState(false), [connections, setConnections] = useState<ConnectionPage | null>(null);
    const [notes, setNotes] = useState<ExternalNotePage | null>(null), [setup, setSetup] = useState<McpSetup | null>(null);
    const [label, setLabel] = useState(''), [expires, setExpires] = useState(3600), [propose, setPropose] = useState(false);
    const config = useRef<HTMLTextAreaElement>(null), authorization = useRef(0);
    function invalidateLifecycle() { ++authorization.current; setConnections(null); setNotes(null); setSetup(null); }
    const actions = useResearchActions(bridge, invalidateLifecycle);
    const proposalActions = useResearchActions(bridge, () => setNotes(null));
    function load(connectionOffset = connections?.offset ?? 0, noteOffset = notes?.offset ?? 0) {
        actions.read(async current => {
            const page = await bridge.request({ op: 'mcp.connections', ...scope, offset: connectionOffset }) as ConnectionPage;
            if (!current()) return; setConnections(page);
            proposalActions.read(async proposalCurrent => {
                const authorized = authorization.current;
                try {
                    const proposals = await bridge.request({ op: 'mcp.notes', ...scope, offset: noteOffset }) as ExternalNotePage;
                    if (proposalCurrent() && authorized === authorization.current) setNotes(proposals);
                } catch (failure) {
                    if (proposalCurrent() && authorized === authorization.current && failure instanceof Error
                        && ['FORBIDDEN', 'BRIDGE_EXPIRED', 'UNAUTHENTICATED'].includes(failure.message)) invalidateLifecycle();
                    throw failure;
                }
            });
        });
    }
    useEffect(() => {
        if (!open) return;
        const interval = setInterval(() => load(), 10000);
        return () => clearInterval(interval);
    }, [open, connections?.offset, notes?.offset]);
    function create() {
        if (!label.trim()) return;
        actions.write({ op: 'mcp.create', ...scope, request: { label: label.trim(), allow_proposals: propose, expires_in_seconds: expires, idempotency_key: researchKey() } }, value => {
            setSetup(value);
            setConnections(old => old && old.offset === 0 ? { ...old, items: [value.connection, ...old.items.filter(c => c.id !== value.connection.id)].slice(0, old.limit), total: old.total + (old.items.some(c => c.id === value.connection.id) ? 0 : 1) } : old);
        });
    }
    if (!open) return <button type="button" onClick={() => { setOpen(true); load(); }}>{t.title}</button>;
    return <section aria-label={t.title}><h2>{t.title}</h2><p>{t.help}</p><ResearchFeedback actions={actions} locale={locale}/>
        <fieldset disabled={actions.locked}><legend>{t.create}</legend>
            <label>{t.label}<input name="mcp_label" maxLength={100} value={label} onChange={e => setLabel(e.target.value)} onKeyDown={e => {
                if (e.key !== 'Enter' || e.repeat || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
                e.preventDefault(); create();
            }}/></label>
            <label>{t.expires}<select value={expires} onChange={e => setExpires(Number(e.target.value))}><option value={900}>{t.short}</option><option value={3600}>{t.hour}</option><option value={86400}>{t.day}</option></select></label>
            <label><input type="checkbox" checked={propose} onChange={e => setPropose(e.target.checked)}/>{t.propose}</label>
            <button type="button" disabled={actions.locked || !label.trim()} onClick={create}>{t.create}</button>
        </fieldset>
        {setup && <section aria-label={t.setup}><h3>{t.setup}</h3><p>{t.setupHelp}</p>
            <label>{t.setup}<textarea ref={config} rows={12} readOnly value={mcpConfiguration(setup)}/></label>
            <button type="button" onClick={() => { config.current?.focus(); config.current?.select(); }}>{t.selectConfig}</button></section>}
        <button type="button" disabled={actions.locked} onClick={() => load()}>{t.refresh}</button>
        <ul>{connections?.items.map(connection => <li key={connection.id}><h3>{connection.label}</h3>
            <p>{t.states[connection.state]} · {connection.allow_proposals ? t.write : t.readOnly}</p>
            <p>{t.expiry}: {new Date(connection.expires_at).toLocaleString(locale)}</p>
            <p>{t.lastUsed}: {connection.last_used_at ? new Date(connection.last_used_at).toLocaleString(locale) : t.never}</p>
            {connection.state === 'ACTIVE' && connection.last_used_at && Date.now() - Date.parse(connection.last_used_at) < 30000 && <p role="status">{t.activeClient}</p>}
            <button type="button" disabled={actions.locked || connection.state !== 'ACTIVE'} onClick={() => actions.write({ op: 'mcp.revoke', ...scope, connection_id: connection.id, request: { idempotency_key: researchKey() } }, value => {
                setConnections(old => old && ({ ...old, items: old.items.map(c => c.id === value.id ? value : c) }));
                if (setup?.connection.id === connection.id) setSetup(null);
            })}>{t.revoke}</button></li>)}</ul>
        {connections && <nav aria-label={t.title}><button type="button" disabled={actions.locked || connections.offset === 0} onClick={() => load(Math.max(0, connections.offset - connections.limit))}>{catalog(locale).previous}</button>
            <button type="button" disabled={actions.locked || connections.offset + connections.limit >= connections.total} onClick={() => load(connections.offset + connections.limit)}>{catalog(locale).next}</button></nav>}
        <h3>{t.proposals}</h3><ResearchFeedback actions={proposalActions} locale={locale}/><p>{t.matrix}</p>{notes?.items.length === 0 && <p>{t.empty}</p>}
        {notes?.items.map(note => <ExternalProposal key={note.id} {...props} note={note} onChange={value => setNotes(old => old && ({ ...old, items: [value] }))}/>)}
        {notes && <nav aria-label={t.proposals}><button type="button" disabled={actions.locked || proposalActions.locked || notes.offset === 0} onClick={() => load(connections?.offset ?? 0, Math.max(0, notes.offset - notes.limit))}>{catalog(locale).previous}</button>
            <button type="button" disabled={actions.locked || proposalActions.locked || notes.offset + notes.limit >= notes.total} onClick={() => load(connections?.offset ?? 0, notes.offset + notes.limit)}>{catalog(locale).next}</button></nav>}
        <NoteOutbox {...props}/>
    </section>;
}

function ExternalProposal(props: ResearchScope & { note: ExternalNote; onChange: (note: ExternalNote) => void }) {
    const { bridge, notebook_id, snapshot_id, locale, note, onChange } = props, t = catalog(locale).mcp;
    const [reason, setReason] = useState(''), [valid, setValid] = useState(true);
    const actions = useResearchActions(bridge, () => setValid(false));
    const studies = [...new Map(note.evidence.map(e => [e.source_id, { source_id: e.source_id, identity: e.source_identity, title: e.source_identity.item_key, doi: null, year: null }])).values()];
    return <article><h4>{t.origin} · {catalog(locale).research.version} {note.revision}</h4><ResearchFeedback actions={actions} locale={locale}/>
        {valid && <><p>{t.producer}: <code>{note.connection_id}</code></p><p>{t.declared}: {note.declared_model ?? t.unknownModel}</p>
            <p>{catalog(locale).matrix.reviews[note.review_state]} · {note.author} · {new Date(note.created_at).toLocaleString(locale)}</p>
            <p className="mcp-draft">{note.text}</p>
            {note.evidence.map(evidence => <MatrixEvidence key={evidence.id} evidence={evidence} image={null} locale={locale} busy={actions.locked} onOpen={id => actions.read(async () => {
                await bridge.request({ op: 'documents.open', notebook_id, snapshot_id, evidence_id: id });
            })}/>)}
            <fieldset disabled={actions.locked}><legend>{t.review}</legend><label>{t.rationale}<textarea name="mcp_review_reason" value={reason} maxLength={2000} onChange={e => setReason(e.target.value)}/></label>
                {(['APPROVED', 'REJECTED'] as const).map(action => <button type="button" key={action} disabled={!reason.trim()} onClick={() => actions.write({ op: 'mcp.review', notebook_id, snapshot_id, version_id: note.id, request: { action, expected_revision: note.revision, rationale: reason, idempotency_key: researchKey() } }, onChange)}>{action === 'APPROVED' ? t.approve : t.reject}</button>)}
            </fieldset>
            {note.review_state === 'APPROVED' && <NotePreview {...props} artifact={note} preview={{ inputs: { studies } }}/>}</>}
    </article>;
}
