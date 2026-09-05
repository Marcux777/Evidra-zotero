import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
const parser = new MarkdownIt({ html: false, linkify: false, typographer: false });
export function safeLink(value: string): boolean { try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password;
}
catch {
    return false;
} }
parser.validateLink = safeLink;
export function renderSafeMarkdown(markdown: string): string {
    const clean = DOMPurify.sanitize(parser.render(markdown), { ALLOWED_TAGS: ['p', 'br', 'em', 'strong', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'a', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'], ALLOWED_ATTR: ['href', 'title'], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false });
    const template = document.createElement('template');
    template.innerHTML = clean;
    for (const link of template.content.querySelectorAll('a')) {
        if (!safeLink(link.getAttribute('href') ?? ''))
            link.removeAttribute('href');
        else {
            link.setAttribute('rel', 'noreferrer noopener');
            link.setAttribute('target', '_blank');
        }
    }
    return template.innerHTML;
}
