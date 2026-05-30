import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import EtfDetailPage from './pages/EtfDetailPage';
import SimulatorPage from './pages/SimulatorPage';
import QuestionnairePage from './pages/QuestionnairePage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/catalogue/:isin" element={<EtfDetailPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
