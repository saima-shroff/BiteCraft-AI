import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DIET_OPTIONS } from '../utils'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

export default function AuthView({ mode }) {
  const isReg = mode === 'register'
  const { login, register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [flags, setFlags] = useState([])
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const errors = {
    email: emailOk(form.email) ? '' : 'Enter a valid email address',
    password: form.password.length >= 8 ? '' : 'At least 8 characters',
    confirm: !isReg || form.confirm === form.password ? '' : 'Passwords do not match',
  }
  const valid = !errors.email && !errors.password && !errors.confirm
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const blur = (k) => () => setTouched({ ...touched, [k]: true })
  const show = (k) => touched[k] && errors[k]

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true, confirm: true })
    if (!valid) return
    setBusy(true); setError('')
    try {
      if (isReg) await register(form.email, form.password, flags)
      else await login(form.email, form.password)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => x.msg).join('; ') : 'Unable to reach server')
    } finally { setBusy(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,.25),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,.18),transparent_45%)]" />
      <form onSubmit={submit} noValidate className="card w-full max-w-md animate-pop space-y-4 !p-8 shadow-glow">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bite<span className="bg-gradient-to-r from-brand-400 to-mint-400 bg-clip-text text-transparent">Craft</span> AI</h1>
          <p className="mt-1 text-sm text-slate-500">{isReg ? 'Create your smart pantry account' : 'Welcome back, chef 👋'}</p>
        </div>
        <div>
          <label className="label">Email</label>
          <input className={`input ${show('email') ? 'input-error' : ''}`} type="email" value={form.email} onChange={set('email')} onBlur={blur('email')} placeholder="you@example.com" autoComplete="email" />
          {show('email') && <p className="err">{errors.email}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <input className={`input ${show('password') ? 'input-error' : ''}`} type="password" value={form.password} onChange={set('password')} onBlur={blur('password')} placeholder="••••••••" autoComplete={isReg ? 'new-password' : 'current-password'} />
          {show('password') && <p className="err">{errors.password}</p>}
        </div>
        {isReg && (
          <>
            <div>
              <label className="label">Confirm password</label>
              <input className={`input ${show('confirm') ? 'input-error' : ''}`} type="password" value={form.confirm} onChange={set('confirm')} onBlur={blur('confirm')} autoComplete="new-password" />
              {show('confirm') && <p className="err">{errors.confirm}</p>}
            </div>
            <div>
              <label className="label">Dietary preferences</label>
              <DietPicker value={flags} onChange={setFlags} />
            </div>
          </>
        )}
        {error && <p className="rounded-lg bg-rose-500/10 p-2.5 text-sm text-rose-500">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'}</button>
        <p className="text-center text-sm text-slate-500">
          {isReg ? 'Already have an account?' : 'New here?'}{' '}
          <Link className="font-semibold text-brand-500 hover:underline" to={isReg ? '/login' : '/register'}>{isReg ? 'Log in' : 'Sign up'}</Link>
        </p>
      </form>
    </div>
  )
}

export function DietPicker({ value, onChange }) {
  const [custom, setCustom] = useState('')
  const all = [...DIET_OPTIONS, ...value.filter((v) => !DIET_OPTIONS.includes(v))]
  const toggle = (o) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
  const addCustom = () => {
    const c = custom.trim()
    if (c && !value.includes(c)) onChange([...value, c])
    setCustom('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((o) => (
          <button type="button" key={o} onClick={() => toggle(o)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${value.includes(o) ? 'border-brand-500 bg-brand-600 text-white' : 'border-slate-300 text-slate-500 hover:border-brand-500 dark:border-white/15'}`}>
            {o}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input className="input !py-1.5" value={custom} placeholder="Other allergy / preference" maxLength={40}
          onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())} />
        <button type="button" className="btn-ghost !py-1.5" onClick={addCustom}>Add</button>
      </div>
    </div>
  )
}
