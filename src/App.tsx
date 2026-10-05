import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import CookiesPage from "./pages/legal/CookiesPage";
import TermsPage from "./pages/legal/TermsPage";
import QuestionsPage from "./pages/admin/QuestionsPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import LessonsWorldPage from "./pages/LessonsWorldPage";
import LessonPage from "./pages/lessons/LessonPage";
import NotFoundPage from "./pages/NotFoundPage";

// Pagină de teste. `import.meta.env.DEV` e true doar la `npm run dev`;
// în build-ul public (GitHub Pages) ruta dispare și modulul nu e inclus.
const ProjectsPage = import.meta.env.DEV
  ? lazy(() => import("./pages/ProjectsPage"))
  : null;

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/despre" element={<AboutPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          {ProjectsPage ? (
            <Route
              path="/proiecte"
              element={
                <Suspense fallback={null}>
                  <ProjectsPage />
                </Suspense>
              }
            />
          ) : null}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/termeni" element={<TermsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/admin/intrebari" element={<QuestionsPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/joc/:sessionId" element={<GamePage />} />
          <Route path="/lectii" element={<LessonsWorldPage />} />
          <Route path="/lectii/:slug" element={<LessonPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} ColabMe · site în construcție</p>
        <nav className="footer-legal" aria-label="Legal">
          <Link to="/privacy">Confidențialitate</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/termeni">Termeni</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
