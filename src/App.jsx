import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import LaunchList from './components/LaunchList';
import { drawStarField } from './utils/drawStarField';

const LaunchDetails = lazy(() => import('./components/LaunchDetails'));
const NewsFeed = lazy(() => import('./components/NewsFeed'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    const canvas = document.getElementById('starfield');
    if (canvas) {
      drawStarField(canvas);
      const onResize = () => drawStarField(canvas);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    try {
      const subs = JSON.parse(localStorage.getItem('lt_notifications') || '{}');
      const now = Date.now();
      Object.values(subs).forEach(({ name, net }) => {
        const launchMs = new Date(net).getTime();
        const oneHourBefore = launchMs - 60 * 60 * 1000;
        const tenMinBefore = launchMs - 10 * 60 * 1000;
        if (oneHourBefore > now) {
          setTimeout(() => new Notification(`🚀 ${name} launches in 1 hour`), oneHourBefore - now);
        }
        if (tenMinBefore > now) {
          setTimeout(() => new Notification(`🚀 ${name} launches in 10 minutes`), tenMinBefore - now);
        }
      });
    } catch {
      // ignore parse errors
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Suspense
        fallback={(
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        )}
      >
        <Routes>
          <Route path="/" element={<LaunchList />} />
          <Route path="/launch/:id" element={<LaunchDetails />} />
          <Route path="/news" element={<NewsFeed />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
