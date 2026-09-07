import { expect, test } from 'vitest';
import { TextAttachmentViews } from '../src/bridge/text-view';
import type { EvidenceTextView } from '../src/bridge/types';

test('native attachment text remains literal with Unicode offsets, guarded segments and owned view cleanup', async () => {
    // jsdom has no native top-layer/dialog or scrolling implementation; only those
    // platform calls are stubbed. All rendering and continuation logic is production.
    const oldShow = HTMLDialogElement.prototype.showModal, oldClose = HTMLDialogElement.prototype.close, oldScroll = Element.prototype.scrollIntoView;
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
    Element.prototype.scrollIntoView = () => {};
    const manager = new TextAttachmentViews();
    const first = { title: 'Original <script>title</script>', media_type: 'text/html', text: '😀<img src="https://outside.invalid">quoted text', offset: 0, total: 17000,
        evidence: { id: 'a'.repeat(64), content_key: 'TEXT1', start: 1, end: 36, document_sha256: 'b'.repeat(64) } } as EvidenceTextView;
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
        await manager.opener(window, 'en-US')(first, read);
        const dialog = document.querySelector('.evidra-text-attachment')!;
        expect(dialog.querySelector('pre')!.textContent).toBe(first.text);
        expect(dialog.querySelector('mark')!.textContent).toBe([...first.text].slice(1, 36).join(''));
        expect(dialog.querySelector('script,img,a')).toBeNull();
        expect(dialog.querySelector('code')!.textContent).toBe(first.evidence.document_sha256);
        await click('Next text');
        expect(offsets).toEqual([[...first.text].length]);
        expect(dialog.querySelector('pre')!.textContent).toBe('next 😀 segment');
        failure = true;
        await click('Previous text');
        expect(dialog.querySelector('pre')!.textContent).toBe('');
        expect(dialog.querySelector('[role="alert"]')!.textContent).toContain('DOCUMENT_STALE');
        manager.shutdown();
        expect(document.querySelector('.evidra-text-attachment')).toBeNull();
        failure = false;
        await manager.opener(window, 'pt-BR')({ ...first, offset: 16000 }, read);
        await click('Texto anterior');
        expect(release).toBeTypeOf('function');
        manager.closeWindow(window);
        release!(first); await Promise.resolve();
        expect(document.querySelector('.evidra-text-attachment')).toBeNull();
    } finally { manager.shutdown(); HTMLDialogElement.prototype.showModal = oldShow; HTMLDialogElement.prototype.close = oldClose; Element.prototype.scrollIntoView = oldScroll; }
});
