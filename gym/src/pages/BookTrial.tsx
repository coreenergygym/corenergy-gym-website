import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { appointmentMessage, buildWhatsAppLink } from '../lib/whatsapp'
import Navbar from '../components/Navbar'

const OWNER_WHATSAPP_FALLBACK = '' // Set the real number in Admin → Gym Settings; this is just a fallback if settings haven't loaded.

export default function BookTrial() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    service: 'Free Trial',
    appointment_date: '',
    appointment_time: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(OWNER_WHATSAPP_FALLBACK)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')

    const { error } = await supabase.from('appointments').insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      service: form.service,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      message: form.message || null,
    })

    if (error) {
      setStatus('error')
      return
    }

    const { data: settings } = await supabase.from('gym_settings').select('whatsapp_number').maybeSingle()
    const number = settings?.whatsapp_number || ownerWhatsapp

    if (number) {
      const msg = appointmentMessage({
        name: form.full_name,
        phone: form.phone,
        service: form.service,
        date: form.appointment_date,
        time: form.appointment_time,
        message: form.message,
      })
      setWhatsappLink(buildWhatsAppLink(number, msg))
    }
    setOwnerWhatsapp(number)
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div>
        <Navbar />
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="text-3xl text-white">Request received</h1>
          <p className="mt-4 text-steel">
            Thanks, {form.full_name.split(' ')[0]}. Your appointment request has been saved. The gym
            will confirm it with you shortly.
          </p>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-[#25D366] px-6 py-3 font-semibold text-black"
            >
              Notify the gym on WhatsApp now
            </a>
          )}
          <div className="mt-8">
            <Link to="/" className="text-sm text-steel underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-lg px-5 py-20">
        <h1 className="text-4xl text-white">Book Your Free Trial</h1>
        <p className="mt-3 text-steel">Fill this in and the gym will get back to you to confirm.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Full name" required>
            <input
              required
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </Field>
          <Field label="Phone number" required>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input"
              placeholder="10-digit mobile number"
            />
          </Field>
          <Field label="Email (optional)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </Field>
          <Field label="What are you interested in?" required>
            <select value={form.service} onChange={(e) => update('service', e.target.value)} className="input">
              <option>Free Trial</option>
              <option>Personal Training</option>
              <option>General Fitness</option>
              <option>Group Class</option>
              <option>Other</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Preferred date" required>
              <input
                required
                type="date"
                value={form.appointment_date}
                onChange={(e) => update('appointment_date', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Preferred time" required>
              <input
                required
                type="time"
                value={form.appointment_time}
                onChange={(e) => update('appointment_time', e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Message (optional)">
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="input min-h-24"
              placeholder="Anything the gym should know?"
            />
          </Field>

          {status === 'error' && (
            <p className="text-sm text-red-400">
              Something went wrong saving your request. Please try again in a moment.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full rounded-full bg-volt py-3.5 font-semibold text-white transition hover:bg-voltLight disabled:opacity-60"
          >
            {status === 'saving' ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
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
