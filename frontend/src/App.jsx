import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Browse from './pages/Browse.jsx';
import PlaceDetail from './pages/PlaceDetail.jsx';
import MapPage from './pages/MapPage.jsx';
import MyPlan from './pages/MyPlan.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <main className="container">
              <Routes>
                <Route path="/" element={<Browse />} />
                <Route path="/places/:id" element={<PlaceDetail />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/plan" element={<MyPlan />} />
                <Route path="*" element={<p className="empty">Page not found.</p>} />
              </Routes>
            </main>
          </>
        }
      />
    </Routes>
  );
}
