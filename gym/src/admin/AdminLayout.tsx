import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/registrations', label: 'Registrations' },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/receipts', label: 'Receipts' },
  { to: '/admin/memberships', label: 'Memberships' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/settings', label: 'Gym Settings' },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
        <span className="font-display text-xl tracking-widest">ADMIN</span>
        <button onClick={() => setOpen((v) => !v)} className="rounded-md border border-line px-3 py-1.5 text-sm">
          Menu
        </button>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside
          className={`${open ? 'block' : 'hidden'} w-full border-r border-line px-5 py-6 lg:block lg:w-60`}
        >
          <div className="hidden font-display text-xl tracking-widest lg:block">ADMIN</div>
          <nav className="mt-6 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm ${
                    isActive ? 'bg-volt text-white' : 'text-steel hover:bg-panel hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => signOut()} className="mt-8 w-full rounded-lg border border-line px-3 py-2.5 text-left text-sm text-steel hover:text-white">
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
