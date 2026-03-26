import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import CropRecommendation from './pages/CropRecommendation';
import FertilizerCalculator from './pages/FertilizerCalculator';
import History from './pages/History';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Capabilities from './pages/Capabilities';
import Mission from './pages/Mission';
import PlantIntelligence from './pages/PlantIntelligence';
import CropDetail from './pages/CropDetail';
import Technology from './pages/Technology';
import DashboardLayout from './components/DashboardLayout';
import LoadingScreen from './components/LoadingScreen';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/detect" element={<ProtectedRoute><DashboardLayout><DiseaseDetection /></DashboardLayout></ProtectedRoute>} />
      <Route path="/recommend" element={<ProtectedRoute><DashboardLayout><CropRecommendation /></DashboardLayout></ProtectedRoute>} />
      <Route path="/fertilizer" element={<ProtectedRoute><DashboardLayout><FertilizerCalculator /></DashboardLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><DashboardLayout><History /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><DashboardLayout><Admin /></DashboardLayout></AdminRoute>} />

      <Route path="/features" element={<Capabilities />} />
      <Route path="/about" element={<Mission />} />
      <Route path="/about/:id" element={<Mission />} />
      <Route path="/crops" element={<PlantIntelligence />} />
      <Route path="/crops/:id" element={<CropDetail />} />
      <Route path="/technology" element={<Technology />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
