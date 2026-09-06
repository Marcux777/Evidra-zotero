import pt from './locales/pt-BR.json';
import en from './locales/en-US.json';
import ptChat from './locales/conversation.pt-BR.json';
import enChat from './locales/conversation.en-US.json';
import type { Locale } from '../bridge/types';
export type Catalog = typeof pt & { chat: typeof ptChat };
const english: Catalog = { ...en, chat: enChat };
const portuguese: Catalog = { ...pt, chat: ptChat };
export function catalog(locale: Locale): Catalog { return locale === 'en-US' ? english : portuguese; }
