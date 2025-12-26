import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import CoursesPage from './pages/CoursesPage';
import DeliverablesPage from './pages/DeliverablesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import SchedulePage from './pages/SchedulePage';
import GradesPage from './pages/GradesPage';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="border-b sticky top-0 z-50" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🐻</span>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">BearPlan</span>
            </Link>
            <div className="flex gap-1">
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors relative ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Courses
                {isActive('/') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
              </Link>
              <Link
                to="/deliverables"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors relative ${
                  isActive('/deliverables') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Deliverables
                {isActive('/deliverables') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
              </Link>
              <Link
                to="/availability"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors relative ${
                  isActive('/availability') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Availability
                {isActive('/availability') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
              </Link>
              <Link
                to="/schedule"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors relative ${
                  isActive('/schedule') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Schedule
                {isActive('/schedule') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
              </Link>
              <Link
                to="/grades"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors relative ${
                  isActive('/grades') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Grades
                {isActive('/grades') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Navigation />
        <main className="max-w-7xl mx-auto py-8 px-6">
          <Routes>
            <Route path="/" element={<CoursesPage />} />
            <Route path="/deliverables" element={<DeliverablesPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/grades" element={<GradesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
