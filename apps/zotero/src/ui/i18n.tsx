import pt from './locales/pt-BR.json';
import en from './locales/en-US.json';
import ptChat from './locales/conversation.pt-BR.json';
import enChat from './locales/conversation.en-US.json';
import ptMatrix from './locales/matrix.pt-BR.json';
import enMatrix from './locales/matrix.en-US.json';
import ptJobs from './locales/jobs.pt-BR.json';
import enJobs from './locales/jobs.en-US.json';
import type { Locale } from '../bridge/types';
export type Catalog = typeof pt & { chat: typeof ptChat; matrix: typeof ptMatrix; jobs: typeof ptJobs };
const english: Catalog = { ...en, chat: enChat, matrix: enMatrix, jobs: enJobs };
const portuguese: Catalog = { ...pt, chat: ptChat, matrix: ptMatrix, jobs: ptJobs };
export function catalog(locale: Locale): Catalog { return locale === 'en-US' ? english : portuguese; }
