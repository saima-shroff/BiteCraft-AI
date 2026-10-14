import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../services/api'
import { useAuth } from '../context/AuthContext'
import IngredientCard from '../components/IngredientCard'
import RecipeCard from '../components/RecipeCard'
import { DietPicker } from './AuthView'

export default function GenerateView() {
  const { user, updateDiet } = useAuth()
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [notes, setNotes] = useState('')
  const [recipe, setRecipe] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [flags, setFlags] = useState(user.dietary_flags)
  const [dietSaved, setDietSaved] = useState(true)

  useEffect(() => { api.get('/pantry').then((r) => setItems(r.data)) }, [])

  const toggle = (id) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const changeFlags = (v) => { setFlags(v); setDietSaved(false) }
  const saveDiet = async () => { await updateDiet(flags); setDietSaved(true) }

  const generate = async () => {
    setBusy(true); setError(''); setRecipe(null)
    try {
      if (!dietSaved) await saveDiet()
      const { data } = await api.post('/ai/generate-recipe', { ingredient_ids: [...selected], extra_notes: notes })
      setRecipe(data)
    } catch (e) { setError(errMsg(e, 'Generation failed')) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">AI Chef</h1>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Dietary filters</h2>
          {!dietSaved && <button className="btn-ghost !py-1" onClick={saveDiet}>Save to profile</button>}
        </div>
        <DietPicker value={flags} onChange={changeFlags} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">1. Pick ingredients <span className="text-sm font-normal text-slate-500">({selected.size} selected)</span></h2>
          {items.length > 0 && <button className="text-sm font-semibold text-brand-500" onClick={() => setSelected(selected.size === items.length ? new Set() : new Set(items.map((i) => i.id)))}>{selected.size === items.length ? 'Clear' : 'Select all'}</button>}
        </div>
        {items.length === 0
          ? <p className="card text-center text-slate-500">Your pantry is empty. <Link to="/pantry" className="font-semibold text-brand-500">Add ingredients</Link> first.</p>
          : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map((i) => <IngredientCard key={i.id} item={i} selected={selected.has(i.id)} onSelect={toggle} />)}</div>}
      </section>

      <section className="card space-y-3 shadow-glow !border-brand-500/40">
        <h2 className="font-bold">2. Anything else?</h2>
        <input className="input" placeholder="e.g. quick weeknight dinner, spicy…" maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="btn-primary" disabled={busy || selected.size === 0} onClick={generate}>{busy ? '✨ Cooking up an idea…' : '✨ Generate recipe'}</button>
        {error && <p className="err">{error}</p>}
      </section>

      {recipe && <RecipeCard recipe={recipe} />}
    </div>
  )
}
