import type { Dict } from "./types";
import type { LangCode } from "./config";
import en from "./lang/en";

const registry: Partial<Record<LangCode, Dict>> = { en };

export function registerDict(lang: LangCode, dict: Dict) {
  registry[lang] = dict;
}

export function getDict(lang: LangCode): Dict {
  return registry[lang] ?? en;
}

/** Browser only: loads a language file on demand so English visitors never download the others. */
export async function ensureDict(lang: LangCode): Promise<void> {
  if (registry[lang]) return;
  const mod = await import(`./lang/${lang}.ts`);
  registerDict(lang, mod.default as Dict);
}
