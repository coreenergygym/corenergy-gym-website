import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import type { GymSettings, Membership } from '../types'

export default function Register() {
  const [params] = useSearchParams()
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    membership_name: params.get('plan') || '',
    preferred_start_date: '',
    notes: '',
    transaction_reference: '',
  })

  useEffect(() => {
    supabase.from('gym_settings').select('*').maybeSingle().then(({ data }) => data && setSettings(data as GymSettings))
    supabase
      .from('memberships')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => data && setMemberships(data as Membership[]))
  }, [])

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const selectedPlan = memberships.find((m) => m.name === form.membership_name)

  async function handleFinalSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')

    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .insert({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        date_of_birth: form.date_of_birth || null,
        membership_id: selectedPlan?.id || null,
        membership_name: form.membership_name || null,
        preferred_start_date: form.preferred_start_date || null,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (regError || !reg) {
      setStatus('error')
      return
    }

    if (form.transaction_reference && selectedPlan) {
      await supabase.from('payments').insert({
        registration_id: reg.id,
        customer_name: form.full_name,
        customer_phone: form.phone,
        amount: selectedPlan.price,
        transaction_reference: form.transaction_reference,
        status: 'PENDING',
      })
    }

    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="text-3xl text-white">Registration submitted</h1>
          <p className="mt-4 text-steel">
            Thanks, {form.full_name.split(' ')[0]}. Your registration is in, and any payment
            reference you submitted is marked <strong className="text-white">PENDING</strong>{' '}
            until the gym verifies it. You'll hear back to confirm.
          </p>
          <Link to="/" className="mt-8 inline-block text-sm text-steel underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-lg px-5 py-20">
        <h1 className="text-4xl text-white">Membership Registration</h1>
        <p className="mt-3 text-steel">Step {step} of 3</p>

        {step === 1 && (
          <div className="mt-8 space-y-5">
            <Field label="Select membership" required>
              <select value={form.membership_name} onChange={(e) => update('membership_name', e.target.value)} className="input">
                <option value="">Choose a plan…</option>
                {memberships.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} — ₹{m.price} ({m.duration_label})
                  </option>
                ))}
                {memberships.length === 0 && <option value="General Membership">General Membership</option>}
              </select>
            </Field>
            <button
              disabled={!form.membership_name}
              onClick={() => setStep(2)}
              className="w-full rounded-full bg-volt py-3.5 font-semibold text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-5">
            <Field label="Full name" required>
              <input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="input" />
            </Field>
            <Field label="Phone number" required>
              <input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" />
            </Field>
            <Field label="Email (optional)">
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
            </Field>
            <Field label="Date of birth (optional)">
              <input type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} className="input" />
            </Field>
            <Field label="Preferred start date">
              <input type="date" value={form.preferred_start_date} onChange={(e) => update('preferred_start_date', e.target.value)} className="input" />
            </Field>
            <Field label="Notes (optional)">
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input min-h-20" />
            </Field>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-line py-3.5 font-semibold text-white">
                Back
              </button>
              <button
                disabled={!form.full_name || !form.phone}
                onClick={() => setStep(3)}
                className="flex-1 rounded-full bg-volt py-3.5 font-semibold text-white disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="mt-8 space-y-5">
            <div className="rounded-2xl border border-line bg-panel p-5">
              <h3 className="font-semibold text-white">Payment</h3>
              {selectedPlan && <p className="mt-1 text-sm text-steel">Amount due: ₹{selectedPlan.price}</p>}

              {settings?.upi_id && <p className="mt-3 text-sm text-steel">UPI ID: {settings.upi_id}</p>}
              {settings?.payment_qr_url && (
                <img src={settings.payment_qr_url} alt="Payment QR code" className="mt-3 h-48 w-48 rounded-lg object-contain" />
              )}
              {!settings?.upi_id && !settings?.payment_qr_url && (
                <p className="mt-3 text-sm text-steel/70">
                  Payment details haven't been configured yet — the gym will share these with you directly.
                  You can still submit your registration now.
                </p>
              )}

              <Field label="Transaction / reference ID (after paying)">
                <input
                  value={form.transaction_reference}
                  onChange={(e) => update('transaction_reference', e.target.value)}
                  className="input mt-2"
                  placeholder="e.g. UPI reference number"
                />
              </Field>
              <p className="mt-2 text-xs text-steel/70">
                Payments are manually verified by the gym. Your status will show as PENDING until then.
              </p>
            </div>

            {status === 'error' && <p className="text-sm text-red-400">Something went wrong. Please try again.</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-full border border-line py-3.5 font-semibold text-white">
                Back
              </button>
              <button
                type="submit"
                disabled={status === 'saving'}
                className="flex-1 rounded-full bg-volt py-3.5 font-semibold text-white disabled:opacity-60"
              >
                {status === 'saving' ? 'Submitting…' : 'Submit Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-steel">
        {label} {required && <span className="text-volt">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
