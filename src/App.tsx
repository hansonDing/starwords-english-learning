import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Progress from './pages/Progress';
import Review from './pages/Review';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </Layout>
  );
}
