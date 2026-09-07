import { useState } from 'react';
import DOMPurify from 'dompurify';
import type { ApprovedWriteOutbox, ArtifactVersion, NotePreview as Preview, OutboxPage, ResearchPreview } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';

export function NotePreview(props: ResearchScope & { artifact: Pick<ArtifactVersion, 'id' | 'revision'>; preview: { inputs: Pick<ResearchPreview['inputs'], 'studies'> } }) {
    const { bridge, notebook_id, snapshot_id, locale, artifact, preview } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale).research;
    const [title, setTitle] = useState(''), [source, setSource] = useState(preview.inputs.studies[0]?.source_id ?? ''), [offset, setOffset] = useState(0);
    const [note, setNote] = useState<Preview | null>(null), [intent, setIntent] = useState<ApprovedWriteOutbox | null>(null);
    const actions = useResearchActions(bridge, () => { setNote(null); setIntent(null); });
    const studies = preview.inputs.studies.slice(offset, offset + 20);
    function edit() { setNote(null); setIntent(null); }
    return <section aria-label={t.note}><h4>{t.note}</h4><p>{t.noteHelp}</p><ResearchFeedback actions={actions} locale={locale}/>
        <fieldset disabled={actions.locked}><legend>{t.notePreview}</legend>
            <label>{t.noteTitle}<input maxLength={200} value={title} onChange={e => { edit(); setTitle(e.target.value); }}/></label>
            <label>{t.source}<select value={source} onChange={e => { edit(); setSource(e.target.value); }}>{source && !studies.some(s => s.source_id === source) && <option value={source}>{preview.inputs.studies.find(s => s.source_id === source)?.title}</option>}
                {studies.map(s => <option key={s.source_id} value={s.source_id}>{s.title} · {s.identity.library_id}/{s.identity.item_key}</option>)}</select></label>
            <div className="actions"><button type="button" disabled={offset === 0} onClick={() => setOffset(old => Math.max(0, old - 20))}>{t.previous}</button>
                <button type="button" disabled={offset + 20 >= preview.inputs.studies.length} onClick={() => setOffset(old => old + 20)}>{t.next}</button></div>
        </fieldset>
        <button type="button" disabled={actions.locked || !title.trim() || !source} onClick={() => actions.write({ op: 'research.notes.preview', ...scope, request: {
            artifact_version_id: artifact.id, source_id: source, title, locale, idempotency_key: researchKey(),
        } }, value => { setNote(value); setIntent(null); })}>{t.notePreview}</button>
        {note && <><p>{t.destination}: {note.destination.library_id}/{note.destination.item_key} · {t.version} {note.artifact_revision}</p>
            <div className="note-preview" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.html, {
                ALLOWED_TAGS: ['div', 'h1', 'h2', 'p', 'blockquote'], ALLOWED_ATTR: [], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
            }) }}/>
            <p>UUID: <code>{note.uuid}</code></p>
            <button type="button" disabled={actions.locked || intent !== null} onClick={() => actions.write({ op: 'research.notes.approve', ...scope, request: {
                preview_id: note.id, expected_artifact_revision: note.artifact_revision, idempotency_key: researchKey(),
            } }, setIntent)}>{t.noteApprove}</button></>}
        {intent && <><p role="status">{t[intent.state]}</p>{intent.note_key && <p>{t.note}: {intent.note_key}</p>}
            <button type="button" disabled={actions.locked} onClick={() => actions.write({ op: 'research.notes.publish', ...scope, intent_id: intent.id,
                request: { idempotency_key: researchKey() } }, setIntent)}>{t.publish}</button></>}
    </section>;
}

export function NoteOutbox(props: ResearchScope) {
    const { bridge, notebook_id, snapshot_id, locale } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale).research;
    const [page, setPage] = useState<OutboxPage | null>(null);
    const actions = useResearchActions(bridge, () => setPage(null));
    function load(offset: number) { actions.read(async current => {
        const result = await bridge.request({ op: 'research.notes.list', ...scope, offset }) as OutboxPage;
        if (current()) setPage(result);
    }); }
    return <details><summary>{t.outbox}</summary><ResearchFeedback actions={actions} locale={locale}/>
        <button type="button" disabled={actions.locked} onClick={() => load(page?.offset ?? 0)}>{t.refresh}</button><p>{t.noteHelp}</p>
        {page?.items.map(intent => <article key={intent.id}><h4>{intent.title}</h4><p>{t[intent.state]} · {t.destination}: {intent.destination.library_id}/{intent.destination.item_key}</p>
            <p>UUID: <code>{intent.uuid}</code> · {t.version} {intent.artifact_revision}</p>
            <div className="note-preview" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(intent.html, {
                ALLOWED_TAGS: ['div', 'h1', 'h2', 'p', 'blockquote'], ALLOWED_ATTR: [], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
            }) }}/>
            {intent.note_key && <p>{t.note}: {intent.note_key}</p>}
            <button type="button" disabled={actions.locked} onClick={() => actions.write({ op: 'research.notes.publish', ...scope, intent_id: intent.id, request: { idempotency_key: researchKey() } },
                value => setPage(old => old && ({ ...old, items: old.items.map(v => v.id === value.id ? value : v) })))}>{t.publish}</button>
        </article>)}
        {page && <nav className="actions" aria-label={t.outbox}><button type="button" disabled={actions.locked || page.offset === 0} onClick={() => load(Math.max(0, page.offset - 1))}>{t.previous}</button>
            <button type="button" disabled={actions.locked || page.offset + page.limit >= page.total} onClick={() => load(page.offset + page.limit)}>{t.next}</button></nav>}
    </details>;
}
