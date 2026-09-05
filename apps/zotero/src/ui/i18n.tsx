import pt from './locales/pt-BR.json';
import en from './locales/en-US.json';
import type { Locale } from '../bridge/types';
export type Catalog = typeof pt;
const english: Catalog = en;
export function catalog(locale: Locale): Catalog { return locale === 'en-US' ? english : pt; }
