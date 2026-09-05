import { useState } from 'react';
import type { BridgeStatus, UiBridge } from '../bridge/types';
import type { Catalog } from './i18n';
export function Onboarding({ status, bridge, t, refresh, onError }: {
    status: BridgeStatus;
    bridge: UiBridge;
    t: Catalog;
    refresh: () => Promise<void>;
    onError: (error: unknown) => void;
}) {
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);
    async function run(op: 'engine.choose' | 'engine.verify' | 'engine.start') {
        setBusy(true);
        try {
            await bridge.request(op === 'engine.start' ? { op, fingerprint: status.engine!.fingerprint, consent: true } : { op });
            setConsent(false);
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
    {status.engine && <><dl><dt>{t.version}</dt><dd>{status.engine.version}</dd><dt>{t.payload}</dt><dd>{status.engine.files}</dd><dt>{t.fingerprint}</dt><dd className="fingerprint">{status.engine.fingerprint}</dd></dl><p>{t.changed}</p><label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>{t.consent}</label><button className="primary" disabled={busy || !consent} onClick={() => void run('engine.start')}>{t.start}</button></>}
  </section>;
}
