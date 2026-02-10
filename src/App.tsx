import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardProvider } from "@/contexts/DashboardContext";

// Pages
import CarLogin from "./pages/CarLogin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CarSignup from "./pages/CarSignup";
import Dashboard from "./pages/Dashboard";
import ZoneControl from "./pages/ZoneControl";
import NavigationPage from "./pages/Navigation";
import Profile from "./pages/Profile";
import CarDetails from "./pages/CarDetails";
import Insurance from "./pages/Insurance";
import RCBook from "./pages/RCBook";
import DrowsinessMonitor from "./pages/DrowsinessMonitor";
import NotFound from "./pages/NotFound";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

// Car Protected Route Component (for user login/signup)
const CarProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isCarAuthenticated } = useAuth();
  if (!isCarAuthenticated) {
    return <Navigate to="/car-login" replace />;
  }
  return <>{children}</>;
};

// Protected Route Component (for dashboard)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCarAuthenticated } = useAuth();
  if (!isCarAuthenticated) {
    return <Navigate to="/car-login" replace />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isCarAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Car Authentication Route */}
      <Route
        path="/car-login"
        element={
          isCarAuthenticated ?
            (isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />) :
            <CarLogin />
        }
      />
      <Route
        path="/car-signup"
        element={
          isCarAuthenticated ? <Navigate to="/dashboard" replace /> : <CarSignup />
        }
      />

      {/* User Auth Routes (require car authentication) */}
      <Route
        path="/login"
        element={
          <CarProtectedRoute>
            {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          </CarProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <CarProtectedRoute>
            {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
          </CarProtectedRoute>
        }
      />

      {/* Root redirects to car login */}
      <Route
        path="/"
        element={
          isCarAuthenticated ?
            (isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />) :
            <Navigate to="/car-login" replace />
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardProvider>
              <DashboardLayout />
            </DashboardProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/zone-control" element={<ZoneControl />} />
        <Route path="/navigation" element={<NavigationPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/car-details" element={<CarDetails />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/rc-book" element={<RCBook />} />
        <Route path="/drowsiness-monitor" element={<DrowsinessMonitor />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
