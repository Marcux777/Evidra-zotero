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
    const dataVersion = useRef(0), pageOffset = useRef(0), actionBusy = useRef(false);
    const t = catalog(locale);
    function onError(error: unknown) { setError(error instanceof Error ? error.message : 'OPERATION_FAILED'); }
    function beginAction() { ++dataVersion.current; actionBusy.current = true; setBusy(true); }
    function endAction() { actionBusy.current = false; setBusy(false); }
    async function load(offset: number) {
        const version = ++dataVersion.current;
        try {
            const next = await bridge.request({ op: 'notebook.list', offset }) as NotebookPage;
            if (version !== dataVersion.current) return;
            pageOffset.current = next.offset;
            setPage(next);
        }
        catch (error) { if (version === dataVersion.current) throw error; }
    }
    async function refresh(applyPreferences = true) {
        const version = ++dataVersion.current, offset = pageOffset.current;
        try {
            const next = await bridge.request({ op: 'status' }) as BridgeStatus;
            if (version !== dataVersion.current) return;
            const nextPage = next.state === 'running'
                ? await bridge.request({ op: 'notebook.list', offset }) as NotebookPage
                : { items: [], offset: 0, limit: 50, total: 0 };
            if (version !== dataVersion.current) return;
            setStatus(next); setPage(nextPage); pageOffset.current = nextPage.offset;
            if (applyPreferences || next.error) setError(next.error ?? '');
            if (applyPreferences) { setLocale(next.locale); setTheme(next.theme); setMode(next.mode); }
        }
        catch (error) { if (version === dataVersion.current) throw error; }
    }
    useEffect(() => {
        let active = true, polling = false;
        void refresh().catch(onError);
        const timer = setInterval(() => {
            if (!active || polling || actionBusy.current) return;
            polling = true;
            void refresh(false).catch(onError).finally(() => { polling = false; });
        }, 10000);
        return () => { active = false; ++dataVersion.current; clearInterval(timer); };
    }, [bridge]);
    useEffect(() => { document.documentElement.lang = locale; document.documentElement.dataset.theme = theme; document.title = status?.selected?.name ?? 'Evidra'; }, [locale, theme, status?.selected?.name]);
    async function navigate(offset: number) { beginAction(); try { await load(offset); } catch (error) { onError(error); } finally { endAction(); } }
    async function select(id: string) { beginAction(); setError(''); try {
        const selected = await bridge.request({ op: 'notebook.select', id }) as Notebook;
        setStatus(old => old && ({ ...old, selected }));
        requestAnimationFrame(() => heading.current?.focus());
    }
    catch (error) {
        onError(error);
    }
    finally {
        endAction();
    } }
    async function create() { if (actionBusy.current) return; if (!name.trim() || name.trim().length > 200) {
        setInvalid(true);
        input.current?.focus();
        return;
    } beginAction(); setInvalid(false); setError(''); try {
        key.current ??= Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
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
        endAction();
    } }
    async function preferences() { beginAction(); try {
        await bridge.request({ op: 'preferences', locale, theme, mode });
        await refresh();
        setNotice(t.saved);
    }
    catch (error) {
        onError(error);
    }
    finally {
        endAction();
    } }
    return <><a className="skip" href="#main">{t.skip}</a><header className="top"><strong>Evidra</strong><span role="status">{status ? t[status.state] : t.loading}</span><button onClick={() => void bridge.request({ op: compact ? 'workspace.open' : 'workspace.close' }).catch(onError)}>{compact ? t.reopen : t.close}</button></header>
    <div role="status" className="notice">{notice}</div>{error && <p role="alert" className="error">{t.error}: {error}</p>}
    <div className="layout"><aside><h2>{t.notebooks}</h2>{page.items.length === 0 && <p>{t.empty}</p>}<ul className="notebooks">{page.items.map(n => <li key={n.id}><button disabled={busy} aria-current={status?.selected?.id === n.id ? 'page' : undefined} onClick={() => void select(n.id)}>{n.name}</button></li>)}</ul>
      {page.total > page.limit && <nav aria-label={t.notebooks} className="actions"><button disabled={busy || page.offset === 0} onClick={() => void navigate(Math.max(0, page.offset - page.limit))}>{t.previous}</button><button disabled={busy || page.offset + page.limit >= page.total} onClick={() => void navigate(page.offset + page.limit)}>{t.next}</button></nav>}
      <details><summary>{t.settings}</summary><label>{t.language}<select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option></select></label><label>{t.theme}<select value={theme} onChange={e => setTheme(e.target.value as Theme)}><option value="system">{t.system}</option><option value="light">{t.light}</option><option value="dark">{t.dark}</option></select></label><label>{t.mode}<select value={mode} onChange={e => setMode(e.target.value as Mode)}><option value="LOCAL">{t.local}</option><option value="API">{t.api}</option></select></label>{mode === 'API' && <p>{t.apiBlocked}</p>}<button disabled={busy} onClick={() => void preferences()}>{t.apply}</button></details></aside>
      <main id="main"><h1 ref={heading} tabIndex={-1}>{status?.selected?.name ?? t.welcome}</h1>
      {status?.selected ? <><dl className="metrics"><div><dt>{t.revision}</dt><dd>{status.selected.revision}</dd></div><div><dt>{t.documents}</dt><dd>0 · {t.sourceNone}</dd></div><div><dt>{t.mode}</dt><dd>{status.mode}</dd></div><div><dt>{t.model}</dt><dd>{t.noModel}</dd></div><div><dt>{t.cost}</dt><dd>{t.unknownCost}</dd></div><div><dt>{t.job}</dt><dd>{t.idle}</dd></div></dl><p>{t.manual}</p></> : <p>{t.intro}</p>}
      {status?.state === 'running' ? <form aria-labelledby="create-heading" noValidate><h2 id="create-heading">{t.create}</h2><label htmlFor="name">{t.name}</label><input id="name" ref={input} name="name" value={name} maxLength={200} disabled={busy} aria-invalid={invalid} aria-describedby={invalid ? 'name-error' : undefined} onChange={e => { setName(e.target.value); key.current = null; }} onKeyDown={event => {
          // Gecko can end composition before its final keydown; 229 still identifies IME input.
          if (event.key !== 'Enter' || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
          event.preventDefault();
          if (!event.repeat) void create();
      }}/>{invalid && <p id="name-error">{t.required}</p>}<button className="primary" disabled={busy} type="button" onClick={() => void create()}>{t.create}</button></form> : status && <Onboarding status={status} bridge={bridge} t={t} refresh={refresh} onError={onError}/>}
      </main></div></>;
}
