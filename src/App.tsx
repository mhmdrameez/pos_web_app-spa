import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ApkUpload from "./pages/ApkUpload";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/apk-upload" element={<ApkUpload />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
