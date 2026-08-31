import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { appointmentMessage, openWhatsApp } from '../lib/whatsapp'
import type { Appointment, AppointmentStatus } from '../types'

const STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function Appointments() {
  const [rows, setRows] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    load()
    supabase.from('gym_settings').select('whatsapp_number').maybeSingle().then(({ data }) => {
      if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
    })
  }, [])

  async function load() {
    const { data } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true })
    if (data) setRows(data as Appointment[])
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)))
    await supabase.from('appointments').update({ status }).eq('id', id)
  }

  const visible = rows.filter((r) => filter === 'ALL' || r.status === filter)

  return (
    <div>
      <h1 className="text-2xl text-white">Appointments</h1>

      <div className="mt-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value as AppointmentStatus | 'ALL')} className="input max-w-[10rem]">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-steel">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-white">{r.full_name}</td>
                <td className="px-4 py-3 text-steel">{r.service}</td>
                <td className="px-4 py-3 text-steel">
                  {r.appointment_date} {r.appointment_time}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as AppointmentStatus)}
                    className="input py-1.5 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      openWhatsApp(
                        whatsappNumber || r.phone,
                        appointmentMessage({
                          name: r.full_name,
                          phone: r.phone,
                          service: r.service,
                          date: r.appointment_date,
                          time: r.appointment_time,
                          message: r.message || undefined,
                        })
                      )
                    }
                    className="text-[#25D366] underline"
                  >
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No appointments match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
