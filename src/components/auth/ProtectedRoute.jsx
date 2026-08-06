import { Navigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { FullPageSpinner } from '../ui/LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const user = useAuth()
  if (user === undefined) return <FullPageSpinner />
  return user ? children : <Navigate to="/login" replace />
}
