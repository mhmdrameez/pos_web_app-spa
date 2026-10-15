import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { NON_DEFAULT_LANGS, pagePath } from "./i18n/config";
import { guideLangs, guidesFor } from "./seo/guides";

// The admin console is only for the owner, so visitors never download its code or styles.
const ApkUpload = lazy(() => import("./pages/ApkUpload"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/apk-upload"
        element={
          <Suspense fallback={null}>
            <ApkUpload />
          </Suspense>
        }
      />

      {/* Home page in each Indian language: /hi, /ta, /ml ... */}
      {NON_DEFAULT_LANGS.map((l) => (
        <Route key={l.code} path={`/${l.code}`} element={<Home lang={l.code} />} />
      ))}

      {/* Guide pages: /gst-billing-app, /hi/gst-billing-app ... */}
      {guideLangs().flatMap((l) =>
        guidesFor(l).map((p) => (
          <Route key={`${l}-${p.slug}`} path={pagePath(l, p.slug)} element={<LandingPage page={p} lang={l} />} />
        ))
      )}

      {/* Legacy URLs are 301-redirected at the host; these keep them working locally */}
      <Route path="/privacy_policy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms_and_condition" element={<TermsAndConditions />} />
      <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
      <Route path="/terms_and_condiiton" element={<TermsAndConditions />} />
      <Route path="/terms-and-condition" element={<TermsAndConditions />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
