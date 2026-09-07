import type { Locale } from '../bridge/types';
import { catalog } from './i18n';

/** Explain a known machine code without replacing it or exposing the original cause. */
export function Diagnostic({ code, locale }: { code: string; locale: Locale }) {
    const messages = catalog(locale).diagnostics;
    const explanation = Object.hasOwn(messages, code) ? messages[code as keyof typeof messages] : null;
    return <>{code}{explanation && <> — {explanation}</>}</>;
}
