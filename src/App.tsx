import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import QuestionsPage from "./pages/admin/QuestionsPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import LessonsWorldPage from "./pages/LessonsWorldPage";
import LessonPage from "./pages/lessons/LessonPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/despre" element={<AboutPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/proiecte" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
      </footer>
    </div>
  );
}
