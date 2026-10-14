import { useEffect, useState } from 'react'
import api, { errMsg } from '../services/api'

export default function ShoppingView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pcs' })
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const load = () => api.get('/shopping-list').then((r) => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      await api.post('/shopping-list', { name: form.name.trim(), quantity: Number(form.quantity) || 1, unit: form.unit.trim() || 'pcs' })
      setForm({ name: '', quantity: 1, unit: 'pcs' }); setError(''); load()
    } catch (err) { setError(errMsg(err)) }
  }

  const purchase = async (item) => {
    try {
      await api.put(`/shopping-list/${item.id}`, { is_purchased: true })
      setItems((cur) => cur.filter((i) => i.id !== item.id))
      setToast(`${item.name} moved to your pantry ✅`)
      setTimeout(() => setToast(''), 2500)
    } catch (err) { setError(errMsg(err)) }
  }

  const remove = async (item) => {
    try { await api.delete(`/shopping-list/${item.id}`); setItems((cur) => cur.filter((i) => i.id !== item.id)) } catch (err) { setError(errMsg(err)) }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Shopping List</h1>
      <form onSubmit={add} className="card flex flex-wrap gap-2">
        <input className="input !w-auto flex-1" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
        <input className="input !w-20" type="number" min="0" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <input className="input !w-20" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} maxLength={20} />
        <button className="btn-primary" disabled={!form.name.trim()}>Add</button>
      </form>
      {error && <p className="err">{error}</p>}
      {toast && <div className="animate-pop rounded-xl bg-emerald-500/15 p-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{toast}</div>}
      {loading ? <p className="text-slate-400">Loading…</p> : items.length === 0
        ? <p className="card text-center text-slate-500">Your list is empty 🎉</p>
        : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="card card-hover flex animate-pop items-center gap-3 !py-3">
                <input type="checkbox" className="h-5 w-5 cursor-pointer accent-violet-500" onChange={() => purchase(i)} aria-label={`Mark ${i.name} purchased`} />
                <span className="flex-1 font-medium">{i.name}</span>
                <span className="text-sm text-slate-500">{i.quantity} {i.unit}</span>
                <button className="text-slate-400 hover:text-rose-500" onClick={() => remove(i)} aria-label="Remove">✕</button>
              </li>
            ))}
          </ul>
        )}
      <p className="text-center text-xs text-slate-500">Checking an item moves it into your pantry automatically.</p>
    </div>
  )
}
