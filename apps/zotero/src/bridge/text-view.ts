import type { EvidenceTextView, Locale } from './types';
import { catalog } from '../ui/i18n';

export type TextAttachmentOpener = (view: EvidenceTextView, read: (offset: number) => Promise<EvidenceTextView>) => Promise<void>;
const HTML = 'http://www.w3.org/1999/xhtml';

/** Native read-only text from a hash-verified original attachment; never a markup renderer. */
export class TextAttachmentViews {
    #views = new Map<HTMLDialogElement, { window: Window; close: () => void }>();

    opener(window: Window, locale: Locale): TextAttachmentOpener {
        return async (initial, read) => {
            const doc = window.document, d = catalog(locale).evidence;
            const previous = doc.activeElement as HTMLElement | null;
            const element = <K extends keyof HTMLElementTagNameMap>(tag: K) => doc.createElementNS(HTML, tag) as HTMLElementTagNameMap[K];
            const dialog = element('dialog'); dialog.className = 'evidra-text-attachment';
            dialog.setAttribute('aria-label', d.textViewTitle);
            dialog.style.cssText = 'inline-size:min(72rem,90vw);max-block-size:90vh;padding:1.25rem;box-sizing:border-box;overflow:auto;color:CanvasText;background:Canvas;';
            const title = element('h2'); title.textContent = initial.title;
            const explanation = element('p'); explanation.textContent = d.textOnly;
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
            actions.append(back, next, close); dialog.append(title, explanation, identity, details, status, error, body, actions);
            let current = initial, active = true, busy = false;
            const cleanup = () => {
                if (!active) return;
                active = false; dialog.removeEventListener('close', cleanup); window.removeEventListener('unload', cleanup);
                back.removeEventListener('click', previousText); next.removeEventListener('click', nextText); close.removeEventListener('click', closeView);
                body.replaceChildren(); dialog.remove(); this.#views.delete(dialog);
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
                if (!active || busy) return;
                busy = true; back.disabled = next.disabled = true; error.textContent = ''; status.textContent = d.pending;
                try {
                    const view = await read(offset);
                    if (active) render(view);
                } catch (failure) {
                    if (active) {
                        body.replaceChildren(); status.textContent = '';
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
            this.#views.set(dialog, { window, close: closeView });
            try {
                doc.documentElement.append(dialog); dialog.showModal(); render(initial); body.focus();
            } catch (failure) { cleanup(); throw failure; }
        };
    }

    closeWindow(window: Window) {
        for (const view of [...this.#views.values()]) if (view.window === window) view.close();
    }

    shutdown() { for (const view of [...this.#views.values()]) view.close(); }
}
