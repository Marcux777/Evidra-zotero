import type { Evidence, Locale, OriginalStructure, OriginalViewChunk } from './types';
import { catalog } from '../ui/i18n';
import { originalDocument, sha256 } from '../security/original';

export interface OriginalSelection { unit_index?: number | null; representation?: 'structure' | 'source'; offset?: number }
export type OriginalReader = (selection: OriginalSelection) => Promise<OriginalViewChunk>;
const HTML = 'http://www.w3.org/1999/xhtml';

/** Owns one original unit at a time; native callbacks never cross the React message bridge. */
export class OriginalAttachmentContent {
    readonly element: HTMLElement;
    #closed = false;
    #busy = false;
    #current: OriginalViewChunk | null = null;
    #frame: HTMLIFrameElement | null = null;
    #cancelFrame: (() => void) | null = null;
    #explanation: HTMLParagraphElement;
    #identity: HTMLParagraphElement;
    #target: HTMLParagraphElement;
    #status: HTMLParagraphElement;
    #error: HTMLParagraphElement;
    #source: HTMLPreElement;
    #limitations: HTMLUListElement;
    #incomplete: HTMLParagraphElement;
    #previous: HTMLButtonElement;
    #next: HTMLButtonElement;
    #inspect: HTMLButtonElement;
    #previousSource: HTMLButtonElement;
    #nextSource: HTMLButtonElement;
    #representation: 'structure' | 'source' = 'structure';

    constructor(private window: Window, private crypto: Crypto, private locale: Locale,
        private evidence: Evidence, private read: OriginalReader, private active: () => void,
        private failed: (failure: unknown) => void) {
        const d = catalog(locale).original, doc = window.document;
        const element = <K extends keyof HTMLElementTagNameMap>(tag: K) => doc.createElementNS(HTML, tag) as HTMLElementTagNameMap[K];
        this.element = element('section'); this.element.className = 'evidra-original-content';
        this.element.setAttribute('aria-label', d.title);
        this.#explanation = element('p');
        this.#identity = element('p'); this.#identity.className = 'evidra-original-unit'; this.#identity.style.overflowWrap = 'anywhere';
        this.#target = element('p'); this.#target.className = 'evidra-original-target';
        this.#status = element('p'); this.#status.className = 'evidra-original-status'; this.#status.setAttribute('role', 'status');
        this.#error = element('p'); this.#error.setAttribute('role', 'alert');
        this.#source = element('pre'); this.#source.className = 'evidra-original-source'; this.#source.tabIndex = 0;
        this.#source.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-block-size:50vh;overflow:auto;padding:.75rem;border:1px solid GrayText;';
        this.#incomplete = element('p');
        const details = element('details'), summary = element('summary'); summary.textContent = d.limitations;
        this.#limitations = element('ul'); this.#limitations.className = 'evidra-original-limitations'; this.#limitations.style.overflowWrap = 'anywhere';
        details.append(summary, this.#limitations);
        const controls = element('div'); controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:.75rem';
        const button = (name: string, label: string, action: () => void) => {
            const value = element('button'); value.type = 'button'; value.className = 'evidra-original-' + name;
            value.textContent = label; value.addEventListener('click', action); controls.append(value); return value;
        };
        this.#previous = button('previous-unit', d.previousUnit, () => { if (this.#current) void this.#navigate({ unit_index: this.#current.unit_index - 1 }); });
        this.#next = button('next-unit', d.nextUnit, () => { if (this.#current) void this.#navigate({ unit_index: this.#current.unit_index + 1 }); });
        this.#inspect = button('toggle-source', d.inspect, () => { if (this.#current) void this.#navigate({ unit_index: this.#current.unit_index, representation: this.#representation === 'structure' ? 'source' : 'structure' }); });
        this.#previousSource = button('previous-source', d.previousSource, () => { if (this.#current) void this.#navigate({ unit_index: this.#current.unit_index, representation: this.#representation, offset: Math.max(0, this.#current.offset - 64000) }); });
        this.#nextSource = button('next-source', d.nextSource, () => { if (this.#current) void this.#navigate({ unit_index: this.#current.unit_index, representation: this.#representation, offset: this.#current.offset + [...this.#current.content].length }); });
        this.element.append(this.#explanation, this.#identity, this.#target, controls, this.#status, this.#error, this.#source, this.#incomplete, details);
        this.#controls(true);
    }

    #check() { if (this.#closed) throw new Error('VIEW_CLOSED'); this.active(); }
    #controls(disabled: boolean) {
        for (const button of [this.#previous, this.#next, this.#inspect, this.#previousSource, this.#nextSource]) button.disabled = disabled;
    }
    #clear() {
        this.#cancelFrame?.(); this.#cancelFrame = null;
        this.#frame?.remove(); this.#frame?.removeAttribute('srcdoc'); this.#frame = null;
        this.#source.textContent = ''; this.#limitations.replaceChildren(); this.#incomplete.textContent = '';
    }
    close() { this.#closed = true; this.#clear(); this.element.remove(); }
    invalidate() { this.#clear(); this.#controls(true); this.#status.textContent = ''; }

    async initialize() { await this.#load({}); }
    async #navigate(selection: OriginalSelection) {
        if (this.#busy || this.#closed) return;
        try { await this.#load(selection); }
        catch (failure) {
            if (this.#closed) return;
            this.failed(failure);
            this.#clear(); this.#controls(true); this.#status.textContent = '';
            const code = failure instanceof Error && /^[A-Z_]{1,80}$/.test(failure.message) ? failure.message : 'OPERATION_FAILED';
            const reasons = catalog(this.locale).evidence.reasons;
            const label = reasons[code as keyof typeof reasons]; this.#error.textContent = label ? `${label} (${code})` : code;
        }
    }

    #validate(chunk: OriginalViewChunk, offset: number) {
        if (chunk.evidence.id !== this.evidence.id || chunk.evidence.document_sha256 !== this.evidence.document_sha256
            || chunk.evidence.document_version_id !== this.evidence.document_version_id || chunk.evidence.document_bytes !== this.evidence.document_bytes)
            throw new Error('DOCUMENT_STALE');
        const count = [...chunk.content].length;
        if (!Number.isSafeInteger(chunk.total) || chunk.total <= 0 || chunk.total > 4_294_967_296
            || chunk.offset !== offset || !count || count > 64000 || offset + count > chunk.total
            || !/^[a-f0-9]{64}$/.test(chunk.payload_sha256)) throw new Error('ORIGINAL_TRANSPORT_INVALID');
    }

    async #load(selection: OriginalSelection) {
        this.#check(); this.#busy = true; this.#clear(); this.#controls(true); this.#error.textContent = '';
        const d = catalog(this.locale).original; this.#status.textContent = d.loading;
        try {
            const initial = await this.read(selection); this.#check(); this.#validate(initial, selection.offset ?? 0);
            this.#representation = selection.representation ?? 'structure';
            if (initial.format === 'structure') {
                if (initial.offset !== 0) throw new Error('ORIGINAL_TRANSPORT_INVALID');
                const chunks = [initial.content]; let offset = [...initial.content].length;
                const binding = (value: OriginalViewChunk) => JSON.stringify([value.payload_sha256, value.total, value.format,
                    value.unit_index, value.unit_count, value.resource_id, value.extraction_start, value.extraction_end, value.target_first, value.target_last]);
                while (offset < initial.total) {
                    const chunk = await this.read({ unit_index: initial.unit_index, representation: 'structure', offset });
                    this.#check(); this.#validate(chunk, offset);
                    if (binding(chunk) !== binding(initial)) throw new Error('ORIGINAL_TRANSPORT_INVALID');
                    chunks.push(chunk.content); offset += [...chunk.content].length;
                    this.#status.textContent = `${d.loading} ${offset} / ${initial.total}`;
                }
                const serialized = chunks.join('');
                if (await sha256(this.crypto, new TextEncoder().encode(serialized)) !== initial.payload_sha256)
                    throw new Error('ORIGINAL_TRANSPORT_INVALID');
                this.#check();
                const rendered = await originalDocument(this.window, this.crypto, serialized, () => this.#check());
                this.#check(); this.#source.hidden = true;
                await this.#displayFrame(rendered.html, rendered.structure);
                this.#check();
                this.#explanation.textContent = d.structural;
                if (rendered.structure.limitations.length) this.#incomplete.textContent = d.incomplete;
                for (const issue of rendered.structure.limitations) {
                    const row = this.window.document.createElementNS(HTML, 'li');
                    row.textContent = `${d.codes[issue.code]} — ${issue.element}${issue.reference ? `: ${issue.reference}` : ''} (${issue.count ?? 1})`;
                    this.#limitations.append(row);
                }
            } else {
                this.#source.hidden = false; this.#source.textContent = initial.content; this.#source.scrollTop = 0;
                this.#explanation.textContent = initial.format === 'source' ? d.source : d.plain;
            }
            this.#current = initial;
            this.#identity.textContent = `${d.resource}: ${initial.unit_index + 1} / ${initial.unit_count} — ${initial.resource_id}`;
            this.#target.textContent = `${d.target}: ${initial.target_first + 1}–${initial.target_last + 1}. ${d.precision}`;
            this.#status.textContent = initial.format === 'structure' ? d.ready
                : `${d.ready} — ${initial.offset}–${initial.offset + [...initial.content].length} / ${initial.total}`;
            this.#previous.disabled = initial.unit_index === 0; this.#next.disabled = initial.unit_index + 1 >= initial.unit_count;
            const sourceOnly = /^(?:text\/xml|text\/plain|text\/csv|text\/tab-separated-values|text\/markdown)(?:;|$)/.test(initial.media_type);
            this.#inspect.hidden = sourceOnly; this.#inspect.disabled = false;
            this.#inspect.textContent = this.#representation === 'structure' ? d.inspect : d.showStructure;
            this.#previousSource.hidden = this.#nextSource.hidden = initial.format === 'structure';
            this.#previousSource.disabled = initial.offset === 0;
            this.#nextSource.disabled = initial.offset + [...initial.content].length >= initial.total;
        } finally { this.#busy = false; }
    }

    #displayFrame(html: string, structure: OriginalStructure): Promise<void> {
        this.#check();
        const frame = this.window.document.createElementNS(HTML, 'iframe') as HTMLIFrameElement;
        frame.className = 'evidra-original-frame'; frame.setAttribute('title', catalog(this.locale).original.title);
        frame.setAttribute('sandbox', ''); frame.setAttribute('referrerpolicy', 'no-referrer');
        frame.style.cssText = 'inline-size:100%;block-size:55vh;border:1px solid GrayText;';
        this.#frame = frame;
        return new Promise<void>((resolve, reject) => {
            let settled = false;
            const finish = (error?: Error) => {
                if (settled) return;
                settled = true; clearTimeout(timer); frame.removeEventListener('load', loaded, true);
                this.#cancelFrame = null; error ? reject(error) : resolve();
            };
            const loaded = (event: Event) => {
                const document = frame.contentDocument;
                if (!document || document.readyState !== 'complete' || document.documentURI !== 'about:srcdoc'
                    || event.target !== document && event.target !== frame) return;
                void (async () => {
                    this.#check();
                    const images = [...document.querySelectorAll('img')];
                    if (images.length !== structure.tokens.filter(token => token.kind === 'image').length) throw new Error('ORIGINAL_IMAGE_INVALID');
                    for (const image of images) {
                        await image.decode(); this.#check();
                        const asset = structure.images[Number(image.getAttribute('data-evidra-image'))];
                        if (!asset || image.naturalWidth !== asset.width || image.naturalHeight !== asset.height) throw new Error('ORIGINAL_IMAGE_INVALID');
                    }
                    finish();
                })().catch(error => finish(error instanceof Error ? error : new Error('ORIGINAL_IMAGE_INVALID')));
            };
            const timer = setTimeout(() => finish(new Error('ORIGINAL_VIEW_TIMEOUT')), 10000);
            this.#cancelFrame = () => finish(new Error('VIEW_CLOSED'));
            const add = frame.addEventListener as (type: string, listener: EventListener, options: AddEventListenerOptions, wantsUntrusted: boolean) => void;
            add.call(frame, 'load', loaded, { capture: true }, true);
            frame.srcdoc = html; this.#source.before(frame);
        });
    }
}
