import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSaving(false)
    if (signInError) {
      setError('Incorrect email or password.')
      return
    }
    navigate('/admin')
  }

  async function handleReset() {
    if (!email) {
      setError('Enter your email above first, then tap "Forgot password".')
      return
    }
    await supabase.auth.resetPasswordForEmail(email)
    setResetSent(true)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="text-2xl text-white">Admin Login</h1>
      <p className="mt-2 text-sm text-steel">CoreNergy The Gym management portal.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {resetSent && <p className="text-sm text-volt">Password reset email sent, if that account exists.</p>}
        <button type="submit" disabled={saving} className="w-full rounded-full bg-volt py-3 font-semibold text-white disabled:opacity-60">
          {saving ? 'Signing in…' : 'Sign In'}
        </button>
        <button type="button" onClick={handleReset} className="w-full text-center text-sm text-steel underline">
          Forgot password?
        </button>
      </form>

      <Link to="/" className="mt-8 text-center text-sm text-steel underline">
        Back to website
      </Link>
    </div>
  )
}
