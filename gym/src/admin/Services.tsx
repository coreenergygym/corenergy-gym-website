import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { ServiceItem } from '../types'

const EMPTY = { name: '', description: '', features: '', is_active: true }

export default function Services() {
  const [rows, setRows] = useState<ServiceItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('services').select('*').order('sort_order')
    if (data) setRows(data as ServiceItem[])
  }

  function startEdit(s?: ServiceItem) {
    if (s) {
      setEditingId(s.id)
      setForm({
        name: s.name,
        description: s.description || '',
        features: (s.features || []).join('\n'),
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
      name: form.name,
      description: form.description || null,
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      is_active: form.is_active,
    }
    if (editingId && editingId !== 'new') {
      await supabase.from('services').update(payload).eq('id', editingId)
    } else {
      await supabase.from('services').insert(payload)
    }
    setSaving(false)
    setEditingId(null)
    load()
  }

  async function remove(id: string) {
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white">Services</h1>
        <button onClick={() => startEdit()} className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white">
          Add Service
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4 rounded-2xl border border-line bg-panel p-5">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input min-h-20" />
          </Field>
          <Field label="Features (one per line)">
            <textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} className="input min-h-24" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-steel">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            Active (visible on the website)
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditingId(null)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-volt py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Service'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-steel">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3 text-steel">{s.is_active ? 'Yes' : 'No'}</td>
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
                <td colSpan={3} className="px-4 py-8 text-center text-steel">
                  No services yet. Add your first one above.
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
