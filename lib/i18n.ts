import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  createTranslator,
  isLocale,
  type Locale,
} from "./i18n-core";

export {
  compareNames,
  createTranslator,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getDictionary,
  isLocale,
  persistLocale,
  readStoredMessage,
  storeMessage,
} from "./i18n-core";
export type { Entry, Locale, TKey, TranslateValues, Translator } from "./i18n-core";
export { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE } from "./i18n-core";

/** Idioma activo, lido do cookie que o selector de língua escreve. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Função de tradução para Server Components, Server Actions e `generateMetadata`. */
export async function getT() {
  return createTranslator(await getLocale());
}

/** Atalho: idioma e tradutor num único objecto. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: createTranslator(locale) };
}