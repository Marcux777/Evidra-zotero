import { useEffect, useRef, useState } from 'react';
import type { BridgeStatus, Locale, Mode, Notebook, NotebookPage, Theme, UiBridge } from '../bridge/types';
import { catalog } from './i18n';
import { Onboarding } from './onboarding';
export function App({ bridge, compact = false }: {
    bridge: UiBridge;
    compact?: boolean;
}) {
    const [status, setStatus] = useState<BridgeStatus | null>(null), [page, setPage] = useState<NotebookPage>({ items: [], offset: 0, limit: 50, total: 0 });
    const [name, setName] = useState(''), [invalid, setInvalid] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [locale, setLocale] = useState<Locale>('pt-BR'), [theme, setTheme] = useState<Theme>('system'), [mode, setMode] = useState<Mode>('LOCAL');
    const input = useRef<HTMLInputElement>(null), heading = useRef<HTMLHeadingElement>(null), key = useRef<string | null>(null);
    const t = catalog(locale);
    function onError(error: unknown) { setError(error instanceof Error ? error.message : 'OPERATION_FAILED'); }
    async function load(offset = page.offset) { setPage(await bridge.request({ op: 'notebook.list', offset }) as NotebookPage); }
    async function refresh() { const next = await bridge.request({ op: 'status' }) as BridgeStatus; setStatus(next);setError(next.error??''); setLocale(next.locale); setTheme(next.theme); setMode(next.mode); if (next.state === 'running')
        await load(); }
    useEffect(() => { void refresh().catch(onError); }, []);
    useEffect(()=>{let active=true;const timer=setInterval(()=>{void bridge.request({op:'status'}).then(value=>{if(active){const next=value as BridgeStatus;setStatus(next);if(next.error)setError(next.error);}},error=>{if(active)onError(error);});},10000);return()=>{active=false;clearInterval(timer);};},[bridge]);
    useEffect(() => { document.documentElement.lang = locale; document.documentElement.dataset.theme = theme; document.title = status?.selected?.name ?? 'Evidra'; }, [locale, theme, status?.selected?.name]);
    async function select(id: string) { setBusy(true); setError(''); try {
        const selected = await bridge.request({ op: 'notebook.select', id }) as Notebook;
        setStatus(old => old && ({ ...old, selected }));
        requestAnimationFrame(() => heading.current?.focus());
    }
    catch (error) {
        onError(error);
    }
    finally {
        setBusy(false);
    } }
    async function create(event: React.FormEvent) { event.preventDefault(); if (!name.trim() || name.trim().length > 200) {
        setInvalid(true);
        input.current?.focus();
        return;
    } setBusy(true); setInvalid(false); setError(''); try {
        key.current ??= crypto.randomUUID();
        const created = await bridge.request({ op: 'notebook.create', name: name.trim(), idempotency_key: key.current }) as Notebook;
        const selected = await bridge.request({op:'notebook.select',id:created.id}) as Notebook;
        setStatus(old=>old&&({...old,selected}));
        requestAnimationFrame(()=>heading.current?.focus());
        await load(0);
        setName('');
        key.current = null;
    }
    catch (error) {
        onError(error);
    }
    finally {
        setBusy(false);
    } }
    async function preferences() { setBusy(true); try {
        await bridge.request({ op: 'preferences', locale, theme, mode });
        await refresh();
        setNotice(t.saved);
    }
    catch (error) {
        onError(error);
    }
    finally {
        setBusy(false);
    } }
    return <><a className="skip" href="#main">{t.skip}</a><header className="top"><strong>Evidra</strong><span role="status">{status ? t[status.state] : t.loading}</span><button onClick={() => void bridge.request({ op: compact ? 'workspace.open' : 'workspace.close' }).catch(onError)}>{compact ? t.reopen : t.close}</button></header>
    <div role="status" className="notice">{notice}</div>{error && <p role="alert" className="error">{t.error}: {error}</p>}
    <div className="layout"><aside><h2>{t.notebooks}</h2>{page.items.length === 0 && <p>{t.empty}</p>}<ul className="notebooks">{page.items.map(n => <li key={n.id}><button disabled={busy} aria-current={status?.selected?.id === n.id ? 'page' : undefined} onClick={() => void select(n.id)}>{n.name}</button></li>)}</ul>
      {page.total > page.limit && <nav aria-label={t.notebooks} className="actions"><button disabled={busy || page.offset === 0} onClick={() => void load(Math.max(0, page.offset - page.limit)).catch(onError)}>{t.previous}</button><button disabled={busy || page.offset + page.limit >= page.total} onClick={() => void load(page.offset + page.limit).catch(onError)}>{t.next}</button></nav>}
      <details><summary>{t.settings}</summary><label>{t.language}<select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option></select></label><label>{t.theme}<select value={theme} onChange={e => setTheme(e.target.value as Theme)}><option value="system">{t.system}</option><option value="light">{t.light}</option><option value="dark">{t.dark}</option></select></label><label>{t.mode}<select value={mode} onChange={e => setMode(e.target.value as Mode)}><option value="LOCAL">{t.local}</option><option value="API">{t.api}</option></select></label>{mode === 'API' && <p>{t.apiBlocked}</p>}<button disabled={busy} onClick={() => void preferences()}>{t.apply}</button></details></aside>
      <main id="main"><h1 ref={heading} tabIndex={-1}>{status?.selected?.name ?? t.welcome}</h1>
      {status?.selected ? <><dl className="metrics"><div><dt>{t.revision}</dt><dd>{status.selected.revision}</dd></div><div><dt>{t.documents}</dt><dd>0 · {t.sourceNone}</dd></div><div><dt>{t.mode}</dt><dd>{status.mode}</dd></div><div><dt>{t.model}</dt><dd>{t.noModel}</dd></div><div><dt>{t.cost}</dt><dd>{t.unknownCost}</dd></div><div><dt>{t.job}</dt><dd>{t.idle}</dd></div></dl><p>{t.manual}</p></> : <p>{t.intro}</p>}
      {status?.state === 'running' ? <form onSubmit={e => void create(e)} noValidate><h2>{t.create}</h2><label htmlFor="name">{t.name}</label><input id="name" ref={input} name="name" value={name} maxLength={200} aria-invalid={invalid} aria-describedby={invalid ? 'name-error' : undefined} onChange={e => { setName(e.target.value); key.current = null; }}/>{invalid && <p id="name-error">{t.required}</p>}<button className="primary" disabled={busy} type="submit">{t.create}</button></form> : status && <Onboarding status={status} bridge={bridge} t={t} refresh={refresh} onError={onError}/>}
      </main></div></>;
}
