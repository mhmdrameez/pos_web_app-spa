import type { LangCode } from "../i18n/config";
import { LANDING_PAGES, type LandingPageData } from "./pages";
import { HI_PAGES } from "./pages.hi";

/** Languages that have their own guide pages. Other languages show the home page only. */
const GUIDES: Partial<Record<LangCode, LandingPageData[]>> = {
  en: LANDING_PAGES,
  hi: HI_PAGES,
};

export const guidesFor = (lang: LangCode): LandingPageData[] => GUIDES[lang] ?? [];

export const getGuide = (lang: LangCode, slug: string): LandingPageData | undefined =>
  guidesFor(lang).find((p) => p.slug === slug);

export const guideLangs = (): LangCode[] => Object.keys(GUIDES) as LangCode[];
