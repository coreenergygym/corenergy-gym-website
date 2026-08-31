import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { openWhatsApp } from '../lib/whatsapp'
import type { Member, MemberStatus } from '../types'

const STATUSES: MemberStatus[] = ['ACTIVE', 'PENDING', 'EXPIRED', 'INACTIVE']

export default function Members() {
  const [rows, setRows] = useState<Member[]>([])
  const [filter, setFilter] = useState<MemberStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    load()
    supabase.from('gym_settings').select('whatsapp_number').maybeSingle().then(({ data }) => {
      if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number)
    })
  }, [])

  async function load() {
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false })
    if (data) setRows(data as Member[])
  }

  async function updateStatus(id: string, status: MemberStatus) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)))
    await supabase.from('members').update({ status }).eq('id', id)
  }

  const visible = rows.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter
    const matchesSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <h1 className="text-2xl text-white">Members</h1>
      <p className="mt-1 text-sm text-steel/70">
        Members are created from an approved registration. To convert one, add a row here (or from a Registration once that
        workflow is wired up) with the customer's details.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input placeholder="Search name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-xs" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as MemberStatus | 'ALL')} className="input max-w-[10rem]">
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
              <th className="px-4 py-3">Membership</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-white">{m.full_name}</td>
                <td className="px-4 py-3 text-steel">{m.phone}</td>
                <td className="px-4 py-3 text-steel">{m.membership_name || '-'}</td>
                <td className="px-4 py-3">
                  <select value={m.status} onChange={(e) => updateStatus(m.id, e.target.value as MemberStatus)} className="input py-1.5 text-xs">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openWhatsApp(whatsappNumber || m.phone, `Hi ${m.full_name}, this is CoreNergy The Gym. `)} className="text-[#25D366] underline">
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No members match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
