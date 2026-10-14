import { useEffect, useState } from 'react'
import api, { errMsg } from '../services/api'
import IngredientCard from '../components/IngredientCard'
import Modal from '../components/Modal'
import { CATEGORIES } from '../utils'

const blank = { name: '', quantity: 1, unit: 'pcs', expiration_date: '', category: 'Other' }

export default function PantryView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const load = () => api.get('/pantry').then((r) => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const remove = async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return
    try { await api.delete(`/pantry/${item.id}`); load() } catch (e) { setError(errMsg(e)) }
  }

  const shown = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-3xl font-extrabold tracking-tight">Pantry</h1>
        <input className="input !w-56" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn-primary" onClick={() => setEditing({ ...blank })}>＋ Add ingredient</button>
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {loading ? <p className="text-slate-400">Loading…</p> : shown.length === 0 ? (
        <p className="card text-center text-slate-500">Nothing here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => <IngredientCard key={i.id} item={i} onEdit={(it) => setEditing({ ...it, expiration_date: it.expiration_date || '' })} onDelete={remove} />)}
        </div>
      )}
      {editing && <ItemModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </div>
  )
}

function ItemModal({ item, onClose, onSaved }) {
  const [f, setF] = useState(item)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const nameErr = !f.name.trim()
  const qtyErr = f.quantity === '' || Number(f.quantity) < 0

  const submit = async (e) => {
    e.preventDefault()
    if (nameErr || qtyErr) return
    setBusy(true); setError('')
    const body = { name: f.name.trim(), quantity: Number(f.quantity), unit: f.unit.trim() || 'pcs', category: f.category, expiration_date: f.expiration_date || null }
    try {
      if (item.id) await api.put(`/pantry/${item.id}`, body)
      else await api.post('/pantry', body)
      onSaved()
    } catch (err) { setError(errMsg(err)); setBusy(false) }
  }

  return (
    <Modal title={item.id ? 'Edit ingredient' : 'Add ingredient'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <div>
          <label className="label">Name</label>
          <input className={`input ${nameErr && f.name !== item.name ? 'input-error' : ''}`} autoFocus value={f.name} onChange={set('name')} maxLength={100} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Quantity</label>
            <input className={`input ${qtyErr ? 'input-error' : ''}`} type="number" min="0" step="any" value={f.quantity} onChange={set('quantity')} />
          </div>
          <div>
            <label className="label">Unit</label>
            <input className="input" value={f.unit} onChange={set('unit')} maxLength={20} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={f.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Expires</label>
            <input className="input" type="date" value={f.expiration_date} onChange={set('expiration_date')} />
          </div>
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn-primary w-full" disabled={busy || nameErr || qtyErr}>{busy ? 'Saving…' : 'Save'}</button>
      </form>
    </Modal>
  )
}
