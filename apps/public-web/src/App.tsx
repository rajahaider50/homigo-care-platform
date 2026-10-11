import { Navigate, Route, Routes } from "react-router-dom";
import { SiteShell } from "./components/SiteShell";
import { AuthActionPage } from "./pages/AuthActionPage";
import { AuthPage } from "./pages/AuthPage";
import { CarePage } from "./pages/CarePage";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { VerifiedPage } from "./pages/VerifiedPage";

export default function App() {
  return (
    <SiteShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/care" element={<CarePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/action" element={<AuthActionPage />} />
        <Route path="/auth/reset" element={<AuthPage initialMode="reset" />} />
        <Route path="/auth/verified" element={<VerifiedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteShell>
  );
}
