import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Membership } from '../types'

const EMPTY = { name: '', duration_label: '', price: 0, description: '', features: '', is_active: true }

export default function Memberships() {
  const [rows, setRows] = useState<Membership[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('memberships').select('*').order('sort_order')
    if (data) setRows(data as Membership[])
  }

  function startEdit(m?: Membership) {
    if (m) {
      setEditingId(m.id)
      setForm({
        name: m.name,
        duration_label: m.duration_label,
        price: m.price,
        description: m.description || '',
        features: (m.features || []).join('\n'),
        is_active: m.is_active,
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
      duration_label: form.duration_label,
      price: Number(form.price),
      description: form.description || null,
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      is_active: form.is_active,
    }

    if (editingId && editingId !== 'new') {
      await supabase.from('memberships').update(payload).eq('id', editingId)
    } else {
      await supabase.from('memberships').insert(payload)
    }
    setSaving(false)
    setEditingId(null)
    load()
  }

  async function remove(id: string) {
    await supabase.from('memberships').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white">Memberships</h1>
        <button onClick={() => startEdit()} className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white">
          Add Plan
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4 rounded-2xl border border-line bg-panel p-5">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          </Field>
          <Field label="Duration label (e.g. '1 Month', '3 Months')">
            <input
              required
              value={form.duration_label}
              onChange={(e) => setForm((f) => ({ ...f, duration_label: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="Price (₹)">
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              className="input"
            />
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
              {saving ? 'Saving…' : 'Save Plan'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-steel">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-white">{m.name}</td>
                <td className="px-4 py-3 text-steel">{m.duration_label}</td>
                <td className="px-4 py-3 text-steel">₹{m.price}</td>
                <td className="px-4 py-3 text-steel">{m.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => startEdit(m)} className="text-volt underline">
                    Edit
                  </button>
                  <button onClick={() => remove(m.id)} className="text-red-400 underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-steel">
                  No plans yet. Add your first membership plan above.
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
