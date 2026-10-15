export type LangCode = "en" | "hi" | "mr" | "bn" | "gu" | "pa" | "ta" | "te" | "kn" | "ml";

export type LangInfo = {
  code: LangCode;
  /** Name in the language itself, shown in the language switcher. */
  native: string;
  /** English name, used in aria labels and llms.txt. */
  english: string;
  htmlLang: string;
  ogLocale: string;
  /** Noto Sans family for this script, subset per page at build time (null for Latin). */
  fontFamily: string | null;
};

export const LANGS: LangInfo[] = [
  { code: "en", native: "English", english: "English", htmlLang: "en-IN", ogLocale: "en_IN", fontFamily: null },
  { code: "hi", native: "हिन्दी", english: "Hindi", htmlLang: "hi-IN", ogLocale: "hi_IN", fontFamily: "Noto Sans Devanagari" },
  { code: "mr", native: "मराठी", english: "Marathi", htmlLang: "mr-IN", ogLocale: "mr_IN", fontFamily: "Noto Sans Devanagari" },
  { code: "bn", native: "বাংলা", english: "Bengali", htmlLang: "bn-IN", ogLocale: "bn_IN", fontFamily: "Noto Sans Bengali" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati", htmlLang: "gu-IN", ogLocale: "gu_IN", fontFamily: "Noto Sans Gujarati" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", htmlLang: "pa-IN", ogLocale: "pa_IN", fontFamily: "Noto Sans Gurmukhi" },
  { code: "ta", native: "தமிழ்", english: "Tamil", htmlLang: "ta-IN", ogLocale: "ta_IN", fontFamily: "Noto Sans Tamil" },
  { code: "te", native: "తెలుగు", english: "Telugu", htmlLang: "te-IN", ogLocale: "te_IN", fontFamily: "Noto Sans Telugu" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", htmlLang: "kn-IN", ogLocale: "kn_IN", fontFamily: "Noto Sans Kannada" },
  { code: "ml", native: "മലയാളം", english: "Malayalam", htmlLang: "ml-IN", ogLocale: "ml_IN", fontFamily: "Noto Sans Malayalam" },
];

export const DEFAULT_LANG: LangCode = "en";
export const NON_DEFAULT_LANGS = LANGS.filter((l) => l.code !== DEFAULT_LANG);

export const langInfo = (code: LangCode): LangInfo => LANGS.find((l) => l.code === code) ?? LANGS[0];
export const isLangCode = (s: string): s is LangCode => LANGS.some((l) => l.code === s);

export const homePath = (lang: LangCode) => (lang === DEFAULT_LANG ? "/" : `/${lang}`);
export const pagePath = (lang: LangCode, slug: string) => (lang === DEFAULT_LANG ? `/${slug}` : `/${lang}/${slug}`);

export function langFromPathname(pathname: string): LangCode {
  const first = pathname.split("/")[1] ?? "";
  return isLangCode(first) && first !== DEFAULT_LANG ? first : DEFAULT_LANG;
}
