import { expect, test } from 'vitest';
import { webcrypto, createHash } from 'node:crypto';
import { TextAttachmentViews } from '../src/bridge/text-view';
import type { EvidenceTextView, OriginalViewChunk } from '../src/bridge/types';
import { originalDocument } from '../src/security/original';

test('native attachment text remains literal with Unicode offsets, guarded segments and owned view cleanup', async () => {
    // jsdom has no native top-layer/dialog or scrolling implementation; only those
    // platform calls are stubbed. All rendering and continuation logic is production.
    const oldShow = HTMLDialogElement.prototype.showModal, oldClose = HTMLDialogElement.prototype.close, oldScroll = Element.prototype.scrollIntoView;
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
    Element.prototype.scrollIntoView = () => {};
    const errors: unknown[] = [];
    const manager = new TextAttachmentViews(webcrypto as unknown as Crypto, error => errors.push(error));
    const first = { title: 'Original <script>title</script>', media_type: 'text/html', text: '😀<img src="https://outside.invalid">quoted text', offset: 0, total: 17000,
        evidence: { id: 'a'.repeat(64), source_id: 'c'.repeat(64), source_identity: { profile_instance_id: 'p1', library_id: 1, item_key: 'PARENT1' },
            content_key: 'TEXT1', start: 1, end: 36, document_sha256: 'b'.repeat(64) } } as EvidenceTextView;
    const original = { evidence: first.evidence, title: first.title, media_type: first.media_type, unit_index: 0, unit_count: 1,
        resource_id: 'original', extraction_start: 0, extraction_end: 17000, target_first: 0, target_last: 0,
        format: 'plain', content: first.text, offset: 0, total: [...first.text].length, payload_sha256: 'e'.repeat(64) } as OriginalViewChunk;
    const offsets: number[] = [];
    let failure = false, release: ((view: EvidenceTextView) => void) | undefined;
    const read = async (offset: number) => {
        offsets.push(offset);
        if (failure) throw new Error('DOCUMENT_STALE');
        if (offset === 0) return new Promise<EvidenceTextView>(resolve => { release = resolve; });
        return { ...first, offset, text: 'next 😀 segment', total: offset + 14 };
    };
    const click = async (text: string) => {
        const button = [...document.querySelectorAll('.evidra-text-attachment button')].find(value => value.textContent === text) as HTMLButtonElement;
        expect(button, text).toBeTruthy(); button.click(); await new Promise(resolve => setTimeout(resolve, 0));
    };
    try {
        await manager.opener(window, 'en-US')(first, read, async () => original);
        const dialog = document.querySelector('.evidra-text-attachment')!;
        expect(dialog.querySelector('.evidra-original-text')!.textContent).toBe(first.text);
        expect(dialog.querySelector('mark')!.textContent).toBe([...first.text].slice(1, 36).join(''));
        expect(dialog.querySelector('script,img,a')).toBeNull();
        expect(dialog.querySelector('code')!.textContent).toBe(first.evidence.document_sha256);
        await click('Next text');
        expect(offsets).toEqual([[...first.text].length]);
        expect(dialog.querySelector('.evidra-original-text')!.textContent).toBe('next 😀 segment');
        failure = true;
        await click('Previous text');
        expect(dialog.querySelector('.evidra-original-text')!.textContent).toBe('');
        expect(dialog.querySelector('.evidra-original-source')!.textContent).toBe('');
        expect([...dialog.querySelectorAll('[role="alert"]')].some(value => value.textContent?.includes('DOCUMENT_STALE'))).toBe(true);
        expect(errors).toHaveLength(1);
        manager.shutdown();
        expect(document.querySelector('.evidra-text-attachment')).toBeNull();
        failure = false;
        await manager.opener(window, 'pt-BR')({ ...first, offset: 16000 }, read, async () => original);
        await click('Texto anterior');
        expect(release).toBeTypeOf('function');
        manager.closeWindow(window);
        release!(first); await Promise.resolve();
        expect(document.querySelector('.evidra-text-attachment')).toBeNull();
        await manager.opener(window, 'en-US')(first, read, async selection => {
            if (selection.unit_index === 1) throw new Error('DOCUMENT_STALE');
            return { ...original, unit_count: 2 };
        });
        await click('Next resource');
        expect(document.querySelector('.evidra-original-text')!.textContent).toBe('');
        expect(document.querySelector('.evidra-original-source')!.textContent).toBe('');
        expect(errors).toHaveLength(2);
        manager.shutdown();
        await expect(manager.opener(window, 'en-US')(first, read,
            async () => ({ ...original, format: 'structure', content: '{}', total: 2 }))).rejects.toThrow('ORIGINAL_TRANSPORT_INVALID');
        expect(document.querySelector('.evidra-text-attachment')).toBeNull();
        const expired = manager.opener(window, 'en-US'); manager.shutdown();
        await expect(expired(first, read, async () => original)).rejects.toThrow('VIEW_CLOSED');
        let releaseOriginal!: (value: OriginalViewChunk) => void;
        const opening = manager.opener(window, 'en-US')(first, read, () => new Promise(resolve => { releaseOriginal = resolve; }));
        expect(document.querySelector('.evidra-text-attachment')).not.toBeNull();
        manager.closeWindow(window); releaseOriginal(original);
        await expect(opening).rejects.toThrow('VIEW_CLOSED');
        expect(document.querySelector('.evidra-text-attachment')).toBeNull();
    } finally { manager.shutdown(); HTMLDialogElement.prototype.showModal = oldShow; HTMLDialogElement.prototype.close = oldClose; Element.prototype.scrollIntoView = oldScroll; }
});

test('original structural grammar preserves table context and vetted image while refusing all source capabilities', async () => {
    const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKFcAAAAASUVORK5CYII=';
    const start = (tag: string, attributes: Record<string, string> = {}) => ({ kind: 'start', tag, attributes });
    const end = (tag: string) => ({ kind: 'end', tag });
    const text = (value: string) => ({ kind: 'text', text: value });
    const payload = { tokens: [start('h2'), text('Original 😀'), end('h2'), start('table'), start('caption'), text('Original table'), end('caption'),
        start('tbody'), start('tr'), start('th', { colspan: '2', scope: 'col' }), text('Exposure'), end('th'), end('tr'),
        start('tr'), start('td', { rowspan: '2' }), text('<img src="zotero://attachment/FOREIGN/">'), end('td'), start('td'), text('34'), end('td'), end('tr'), end('tbody'), end('table'),
        start('figure'), { kind: 'image', tag: 'img', attributes: { alt: 'Original raster' }, image_index: 0 }, start('figcaption'), text('Original figure'), end('figcaption'), end('figure')],
        images: [{ sha256: createHash('sha256').update(Buffer.from(png, 'base64')).digest('hex'), width: 1, height: 1, data_base64: png }], limitations: [] };
    const original = await originalDocument(window, webcrypto as unknown as Crypto, JSON.stringify(payload), () => {});
    // jsdom establishes the produced inert grammar/sanitizer result, not Gecko sandbox enforcement.
    const parsed = new DOMParser().parseFromString(original.html, 'text/html');
    expect(parsed.querySelector('th')?.getAttribute('colspan')).toBe('2');
    expect(parsed.querySelector('td')?.getAttribute('rowspan')).toBe('2');
    expect(parsed.querySelector('caption')?.textContent).toBe('Original table');
    expect(parsed.querySelector('figcaption')?.textContent).toBe('Original figure');
    expect(parsed.querySelectorAll('img')).toHaveLength(1);
    expect(parsed.querySelector('img')?.getAttribute('src')).toBe(`data:image/png;base64,${png}`);
    expect(parsed.querySelector('script,a,iframe,svg,form,base,[onclick],[href]')).toBeNull();
    expect(parsed.querySelector('meta[http-equiv]')?.getAttribute('content')).toContain("default-src 'none'");
    for (const hostile of [start('script'), start('img', { src: 'file:///C:/private' }), start('p', { onclick: 'unsafe()' }), start('p', { style: 'background:url(resource://private)' })]) {
        await expect(originalDocument(window, webcrypto as unknown as Crypto, JSON.stringify({ ...payload, tokens: [hostile] }), () => {})).rejects.toThrow('ORIGINAL_CONTENT_INVALID');
    }
});
