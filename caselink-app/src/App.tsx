import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import EntitiesPage from './pages/EntitiesPage';
import TimelineAnalysisPage from './pages/TimelineAnalysisPage';
import GeospatialPage from './pages/GeospatialPage';
import HypothesisEnginePage from './pages/HypothesisEnginePage';
import EvidenceTracePage from './pages/EvidenceTracePage';
import ReportPage from './pages/ReportPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/workspace" element={<InvestigationWorkspace />} />
          <Route path="/entities" element={<EntitiesPage />} />
          <Route path="/timeline" element={<TimelineAnalysisPage />} />
          <Route path="/geospatial" element={<GeospatialPage />} />
          <Route path="/hypothesis" element={<HypothesisEnginePage />} />
          <Route path="/evidence" element={<EvidenceTracePage />} />
          <Route path="/reports" element={<ReportPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
