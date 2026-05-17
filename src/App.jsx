import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import LaunchList from './components/LaunchList'

const LaunchDetails = lazy(() => import('./components/LaunchDetails'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {

  return (
    <Router>
      <ScrollToTop />
      <Suspense
        fallback={(
          <div className="flex flex-col items-center justify-center min-h-screen bg-black">
            <div className="w-12 h-12 border-4 border-[#333] border-t-[#7f1212] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        )}
      >
        <Routes>
          <Route path="/" element={<LaunchList />} />
          <Route path="/launch/:id" element={<LaunchDetails />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
