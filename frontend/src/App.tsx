import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AICoach from './pages/AICoach';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Habits from './pages/Habits';
import Progress from './pages/Progress';
import History from './pages/History';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="coach" element={<AICoach />} />
          <Route path="workout" element={<Workout />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="habits" element={<Habits />} />
          <Route path="progress" element={<Progress />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
