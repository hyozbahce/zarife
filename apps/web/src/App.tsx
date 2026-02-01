import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import LoginPage from "@/pages/auth/login-page"
import RegisterPage from "@/pages/auth/register-page"
import SchoolsPage from "@/pages/management/schools-page"
import UsersPage from "@/pages/management/users-page"
import DashboardPage from "@/pages/dashboard"
import SettingsPage from "@/pages/settings-page"
import LibraryPage from "@/pages/library/library-page"
import BookDetailPage from "@/pages/library/book-detail-page"
import BookEditorPage from "@/pages/content/book-editor-page"
import MediaLibraryPage from "@/pages/content/media-library-page"
import ClassesPage from "@/pages/school/classes-page"
import StudentsPage from "@/pages/school/students-page"
import AnalyticsPage from "@/pages/analytics/analytics-page"
import ReaderPage from "@/pages/reader/reader-page"
import TeacherDashboardPage from "@/pages/school/teacher-dashboard-page"
import CurriculumPage from "@/pages/school/curriculum-page"
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

function DashboardRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardRoute><DashboardPage /></DashboardRoute>} />

        {/* Library */}
        <Route path="/library" element={<DashboardRoute><LibraryPage /></DashboardRoute>} />
        <Route path="/library/:id" element={<DashboardRoute><BookDetailPage /></DashboardRoute>} />
        <Route path="/reader/:id" element={<ProtectedRoute><ReaderPage /></ProtectedRoute>} />

        {/* Content Lab */}
        <Route path="/stories/new" element={<DashboardRoute requiredRole="PlatformAdmin"><BookEditorPage /></DashboardRoute>} />
        <Route path="/stories/:id/edit" element={<DashboardRoute requiredRole="PlatformAdmin"><BookEditorPage /></DashboardRoute>} />
        <Route path="/assets" element={<DashboardRoute requiredRole="PlatformAdmin"><MediaLibraryPage /></DashboardRoute>} />

        {/* School Management */}
        <Route path="/school/classes" element={<DashboardRoute><ClassesPage /></DashboardRoute>} />
        <Route path="/school/students" element={<DashboardRoute><StudentsPage /></DashboardRoute>} />
        <Route path="/school/teacher" element={<DashboardRoute><TeacherDashboardPage /></DashboardRoute>} />
        <Route path="/curriculum" element={<DashboardRoute><CurriculumPage /></DashboardRoute>} />

        {/* Analytics */}
        <Route path="/analytics" element={<DashboardRoute><AnalyticsPage /></DashboardRoute>} />

        {/* Management */}
        <Route path="/management/schools" element={<DashboardRoute requiredRole="PlatformAdmin"><SchoolsPage /></DashboardRoute>} />
        <Route path="/management/users" element={<DashboardRoute><UsersPage /></DashboardRoute>} />
        <Route path="/settings" element={<DashboardRoute><SettingsPage /></DashboardRoute>} />

        <Route
          path="*"
          element={
            <DashboardRoute>
              <div className="flex h-[50vh] items-center justify-center">
                <h1 className="text-2xl font-semibold italic text-muted-foreground">Coming Soon...</h1>
              </div>
            </DashboardRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
