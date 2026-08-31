import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { openWhatsApp } from '../lib/whatsapp'
import type { Registration, RegistrationStatus } from '../types'

const STATUSES: RegistrationStatus[] = ['NEW', 'CONTACTED', 'APPROVED', 'REJECTED', 'COMPLETED']

export default function Registrations() {
  const [rows, setRows] = useState<Registration[]>([])
  const [filter, setFilter] = useState<RegistrationStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    load()
    supabase.from('gym_settings').select('whatsapp_number').maybeSingle().then(({ data }) => {
      if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
    })
  }, [])

  async function load() {
    const { data } = await supabase.from('registrations').select('*').order('created_at', { ascending: false })
    if (data) setRows(data as Registration[])
  }

  async function updateStatus(id: string, status: RegistrationStatus) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)))
    await supabase.from('registrations').update({ status }).eq('id', id)
  }

  async function convertToMember(r: Registration) {
    await supabase.from('members').insert({
      registration_id: r.id,
      full_name: r.full_name,
      phone: r.phone,
      email: r.email,
      membership_id: r.membership_id,
      membership_name: r.membership_name,
      status: 'PENDING',
      start_date: r.preferred_start_date,
    })
    await updateStatus(r.id, 'COMPLETED')
  }

  const visible = rows.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter
    const matchesSearch =
      !search ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <h1 className="text-2xl text-white">Registrations</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          placeholder="Search name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as RegistrationStatus | 'ALL')} className="input max-w-[10rem]">
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
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-white">{r.full_name}</td>
                <td className="px-4 py-3 text-steel">{r.phone}</td>
                <td className="px-4 py-3 text-steel">{r.membership_name || '-'}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as RegistrationStatus)}
                    className="input py-1.5 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button
                    onClick={() =>
                      openWhatsApp(
                        whatsappNumber || r.phone,
                        `Hi ${r.full_name}, thanks for registering with CoreNergy The Gym for ${r.membership_name || 'a membership'}. `
                      )
                    }
                    className="text-[#25D366] underline"
                  >
                    WhatsApp
                  </button>
                  {r.status === 'APPROVED' && (
                    <button onClick={() => convertToMember(r)} className="text-volt underline">
                      Convert to Member
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No registrations match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
