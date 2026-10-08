import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ApkUpload from "./pages/ApkUpload";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/apk-upload" element={<ApkUpload />} />

      {/* SEO Privacy Policy URLs */}
      <Route path="/privacy_policy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* SEO Terms and Conditions URLs */}
      <Route path="/terms_and_condition" element={<TermsAndConditions />} />
      <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
      <Route path="/terms_and_condiiton" element={<TermsAndConditions />} />
      <Route path="/terms-and-condition" element={<TermsAndConditions />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
