import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import GroupPage from './pages/GroupPage'
import AccountPage from './pages/AccountPage'
import LandingPage from './pages/LandingPage'
import TermsPage from './pages/TermsPage'
import CopyrightPage from './pages/CopyrightPage'
import DocsIndexPage from './pages/DocsIndexPage'
import DocPage from './pages/DocPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/copyright" element={<CopyrightPage />} />
          <Route path="/docs" element={<DocsIndexPage />} />
          <Route path="/docs/:slug" element={<DocPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
