import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Setup() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [locked, setLocked] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('app_state')
      .select('setup_complete')
      .maybeSingle()
      .then(({ data }) => {
        setLocked(!!data?.setup_complete)
        setChecking(false)
      })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setSaving(false)
      return
    }

    // complete_initial_setup checks app_state.setup_complete itself and
    // refuses if setup already ran — this is the actual lock, enforced
    // server-side, not just a UI check.
    const { error: rpcError } = await supabase.rpc('complete_initial_setup', {
      admin_full_name: form.name,
    })

    if (rpcError) {
      setError(
        'Your account was created but could not be granted admin access: ' +
          rpcError.message +
          '. If setup was already completed, sign in instead.'
      )
      setSaving(false)
      return
    }

    navigate('/admin')
  }

  if (checking) return <CenteredMessage>Checking setup status…</CenteredMessage>

  if (locked) {
    return (
      <CenteredMessage>
        Initial setup has already been completed for this gym.
        <div className="mt-4">
          <a href="/admin/login" className="text-volt underline">
            Go to admin login
          </a>
        </div>
      </CenteredMessage>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="text-2xl text-white">Create the first admin account</h1>
      <p className="mt-2 text-sm text-steel">
        This page only works once. After this account is created, this setup page locks itself.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input"
        />
        <input
          required
          type="email"
          placeholder="Admin email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="input"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="input"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-volt py-3 font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Creating account…' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-5 text-center text-steel">
      {children}
    </div>
  )
}
