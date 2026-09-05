import { useEffect, useState } from 'react';
import type { BridgeStatus, UiBridge } from '../bridge/types';
import type { Catalog } from './i18n';
export function Onboarding({ status, bridge, t, refresh, onError }: {
    status: BridgeStatus;
    bridge: UiBridge;
    t: Catalog;
    refresh: () => Promise<void>;
    onError: (error: unknown) => void;
}) {
    const [consentedFingerprint, setConsentedFingerprint] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const fingerprint = status.engine?.fingerprint;
    const consent = !!fingerprint && consentedFingerprint === fingerprint;
    useEffect(() => { setConsentedFingerprint(null); }, [fingerprint, status.error]);
    async function run(op: 'engine.choose' | 'engine.verify' | 'engine.start') {
        const acknowledged = consentedFingerprint;
        if (op === 'engine.start' && (!acknowledged || acknowledged !== fingerprint))
            return;
        setBusy(true);
        setConsentedFingerprint(null);
        try {
            await bridge.request(op === 'engine.start' ? { op, fingerprint: acknowledged!, consent: true } : { op });
            await refresh();
        }
        catch (error) {
            onError(error);
        }
        finally {
            setBusy(false);
        }
    }
    return <section aria-labelledby="engine-title" className="onboarding"><h2 id="engine-title">{t.engine}</h2><p>{t.engineHelp}</p>
    <div className="actions"><button disabled={busy} onClick={() => void run('engine.choose')}>{t.choose}</button>{status.engine && <button disabled={busy} onClick={() => void run('engine.verify')}>{t.verify}</button>}</div>
    {status.engine && <><dl><dt>{t.version}</dt><dd>{status.engine.version}</dd><dt>{t.payload}</dt><dd>{status.engine.files}</dd><dt>{t.fingerprint}</dt><dd className="fingerprint">{status.engine.fingerprint}</dd></dl><p>{t.changed}</p><label className="consent"><input type="checkbox" checked={consent} disabled={busy} onChange={e => setConsentedFingerprint(e.target.checked ? status.engine!.fingerprint : null)}/>{t.consent}</label><button className="primary" disabled={busy || !consent} onClick={() => void run('engine.start')}>{t.start}</button></>}
  </section>;
}
