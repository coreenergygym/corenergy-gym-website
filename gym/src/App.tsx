import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import BookTrial from './pages/BookTrial'
import Register from './pages/Register'
import Setup from './admin/Setup'
import Login from './admin/Login'
import ProtectedRoute from './admin/ProtectedRoute'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Registrations from './admin/Registrations'
import Members from './admin/Members'
import Appointments from './admin/Appointments'
import Payments from './admin/Payments'
import Receipts from './admin/Receipts'
import Memberships from './admin/Memberships'
import Services from './admin/Services'
import Schedule from './admin/Schedule'
import Gallery from './admin/Gallery'
import Settings from './admin/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-trial" element={<BookTrial />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/setup" element={<Setup />} />
        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="members" element={<Members />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="services" element={<Services />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
