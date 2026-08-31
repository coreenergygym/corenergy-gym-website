import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { GymSettings } from '../types'

export default function Settings() {
  const [settings, setSettings] = useState<Partial<GymSettings>>({})
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('gym_settings').select('*').maybeSingle().then(({ data }) => data && setSettings(data))
  }, [])

  function update<K extends keyof GymSettings>(key: K, value: GymSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('gym_settings').update(settings).eq('id', true)
    setSaving(false)
    setSavedAt(Date.now())
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl text-white">Gym Settings</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Gym name">
          <input value={settings.gym_name || ''} onChange={(e) => update('gym_name', e.target.value)} className="input" />
        </Field>
        <Field label="Owner name">
          <input value={settings.owner_name || ''} onChange={(e) => update('owner_name', e.target.value)} className="input" />
        </Field>
        <Field label="Phone">
          <input value={settings.phone || ''} onChange={(e) => update('phone', e.target.value)} className="input" />
        </Field>
        <Field label="WhatsApp number (with country code, e.g. 9198xxxxxxx)">
          <input value={settings.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} className="input" />
        </Field>
        <Field label="Email">
          <input value={settings.email || ''} onChange={(e) => update('email', e.target.value)} className="input" />
        </Field>
        <Field label="Address">
          <input value={settings.address || ''} onChange={(e) => update('address', e.target.value)} className="input" />
        </Field>
        <Field label="Opening hours">
          <input value={settings.opening_hours || ''} onChange={(e) => update('opening_hours', e.target.value)} className="input" />
        </Field>
        <Field label="Instagram URL">
          <input value={settings.instagram_url || ''} onChange={(e) => update('instagram_url', e.target.value)} className="input" />
        </Field>
        <Field label="UPI ID">
          <input value={settings.upi_id || ''} onChange={(e) => update('upi_id', e.target.value)} className="input" />
        </Field>
        <Field label="Payment QR code URL">
          <input value={settings.payment_qr_url || ''} onChange={(e) => update('payment_qr_url', e.target.value)} className="input" />
          <p className="mt-1 text-xs text-steel/70">Upload the QR image to Supabase Storage and paste its public URL here.</p>
        </Field>
        <Field label="About text">
          <textarea value={settings.about_text || ''} onChange={(e) => update('about_text', e.target.value)} className="input min-h-28" />
        </Field>

        <button type="submit" disabled={saving} className="rounded-full bg-volt px-6 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {savedAt && <p className="text-sm text-green-400">Saved.</p>}
      </form>
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
