import { createContext, useContext, type ReactNode } from "react";
import type { Dict } from "./types";
import { DEFAULT_LANG, homePath, type LangCode } from "./config";
import { getDict } from "./registry";

type Ctx = {
  lang: LangCode;
  t: Dict;
  /** Where each language version of the current page lives, for the language switcher. */
  alternates: Partial<Record<LangCode, string>>;
};

const I18nContext = createContext<Ctx>({
  lang: DEFAULT_LANG,
  t: getDict(DEFAULT_LANG),
  alternates: {},
});

export function I18nProvider({
  lang,
  alternates = {},
  children,
}: {
  lang: LangCode;
  alternates?: Partial<Record<LangCode, string>>;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ lang, t: getDict(lang), alternates }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

export const altPath = (alternates: Partial<Record<LangCode, string>>, lang: LangCode) =>
  alternates[lang] ?? homePath(lang);

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

/** Renders **bold** segments inside a translated string. */
export function Rich({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>))}
    </>
  );
}
