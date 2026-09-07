import type { EvidenceTextView, Locale, SourceIdentity } from './types';
import { catalog } from '../ui/i18n';
import { identityKey } from '../sources/resolver';
import { OriginalAttachmentContent, type OriginalReader } from './original-view';

export type TextAttachmentOpener = (view: EvidenceTextView, read: (offset: number) => Promise<EvidenceTextView>, readOriginal: OriginalReader) => Promise<void>;
const HTML = 'http://www.w3.org/1999/xhtml';

/** Owns the verified original representation and its separately labeled extracted excerpt. */
export class TextAttachmentViews {
    #views = new Map<HTMLDialogElement, { window: Window; identity: SourceIdentity; source: string; close: () => void }>();
    #epoch = 0;
    #windows = new WeakMap<Window, number>();
    constructor(private crypto: Crypto, private report: (error: unknown) => void) {}

    opener(window: Window, locale: Locale): TextAttachmentOpener {
        const epoch = this.#epoch, windowEpoch = this.#windows.get(window) ?? 0;
        return async (initial, read, readOriginal) => {
            if (epoch !== this.#epoch || windowEpoch !== (this.#windows.get(window) ?? 0) || window.closed) throw new Error('VIEW_CLOSED');
            const doc = window.document, d = catalog(locale).evidence;
            const previous = doc.activeElement as HTMLElement | null;
            const element = <K extends keyof HTMLElementTagNameMap>(tag: K) => doc.createElementNS(HTML, tag) as HTMLElementTagNameMap[K];
            const dialog = element('dialog'); dialog.className = 'evidra-text-attachment';
            dialog.setAttribute('aria-label', d.textViewTitle);
            dialog.style.cssText = 'inline-size:min(72rem,90vw);max-block-size:90vh;padding:1.25rem;box-sizing:border-box;overflow:auto;color:CanvasText;background:Canvas;';
            const title = element('h2'); title.textContent = initial.title;
            const explanation = element('p'); explanation.textContent = catalog(locale).original.excerptHelp;
            const identity = element('p'); identity.textContent = `${initial.evidence.content_key} · ${initial.media_type}`;
            const details = element('details'), summary = element('summary'), hash = element('code');
            summary.textContent = d.textFileVersion; hash.textContent = initial.evidence.document_sha256;
            hash.style.overflowWrap = 'anywhere'; details.append(summary, hash);
            const status = element('p'); status.setAttribute('role', 'status');
            const error = element('p'); error.setAttribute('role', 'alert');
            const body = element('pre'); body.className = 'evidra-original-text'; body.tabIndex = 0;
            body.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-block-size:55vh;overflow:auto;padding:.75rem;font:inherit;line-height:1.6;border:1px solid GrayText;';
            const actions = element('div'); actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:.75rem;';
            const back = element('button'), next = element('button'), close = element('button');
            back.type = next.type = close.type = 'button';
            back.textContent = d.textPrevious; next.textContent = d.textNext; close.textContent = d.textClose;
            const excerpt = element('details'), excerptTitle = element('summary'); excerptTitle.textContent = catalog(locale).original.excerpt;
            const textActions = element('div'); textActions.style.cssText = 'display:flex;flex-wrap:wrap;gap:.75rem'; textActions.append(back, next);
            excerpt.append(excerptTitle, explanation, status, error, body, textActions);
            actions.append(close); dialog.append(title, identity, details, excerpt, actions);
            let current = initial, active = true, busy = false, invalidation: unknown = null;
            const invalidated = (failure: unknown) => {
                invalidation = failure; body.replaceChildren(); status.textContent = ''; back.disabled = next.disabled = true;
                original.invalidate(); this.report(failure);
            };
            const original = new OriginalAttachmentContent(window, this.crypto, locale, initial.evidence, readOriginal,
                () => { if (!active || window.closed) throw new Error('VIEW_CLOSED'); if (invalidation) throw invalidation; }, invalidated);
            excerpt.before(original.element);
            const cleanup = () => {
                if (!active) return;
                active = false; dialog.removeEventListener('close', cleanup); window.removeEventListener('unload', cleanup);
                back.removeEventListener('click', previousText); next.removeEventListener('click', nextText); close.removeEventListener('click', closeView);
                original.close(); body.replaceChildren(); dialog.remove(); this.#views.delete(dialog);
                if (previous?.isConnected) previous.focus();
            };
            const render = (view: EvidenceTextView) => {
                const chars = [...view.text], start = Math.max(0, view.evidence.start - view.offset), end = Math.min(chars.length, view.evidence.end - view.offset);
                body.replaceChildren();
                if (start < end) {
                    const mark = element('mark'); mark.textContent = chars.slice(start, end).join('');
                    body.append(doc.createTextNode(chars.slice(0, start).join('')), mark, doc.createTextNode(chars.slice(end).join('')));
                } else body.textContent = view.text;
                current = view;
                status.textContent = `${d.offsets}: ${view.offset}–${view.offset + chars.length} / ${view.total}`;
                back.disabled = view.offset === 0; next.disabled = view.offset + chars.length >= view.total;
                body.scrollTop = 0;
                body.querySelector('mark')?.scrollIntoView({ block: 'center', behavior: 'instant' });
            };
            const load = async (offset: number) => {
                if (!active || busy || invalidation) return;
                busy = true; back.disabled = next.disabled = true; error.textContent = ''; status.textContent = d.pending;
                try {
                    const view = await read(offset);
                    if (active && !invalidation) render(view);
                } catch (failure) {
                    if (active) {
                        invalidated(failure);
                        const code = failure instanceof Error && /^[A-Z_]{1,80}$/.test(failure.message) ? failure.message : 'OPERATION_FAILED';
                        const label = d.reasons[code as keyof typeof d.reasons];
                        error.textContent = label ? `${label} (${code})` : code;
                    }
                } finally { busy = false; }
            };
            const previousText = () => { void load(Math.max(0, current.offset - 16000)); };
            const nextText = () => { void load(current.offset + [...current.text].length); };
            const closeView = () => { dialog.close(); cleanup(); };
            back.addEventListener('click', previousText); next.addEventListener('click', nextText); close.addEventListener('click', closeView);
            dialog.addEventListener('close', cleanup); window.addEventListener('unload', cleanup, { once: true });
            this.#views.set(dialog, { window, identity: initial.evidence.source_identity, source: initial.evidence.source_id, close: closeView });
            try {
                doc.documentElement.append(dialog); dialog.showModal(); render(initial); close.focus();
                await original.initialize();
            } catch (failure) { cleanup(); throw failure; }
        };
    }

    closeWindow(window: Window) {
        this.#windows.set(window, (this.#windows.get(window) ?? 0) + 1);
        for (const view of [...this.#views.values()]) if (view.window === window) view.close();
    }

    invalidate(identities: SourceIdentity[]) {
        ++this.#epoch;
        const keys = new Set(identities.map(identityKey));
        for (const view of [...this.#views.values()]) if (keys.has(identityKey(view.identity))) view.close();
    }

    revoke(source: string) { ++this.#epoch; for (const view of [...this.#views.values()]) if (view.source === source) view.close(); }

    shutdown() { ++this.#epoch; for (const view of [...this.#views.values()]) view.close(); }
}
