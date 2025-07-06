import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SummaryPage from './pages/SummaryPage'; // Use the new name
import AboutPage from './pages/AboutPage';
import MedicationPage from './pages/MedicationPage';
import ActivityPage from './pages/ActivityPage';
import ContactsPage from './pages/ContactsPage';
import ManualEntryPage from './pages/ManualEntryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="medications" element={<MedicationPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="log" element={<SummaryPage />} /> {/* Use the new name here */}
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="manual-entry" element={<ManualEntryPage />} />
      </Route>
    </Routes>
  );
}

export default App;