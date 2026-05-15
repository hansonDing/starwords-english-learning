import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Progress from './pages/Progress';
import Review from './pages/Review';
import Login from './pages/Login';
import Leaderboard from './pages/Leaderboard';
import DailyVideo from './pages/DailyVideo';
import { AuthProvider, useAuth } from './hooks/useAuth';

export default function App() {
  const auth = useAuth();

  return (
    <AuthProvider value={auth}>
      <Routes>
        {/* Pages without Layout (full-screen) */}
        <Route path="/login" element={<Login />} />

        {/* Pages with Layout */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/review" element={<Review />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/video" element={<DailyVideo />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
