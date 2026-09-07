import { useRef, useState } from 'react';
import type { Locale, ModelPage, ProfilePage, ProfileSpec, ProviderProfile, ProviderSettings as Settings,
    SecretReceipt, UiBridge } from '../bridge/types';
import { catalog } from './i18n';
import { Diagnostic } from './Diagnostic';

export const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
const capabilityNames = ['generation', 'streaming', 'images', 'structured_output', 'embeddings', 'token_counting', 'cancellation', 'catalog'] as const;
const initial: ProfileSpec = { adapter: 'ollama', mode: 'LOCAL', purpose: 'generation', base_url: 'http://127.0.0.1:11434', model: '', digest: null, cloud: false,
    capabilities: Object.fromEntries(capabilityNames.map(name => [name, { supported: ['generation', 'streaming', 'cancellation', 'catalog'].includes(name),
        provenance: ['generation', 'streaming', 'cancellation', 'catalog'].includes(name) ? 'USER_DECLARED' : 'UNSUPPORTED', source: null }])) };
const endpoints: Partial<Record<ProfileSpec['adapter'], string>> = { ollama: 'http://127.0.0.1:11434', lm_studio: 'http://127.0.0.1:1234/v1',
    openai: 'https://api.openai.com/v1', anthropic: 'https://api.anthropic.com/v1', gemini: 'https://generativelanguage.googleapis.com/v1beta' };

export function ProviderSettings({ bridge, locale, onChanged }: { bridge: UiBridge; locale: Locale; onChanged?: () => void }) {
    const t = catalog(locale), c = t.chat;
    const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [page, setPage] = useState<ProfilePage | null>(null), [profile, setProfile] = useState<ProviderProfile | null>(null);
    const [id, setId] = useState(''), [spec, setSpec] = useState<ProfileSpec>(initial), [models, setModels] = useState<ModelPage | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null), [block, setBlock] = useState(true);
    const [secret, setSecret] = useState(''), [memory, setMemory] = useState(true), [secretReceipt, setSecretReceipt] = useState<SecretReceipt | null>(null);
    const [priceVersion, setPriceVersion] = useState(''), [currency, setCurrency] = useState('USD'), [date, setDate] = useState(''), [priceSource, setPriceSource] = useState('');
    const [inputPrice, setInputPrice] = useState(''), [outputPrice, setOutputPrice] = useState('');
    const running = useRef(false), keys = useRef(new Map<string, { content: string; key: string }>());
    function key(target: string, value: unknown) {
        const content = JSON.stringify(value), previous = keys.current.get(target);
        if (previous?.content === content) return previous.key;
        const key = newKey(); keys.current.set(target, { content, key }); return key;
    }
    async function action(work: () => Promise<void>) {
        if (running.current) return;
        running.current = true; setBusy(true); setError(''); setNotice('');
        try { await work(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'OPERATION_FAILED'); }
        finally { running.current = false; setBusy(false); }
    }
    async function load(offset = 0) {
        const profiles = await bridge.request({ op: 'provider.list', offset }) as ProfilePage;
        const value = await bridge.request({ op: 'provider.settings' }) as Settings;
        setPage(profiles); setSettings(value); setBlock(value.block_paid_apis ?? true);
    }
    async function select(value: ProviderProfile) {
        setProfile(value); setId(value.id); setModels(null); setSecret(''); setSecretReceipt(null);
        const { id: _, revision: __, paused_code: ___, ...configuration } = value;
        setSpec({ ...configuration, digest: configuration.digest ?? null });
        setSecretReceipt(await bridge.request({ op: 'provider.secret', profile_id: value.id }) as SecretReceipt);
    }
    function edit(value: Partial<ProfileSpec>) { setSpec(old => ({ ...old, ...value })); setModels(null); }
    async function save() {
        const body = { spec, expected_revision: profile?.revision ?? 0 };
        const saved = await bridge.request({ op: 'provider.write', profile_id: id, request: { ...body, idempotency_key: key('profile', { id, ...body }) } }) as ProviderProfile;
        keys.current.delete('profile'); await load(page?.offset ?? 0); await select(saved); onChanged?.(); setNotice(c.saved);
    }
    return <section className="provider-settings" aria-label={c.models}>
        <button type="button" aria-expanded={open} onClick={() => { setOpen(!open); if (!open) void action(() => load()); }}>{c.models}</button>
        {open && <div className="settings-body" aria-busy={busy}>
            {error && <p role="alert" className="source-error"><Diagnostic code={error} locale={locale}/></p>}<p role="status">{notice}</p>
            <p>{c.localTrust}</p>
            <label className="source-check"><input type="checkbox" checked={block} disabled={busy} onChange={e => setBlock(e.target.checked)}/>{c.blockPaid}</label>
            <button type="button" disabled={busy || !settings} onClick={() => void action(async () => {
                const body = { block_paid_apis: block, expected_revision: settings!.revision ?? 0 };
                setSettings(await bridge.request({ op: 'provider.settings.write', request: { ...body, idempotency_key: key('privacy', body) } }) as Settings);
                keys.current.delete('privacy'); setNotice(c.saved); onChanged?.();
            })}>{c.savePrivacy}</button>
            <ul className="compact-list">{page?.items.map(value => <li key={value.id}><button type="button" disabled={busy} aria-pressed={profile?.id === value.id} onClick={() => void action(() => select(value))}>{value.id} · {value.mode} · {value.model}</button></li>)}</ul>
            {page && page.total > page.limit && <nav className="actions" aria-label={c.models}><button disabled={busy || !page.offset} onClick={() => void action(() => load(Math.max(0, page.offset - page.limit)))}>{t.previous}</button><span>{page.offset + page.items.length} / {page.total}</span><button disabled={busy || page.offset + page.items.length >= page.total} onClick={() => void action(() => load(page.offset + page.items.length))}>{t.next}</button></nav>}
            <button type="button" disabled={busy} onClick={() => { setProfile(null); setId(''); setSpec(initial); setModels(null); setSecret(''); setSecretReceipt(null); }}>{c.newProfile}</button>
            <fieldset disabled={busy}><legend>{c.models}</legend><div className="source-filters">
                <label>{c.profileId}<input name="provider_id" value={id} disabled={!!profile} maxLength={100} onChange={e => setId(e.target.value)}/></label>
                <label>{c.adapter}<select name="provider_adapter" value={spec.adapter} onChange={e => {
                    const adapter = e.target.value as ProfileSpec['adapter'];
                    edit({ adapter, base_url: endpoints[adapter] ?? '', mode: ['ollama', 'lm_studio'].includes(adapter) ? 'LOCAL' : 'API', purpose: 'generation' });
                }}>{['ollama', 'lm_studio', 'openai', 'anthropic', 'gemini', 'openai_compatible'].map(a => <option key={a} value={a}>{a}</option>)}</select></label>
                <label>{c.mode}<select name="provider_mode" value={spec.mode} onChange={e => edit({ mode: e.target.value as ProfileSpec['mode'] })}><option>LOCAL</option><option>API</option></select></label>
                <label>{c.purpose}<select name="provider_purpose" value={spec.purpose} onChange={e => {
                    const purpose = e.target.value as ProfileSpec['purpose'];
                    edit({ purpose, capabilities: { ...spec.capabilities, generation: { supported: purpose === 'generation', provenance: purpose === 'generation' ? 'USER_DECLARED' : 'UNSUPPORTED', source: null }, embeddings: { supported: purpose === 'embedding', provenance: purpose === 'embedding' ? 'USER_DECLARED' : 'UNSUPPORTED', source: null } } });
                }}><option value="generation">{c.generation}</option><option value="embedding" disabled={spec.mode !== 'LOCAL' || !['ollama', 'lm_studio'].includes(spec.adapter)}>{c.embeddings}</option></select></label>
            </div>
            <label>{c.endpoint}<input name="provider_endpoint" value={spec.base_url} maxLength={2000} onChange={e => edit({ base_url: e.target.value })}/></label>
            <label>{c.modelId}<input name="provider_model" value={spec.model} maxLength={200} onChange={e => edit({ model: e.target.value })}/></label>
            <label>{c.digest}<input name="provider_digest" value={spec.digest ?? ''} onChange={e => edit({ digest: e.target.value || null })}/></label>
            <fieldset><legend>{c.capabilities}</legend><p>{c.capabilityHelp}</p><div className="source-filters">{capabilityNames.map(name => <label key={name} className="source-check"><input type="checkbox" name={`capability_${name}`} checked={spec.capabilities[name]?.supported ?? false} onChange={e => edit({ capabilities: { ...spec.capabilities, [name]: { supported: e.target.checked, provenance: e.target.checked ? 'USER_DECLARED' : 'UNSUPPORTED', source: null } } })}/>{c.capability[name]} <small>{spec.capabilities[name]?.provenance ?? 'UNSUPPORTED'}</small></label>)}</div></fieldset>
            <button type="button" className="primary" disabled={!/^[a-zA-Z0-9_-]{1,100}$/.test(id) || !spec.model || !spec.base_url} onClick={() => void action(save)}>{c.saveProfile}</button>
            </fieldset>
            {profile && <><p>{profile.id} · {profile.model} · {t.revision} {profile.revision} {profile.paused_code}</p>
                <button type="button" disabled={busy} onClick={() => void action(async () => setModels(await bridge.request({ op: 'provider.models', profile_id: profile.id, offset: 0 }) as ModelPage))}>{c.discover}</button>
                {models && <><ul className="compact-list">{models.items.map(m => <li key={m.model}><button type="button" disabled={busy || m.cloud} onClick={() => edit({ model: m.model, digest: m.digest ?? null })}>{m.model}{m.cloud ? ' · cloud' : ''}</button></li>)}</ul>
                    {models.total > models.limit && <nav className="actions" aria-label={c.discover}><button disabled={busy || !models.offset} onClick={() => void action(async () => setModels(await bridge.request({ op: 'provider.models', profile_id: profile.id, offset: Math.max(0, models.offset - models.limit) }) as ModelPage))}>{t.previous}</button><span>{models.offset + models.items.length} / {models.total}</span><button disabled={busy || models.offset + models.items.length >= models.total} onClick={() => void action(async () => setModels(await bridge.request({ op: 'provider.models', profile_id: profile.id, offset: models.offset + models.items.length }) as ModelPage))}>{t.next}</button></nav>}</>}
                {profile.paused_code && <button type="button" disabled={busy} onClick={() => void action(async () => {
                    const body = { expected_revision: profile.revision };
                    const saved = await bridge.request({ op: 'provider.resume', profile_id: profile.id, request: { ...body, idempotency_key: key('resume', body) } }) as ProviderProfile;
                    keys.current.delete('resume'); await select(saved); await load(); onChanged?.();
                })}>{c.resumeProfile}</button>}
                {profile.mode === 'API' && <fieldset disabled={busy}><legend>{c.apiKey}</legend><p>{c.secretState}: {secretReceipt?.storage ?? c.unknown}</p>
                    <label>{c.apiKey}<input name="provider_secret" type="password" autoComplete="off" value={secret} onChange={e => { setSecret(e.target.value); keys.current.delete('secret'); }}/></label>
                    <label className="source-check"><input type="checkbox" checked={memory} onChange={e => setMemory(e.target.checked)}/>{c.memoryOnly}</label>
                    <button type="button" disabled={!secret || !secretReceipt} onClick={() => void action(async () => {
                        const body = { value: secret, memory_only: memory, expected_revision: secretReceipt!.revision };
                        setSecretReceipt(await bridge.request({ op: 'provider.secret.write', profile_id: profile.id, request: { ...body, idempotency_key: key('secret', body) } }) as SecretReceipt);
                        setSecret(''); keys.current.delete('secret'); setNotice(c.saved);
                    })}>{c.saveSecret}</button>
                    <button type="button" disabled={!secretReceipt} onClick={() => void action(async () => {
                        const body = { expected_revision: secretReceipt!.revision };
                        setSecretReceipt(await bridge.request({ op: 'provider.secret.delete', profile_id: profile.id, request: { ...body, idempotency_key: key('delete-secret', body) } }) as SecretReceipt);
                        keys.current.delete('delete-secret'); setSecret(''); setNotice(c.saved);
                    })}>{c.deleteSecret}</button>
                </fieldset>}
                <details><summary>{c.prices}</summary><fieldset disabled={busy}><legend>{profile.adapter} · {profile.model}</legend><div className="source-filters">
                    <label>{c.priceVersion}<input value={priceVersion} onChange={e => setPriceVersion(e.target.value)}/></label>
                    <label>{c.currency}<input value={currency} maxLength={3} onChange={e => setCurrency(e.target.value.toUpperCase())}/></label>
                    <label>{c.date}<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
                    <label>{c.priceSource}<input value={priceSource} onChange={e => setPriceSource(e.target.value)}/></label>
                    <label>{c.inputPrice}<input type="number" min="0" step="any" value={inputPrice} onChange={e => setInputPrice(e.target.value)}/></label>
                    <label>{c.outputPrice}<input type="number" min="0" step="any" value={outputPrice} onChange={e => setOutputPrice(e.target.value)}/></label>
                </div><button type="button" disabled={!priceVersion || !date || !priceSource || !inputPrice || !outputPrice} onClick={() => void action(async () => {
                    await bridge.request({ op: 'provider.price', request: { version: priceVersion, adapter: profile.adapter, model: profile.model, currency, effective_date: date,
                        source: priceSource, input_per_million: inputPrice, output_per_million: outputPrice } }); setNotice(c.saved);
                })}>{c.savePrice}</button></fieldset></details>
            </>}
        </div>}
    </section>;
}
