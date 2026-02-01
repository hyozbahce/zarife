import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import LoginPage from "@/pages/auth/login-page"
import SchoolsPage from "@/pages/management/schools-page"
import DashboardPage from "@/pages/dashboard"
import SettingsPage from "@/pages/settings-page"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/management/schools"
          element={
            <ProtectedRoute requiredRole="PlatformAdmin">
              <DashboardLayout>
                <SchoolsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                  <h1 className="text-2xl font-semibold italic text-muted-foreground">Coming Soon...</h1>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
