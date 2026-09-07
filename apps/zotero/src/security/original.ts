import DOMPurify, { type WindowLike } from 'dompurify';
import validateStructure from '../../../../packages/contracts/generated/validate-original-structure.js';
import type { OriginalStructure } from '../bridge/types';

const HTML = 'http://www.w3.org/1999/xhtml';
const TAGS = new Set(('article section div header footer main aside nav h1 h2 h3 h4 h5 h6 p br hr '
    + 'ul ol li dl dt dd blockquote pre code kbd samp var strong b em i small mark sub sup cite q s u ins del '
    + 'span bdi bdo time ruby rt rp table caption colgroup col thead tbody tfoot tr th td figure figcaption').split(' '));
const ATTRIBUTES = new Set('title lang dir colspan rowspan scope abbr start reversed value'.split(' '));
const CSP = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-src 'none'; connect-src 'none'";
const STYLE = 'html{color-scheme:light dark}body{font:1rem/1.6 system-ui;margin:1.25rem;overflow-wrap:anywhere}table{border-collapse:collapse;max-width:100%;margin:1rem 0}th,td{border:1px solid GrayText;padding:.4rem .7rem;text-align:start}caption,figcaption{padding:.4rem;font-style:italic}figure{margin:1rem 0}img{max-width:100%;height:auto}pre{white-space:pre-wrap}blockquote{border-inline-start:3px solid GrayText;padding-inline-start:1rem}';

export async function sha256(crypto: Crypto, data: Uint8Array<ArrayBuffer>): Promise<string> {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), value => value.toString(16).padStart(2, '0')).join('');
}

/** Original source markup never reaches a DOM parser. Only this validated passive grammar does. */
export async function originalDocument(window: Window, crypto: Crypto, serialized: string, check: () => void): Promise<{ html: string; structure: OriginalStructure }> {
    const structure: unknown = JSON.parse(serialized);
    if (!validateStructure(structure)) throw new Error('ORIGINAL_CONTENT_INVALID');
    check();
    const template = window.document.createElementNS(HTML, 'template') as HTMLTemplateElement;
    const inert = template.content.ownerDocument;
    if (!inert || inert === window.document || inert.defaultView !== null) throw new Error('ORIGINAL_INERT_DOCUMENT_UNAVAILABLE');
    const fragment = template.content;
    const stack: (DocumentFragment | Element)[] = [fragment];
    for (let index = 0; index < structure.tokens.length; ++index) {
        const token = structure.tokens[index]!, tag = token.tag ?? '', attrs = token.attributes ?? {};
        if (index % 512 === 0) { check(); await new Promise(resolve => window.setTimeout(resolve, 0)); }
        const parent = stack[stack.length - 1]!;
        if (token.kind === 'text') {
            if (tag || Object.keys(attrs).length || token.image_index != null) throw new Error('ORIGINAL_CONTENT_INVALID');
            parent.append(inert.createTextNode(token.text ?? ''));
        } else if (token.kind === 'start') {
            if (!TAGS.has(tag) || token.text || token.image_index != null) throw new Error('ORIGINAL_CONTENT_INVALID');
            const element = inert.createElementNS(HTML, tag);
            for (const [key, value] of Object.entries(attrs)) {
                if (!ATTRIBUTES.has(key)) throw new Error('ORIGINAL_CONTENT_INVALID');
                element.setAttribute(key, value);
            }
            parent.append(element); stack.push(element);
        } else if (token.kind === 'end') {
            if (stack.length === 1 || (parent as Element).localName !== tag || Object.keys(attrs).length || token.text || token.image_index != null)
                throw new Error('ORIGINAL_CONTENT_INVALID');
            stack.pop();
        } else {
            if (tag !== 'img' || token.text || !Number.isSafeInteger(token.image_index) || token.image_index! >= structure.images.length
                || Object.keys(attrs).some(key => key !== 'alt')) throw new Error('ORIGINAL_CONTENT_INVALID');
            const image = inert.createElementNS(HTML, 'img');
            image.setAttribute('alt', attrs.alt ?? '');
            image.setAttribute('data-evidra-image', String(token.image_index));
            parent.append(image);
        }
    }
    if (stack.length !== 1) throw new Error('ORIGINAL_CONTENT_INVALID');
    // A separate instance uses the empty template content document, including in a XUL host.
    // No raw string, URL, custom element, CSS or source-controlled operation is created above.
    const realm = window as unknown as WindowLike;
    const purifier = DOMPurify({ document: inert, DocumentFragment: realm.DocumentFragment,
        HTMLTemplateElement: realm.HTMLTemplateElement, Node: realm.Node, Element: realm.Element,
        NodeFilter: realm.NodeFilter, NamedNodeMap: realm.NamedNodeMap, HTMLFormElement: realm.HTMLFormElement,
        DOMParser: realm.DOMParser, trustedTypes: realm.trustedTypes });
    if (!purifier.isSupported) throw new Error('ORIGINAL_SANITIZER_UNAVAILABLE');
    const clean = purifier.sanitize(fragment, { RETURN_DOM_FRAGMENT: true, ALLOWED_TAGS: [...TAGS, 'img', 'body'],
        ALLOWED_ATTR: [...ATTRIBUTES, 'alt', 'data-evidra-image'], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
        ADD_URI_SAFE_ATTR: [...ATTRIBUTES, 'alt', 'data-evidra-image'],
        ALLOWED_URI_REGEXP: /^(?!)$/, SANITIZE_NAMED_PROPS: true });
    if (purifier.removed.length) throw new Error('ORIGINAL_CONTENT_INVALID');
    for (let index = 0; index < structure.images.length; ++index) {
        check();
        const asset = structure.images[index]!;
        if (asset.data_base64.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(asset.data_base64))
            throw new Error('ORIGINAL_IMAGE_INVALID');
        const bytes = Uint8Array.from(window.atob(asset.data_base64), value => value.charCodeAt(0));
        const signature = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82];
        if (bytes.length < 33 || signature.some((value, i) => bytes[i] !== value)
            || new DataView(bytes.buffer).getUint32(16) !== asset.width || new DataView(bytes.buffer).getUint32(20) !== asset.height
            || !Number.isSafeInteger(asset.width * asset.height) || asset.width * asset.height > 16_000_000
            || await sha256(crypto, bytes) !== asset.sha256) throw new Error('ORIGINAL_IMAGE_INVALID');
        check();
        // Only an application-created PNG reference is added after sanitation. No blob URL,
        // original src/href, relative path or host protocol ever enters the displayed document.
        for (const element of clean.querySelectorAll(`img[data-evidra-image="${index}"]`)) {
            element.setAttribute('src', `data:image/png;base64,${asset.data_base64}`);
            element.setAttribute('width', String(asset.width)); element.setAttribute('height', String(asset.height));
        }
    }
    check();
    const wrapper = inert.createElementNS(HTML, 'div'); wrapper.append(clean);
    return { html: `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}"><style>${STYLE}</style></head><body><main>${wrapper.innerHTML}</main></body></html>`, structure };
}
