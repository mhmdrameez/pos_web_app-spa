import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ApkUpload from "./pages/ApkUpload";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { LANDING_PAGES } from "./seo/pages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/apk-upload" element={<ApkUpload />} />

      {LANDING_PAGES.map((p) => (
        <Route key={p.slug} path={`/${p.slug}`} element={<LandingPage page={p} />} />
      ))}

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
