import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { daysUntil, freshness } from '../utils'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ recipes: 0, shopping: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/pantry'), api.get('/recipes'), api.get('/shopping-list')])
      .then(([p, r, s]) => { setItems(p.data); setCounts({ recipes: r.data.length, shopping: s.data.length }) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-slate-400">Loading…</p>

  const expired = items.filter((i) => freshness(i.expiration_date).level === 'expired')
  const soon = items.filter((i) => { const d = daysUntil(i.expiration_date); return d !== null && d >= 0 && d <= 3 })
  const stats = [
    ['Active stock', items.length - expired.length, 'text-mint-400'],
    ['Expiring soon', soon.length, 'text-amber-400'],
    ['Expired', expired.length, 'text-rose-500'],
    ['Saved recipes', counts.recipes, 'text-brand-400'],
    ['To buy', counts.shopping, 'text-sky-400'],
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>

      {(soon.length > 0 || expired.length > 0) && (
        <div className="animate-pop rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="font-bold text-amber-600 dark:text-amber-300">⚠️ Heads up — use these first</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...expired, ...soon].map((i) => {
              const f = freshness(i.expiration_date)
              return <span key={i.id} className={`rounded-full px-3 py-1 text-xs font-bold ${f.cls}`}>{i.name} · {f.label}</span>
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([label, n, cls]) => (
          <div key={label} className="card card-hover">
            <p className={`text-3xl font-extrabold ${cls}`}>{n}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <Link to="/generate" className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-violet-600 to-emerald-500 p-8 text-white shadow-glow transition hover:scale-[1.01]">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">AI Chef</p>
        <h2 className="mt-1 text-2xl font-extrabold">What should I cook tonight?</h2>
        <p className="mt-1 max-w-md text-sm opacity-90">Pick ingredients from your pantry and let BiteCraft craft a recipe that respects your dietary needs.</p>
        <span className="mt-4 inline-block rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur transition group-hover:bg-white/30">Generate a recipe →</span>
      </Link>

      {items.length === 0 && (
        <p className="text-sm text-slate-500">Your pantry is empty. <Link to="/pantry" className="font-semibold text-brand-500">Add your first ingredient</Link>.</p>
      )}
    </div>
  )
}
