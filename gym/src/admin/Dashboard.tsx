import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Stats {
  totalRegistrations: number
  pendingRegistrations: number
  totalMembers: number
  activeMembers: number
  pendingPayments: number
  verifiedPayments: number
  pendingAppointments: number
  todaysAppointments: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().slice(0, 10)

      const [
        totalRegistrations,
        pendingRegistrations,
        totalMembers,
        activeMembers,
        pendingPayments,
        verifiedPayments,
        pendingAppointments,
        todaysAppointments,
      ] = await Promise.all([
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'VERIFIED'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('appointment_date', today),
      ])

      setStats({
        totalRegistrations: totalRegistrations.count || 0,
        pendingRegistrations: pendingRegistrations.count || 0,
        totalMembers: totalMembers.count || 0,
        activeMembers: activeMembers.count || 0,
        pendingPayments: pendingPayments.count || 0,
        verifiedPayments: verifiedPayments.count || 0,
        pendingAppointments: pendingAppointments.count || 0,
        todaysAppointments: todaysAppointments.count || 0,
      })
    }
    load()
  }, [])

  const cards = stats
    ? [
        { label: 'Total Registrations', value: stats.totalRegistrations },
        { label: 'Pending Registrations', value: stats.pendingRegistrations },
        { label: 'Total Members', value: stats.totalMembers },
        { label: 'Active Members', value: stats.activeMembers },
        { label: 'Pending Payments', value: stats.pendingPayments },
        { label: 'Verified Payments', value: stats.verifiedPayments },
        { label: "Today's Appointments", value: stats.todaysAppointments },
        { label: 'Pending Appointments', value: stats.pendingAppointments },
      ]
    : []

  return (
    <div>
      <h1 className="text-2xl text-white">Dashboard</h1>
      {!stats ? (
        <p className="mt-4 text-steel">Loading stats…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-3xl text-white">{c.value}</p>
              <p className="mt-1 text-sm text-steel">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
