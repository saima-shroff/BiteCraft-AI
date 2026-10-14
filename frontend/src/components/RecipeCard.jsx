import { useState } from 'react'
import api, { errMsg } from '../services/api'

export default function RecipeCard({ recipe, onSaved, onDelete, onShoppingAdded }) {
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [saved, setSaved] = useState(!!recipe.id)
  const missing = (recipe.ingredients_json || []).filter((i) => !i.in_pantry)

  const save = async () => {
    setBusy('save'); setMsg('')
    try {
      const { data } = await api.post('/recipes', recipe)
      setSaved(true); setMsg('Recipe saved!'); onSaved?.(data)
    } catch (e) { setMsg(errMsg(e)) } finally { setBusy('') }
  }

  const addMissing = async () => {
    setBusy('shop'); setMsg('')
    try {
      await Promise.all(missing.map((i) => api.post('/shopping-list', { name: i.name, quantity: i.quantity || 1, unit: i.unit || 'pcs' })))
      setMsg(`Added ${missing.length} item(s) to shopping list`); onShoppingAdded?.()
    } catch (e) { setMsg(errMsg(e)) } finally { setBusy('') }
  }

  return (
    <div className="card animate-pop">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-extrabold">{recipe.title}</h3>
        <span className="whitespace-nowrap rounded-full bg-brand-600/15 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-400">⏱ {recipe.prep_time_mins} min</span>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="label">Ingredients</h4>
          <ul className="space-y-1.5 text-sm">
            {recipe.ingredients_json.map((i, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2">
                <span>{i.quantity} {i.unit} {i.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${i.in_pantry ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-400 text-black'}`}>
                  {i.in_pantry ? 'In pantry' : 'Missing'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="label">Instructions</h4>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {recipe.instructions.map((s, idx) => <li key={idx}>{s}</li>)}
          </ol>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {!saved && <button className="btn-primary" disabled={!!busy} onClick={save}>{busy === 'save' ? 'Saving…' : '💾 Save Recipe'}</button>}
        {missing.length > 0 && <button className="btn-ghost" disabled={!!busy} onClick={addMissing}>{busy === 'shop' ? 'Adding…' : `🛒 Add ${missing.length} Missing Item(s) to Shopping List`}</button>}
        {onDelete && <button className="btn-danger ml-auto" onClick={() => onDelete(recipe)}>Delete</button>}
        {msg && <span className="text-sm text-slate-500">{msg}</span>}
      </div>
    </div>
  )
}
