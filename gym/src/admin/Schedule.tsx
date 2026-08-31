import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

interface ScheduleSlot {
  id: string
  class_name: string
  day_of_week: string
  start_time: string
  end_time: string
  trainer_name: string | null
  is_active: boolean
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const EMPTY = { class_name: '', day_of_week: 'MON', start_time: '06:00', end_time: '07:00', trainer_name: '', is_active: true }

export default function Schedule() {
  const [rows, setRows] = useState<ScheduleSlot[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('schedule_slots').select('*').order('day_of_week').order('start_time')
    if (data) setRows(data as ScheduleSlot[])
  }

  function startEdit(s?: ScheduleSlot) {
    if (s) {
      setEditingId(s.id)
      setForm({
        class_name: s.class_name,
        day_of_week: s.day_of_week,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
        trainer_name: s.trainer_name || '',
        is_active: s.is_active,
      })
    } else {
      setEditingId('new')
      setForm(EMPTY)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      class_name: form.class_name,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      trainer_name: form.trainer_name || null,
      is_active: form.is_active,
    }
    if (editingId && editingId !== 'new') {
      await supabase.from('schedule_slots').update(payload).eq('id', editingId)
    } else {
      await supabase.from('schedule_slots').insert(payload)
    }
    setSaving(false)
    setEditingId(null)
    load()
  }

  async function remove(id: string) {
    await supabase.from('schedule_slots').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white">Schedule</h1>
        <button onClick={() => startEdit()} className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white">
          Add Slot
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4 rounded-2xl border border-line bg-panel p-5">
          <Field label="Class / service name">
            <input required value={form.class_name} onChange={(e) => setForm((f) => ({ ...f, class_name: e.target.value }))} className="input" />
          </Field>
          <Field label="Day">
            <select value={form.day_of_week} onChange={(e) => setForm((f) => ({ ...f, day_of_week: e.target.value }))} className="input">
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start time">
              <input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="input" />
            </Field>
            <Field label="End time">
              <input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="input" />
            </Field>
          </div>
          <Field label="Trainer (optional)">
            <input value={form.trainer_name} onChange={(e) => setForm((f) => ({ ...f, trainer_name: e.target.value }))} className="input" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-steel">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            Active
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditingId(null)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-volt py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Slot'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-steel">
            <tr>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Trainer</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-white">{s.class_name}</td>
                <td className="px-4 py-3 text-steel">{s.day_of_week}</td>
                <td className="px-4 py-3 text-steel">
                  {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                </td>
                <td className="px-4 py-3 text-steel">{s.trainer_name || '-'}</td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => startEdit(s)} className="text-volt underline">
                    Edit
                  </button>
                  <button onClick={() => remove(s.id)} className="text-red-400 underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No schedule slots yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-steel">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
