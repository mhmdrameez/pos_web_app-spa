# SEO and AI-visibility checklist for quickbillpos.in

Nobody can guarantee a #1 ranking. What the code can do is remove every technical barrier and make the site
the easiest one for Google, Bing and AI assistants to understand. The rest is the list below.

## What the build now does for you

- `npm run build` pre-renders every public page to real HTML (`dist/*.html`), so crawlers and AI bots that
  don't run JavaScript still read the full content. The React app then takes over in the browser.
- Writes `sitemap.xml`, `llms.txt` and `llms-full.txt` from the same content the pages use.
- Every page has a unique title and description, one `<h1>`, a canonical URL, Open Graph and Twitter tags,
  and linked JSON-LD (Organization, WebSite, MobileApplication, Product, WebPage, FAQPage, HowTo, BreadcrumbList).
- `robots.txt` allows search engines and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and more).
- `vercel.json`: clean URLs, 301 redirects for the old `/privacy_policy` and `/terms_and_condition` URLs,
  non-www to www, real 404s, cache headers, security headers, and `noindex` on the admin console.
- 6 keyword guide pages. Edit them in `src/seo/pages.ts`. Bump `SITE.updated` in `src/seo/site.ts` when content changes.

## After each deploy

1. `npm run indexnow` pings Bing, Yandex, Naver and others about the new pages.
2. Open https://www.quickbillpos.in/sitemap.xml and https://www.quickbillpos.in/llms.txt and check they load.

## One-time setup (needs your accounts)

1. **Google Search Console**: add `https://www.quickbillpos.in/` as a URL-prefix property, verify, submit
   `sitemap.xml`, then use "Request indexing" on `/` and each guide page.
2. **Bing Webmaster Tools**: import the site from Search Console. Bing powers ChatGPT search and Copilot results,
   so this matters for AI visibility too.
3. **Google Business Profile**: create it if the business has a physical location or serves a service area.
   Use the same name, phone and website everywhere.
4. **Domain**: make sure `quickbillpos.in` (no www) redirects to `www`. In Vercel, add both domains.
5. **Check it**: run https://pagespeed.web.dev and the Rich Results Test on `/`, `/gst-billing-app`, `/upi-qr-billing`.

## Off-site signals that decide rankings

- Reviews: ask happy shops for Google reviews and mention them on the site only once they are real.
  Add review markup only for reviews you actually have.
- Listings and backlinks: Justdial, IndiaMART, Sulekha, AlternativeTo, Product Hunt, G2, Capterra, Indian
  small-business and kirana communities, Android app directories.
- Content: a short demo video on YouTube (title with "billing app for kirana store"), linked from the site.
  Answer real questions on Quora and Reddit with a link to the matching guide.
- Hindi pages: many shop owners search in Hindi or Hinglish. Translating the guides is the next biggest win.
- Keep one consistent name: "QuickBill POS".

## Things to double-check in the copy

- GST slab wording (`5%, 12% or 18%`) appears on the home page and FAQ. GST Council changed the slabs in 2025,
  so confirm which rates the app really offers and update `src/seo/content.ts` and `src/pages/Home.tsx`.
- The privacy policy and terms mention iOS, Google Play Billing and a 3-day trial, while the website sells an
  Android APK with WhatsApp ordering. Search engines and AI assistants will read both, so keep them consistent.
