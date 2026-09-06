import pt from './locales/pt-BR.json';
import en from './locales/en-US.json';
import ptChat from './locales/conversation.pt-BR.json';
import enChat from './locales/conversation.en-US.json';
import ptMatrix from './locales/matrix.pt-BR.json';
import enMatrix from './locales/matrix.en-US.json';
import type { Locale } from '../bridge/types';
export type Catalog = typeof pt & { chat: typeof ptChat; matrix: typeof ptMatrix };
const english: Catalog = { ...en, chat: enChat, matrix: enMatrix };
const portuguese: Catalog = { ...pt, chat: ptChat, matrix: ptMatrix };
export function catalog(locale: Locale): Catalog { return locale === 'en-US' ? english : portuguese; }
