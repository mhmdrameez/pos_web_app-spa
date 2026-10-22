# QuickBill POS — Marketing SPA + GitHub APK Releases

100% Frontend Single-Page Application (SPA) for **QuickBill POS** and **App-POS (QuickBillPoss)**. Designed to deploy effortlessly to **Vercel** with **zero backend server or database needed**.

APKs are hosted and distributed worldwide via **GitHub Releases** (`mhmdrameez/pos_web_app-spa`), providing unlimited storage, fast CDN downloads, and automatic changelog / fix notes.

## Run Locally

```bash
npm install
npm run dev
```

- Marketing site: http://localhost:5173
- Developer APK Console: http://localhost:5173/apk-upload

## Environment Variables (`.env`)

Set these in your local `.env` or in your **Vercel Project Settings → Environment Variables**:

| Variable | Default | Description |
|---|---|---|
| `VITE_ADMIN_USER` | `developer` | Static login username |
| `VITE_ADMIN_PASSWORD` | `QuickBill@2026` | Static login password |
| `VITE_GITHUB_REPO` | `mhmdrameez/pos_web_app-spa` | GitHub repository (`owner/repo`) |
| `VITE_GITHUB_TOKEN` | *(optional)* | Owner's GitHub Personal Access Token (PAT) |

> **Direct Upload Without Owner Permission**:
> When you set `VITE_GITHUB_TOKEN` in your Vercel environment variables, anyone with the static login credentials can upload an APK directly from `/apk-upload` — the app will push the APK and publish the release directly to your GitHub repository automatically!

## Visitor Analytics (free)

The site records visits (IP, country/city, page) and APK download counts, shown in the
📊 Visitor Analytics panel on `/apk-upload`. No third-party trackers.

**On Vercel** the analytics run as serverless functions in [`api/`](api/) and store data in
**Upstash Redis (free tier)**. One-time setup:

1. Vercel dashboard → your project → **Storage** tab → **Create Database** → **Upstash → Redis** (free plan).
2. Connect it to this project — Vercel adds the `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) environment variables automatically.
3. **Redeploy** the site. Done — visits and download counts start recording immediately.

Geolocation on Vercel comes free from Vercel's own `x-vercel-ip-*` headers (no external API).
Until the integration is added, the panel shows a setup hint and the site itself is unaffected.

**Self-hosted** (`npm start` / `npm run dev:all`): the Express server in [`server/`](server/)
provides the same endpoints, stores data in `data/*.json` and uses the free [ipwho.is](https://ipwho.is)
API for geolocation. No setup needed.

## Publishing APK Releases

1. Navigate to `/apk-upload`.
2. Sign in with the static username & password (`developer` / `QuickBill@2026`).
3. Enter the **Release Version** (e.g. `1.0.4` or `v1.0.4`).
4. Enter the **Fixes / Changelog** (e.g., thermal receipt print fixes, offline SQLite fixes).
5. Select your `.apk` file.
6. Click **🚀 Upload APK & Publish to GitHub**:
   - The APK is committed directly to the GitHub repository.
   - The release is published with your fix notes and download link.
   - The new build appears immediately on both `/apk-upload` and the homepage download banner!
