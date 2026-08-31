import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-steel">Loading…</div>
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
