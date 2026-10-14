import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../services/api'
import RecipeCard from '../components/RecipeCard'

export default function RecipeBox() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/recipes').then((r) => setRecipes(r.data)).finally(() => setLoading(false)) }, [])

  const remove = async (r) => {
    if (!confirm(`Delete "${r.title}"?`)) return
    try { await api.delete(`/recipes/${r.id}`); setRecipes(recipes.filter((x) => x.id !== r.id)) } catch (e) { setError(errMsg(e)) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Recipe Box</h1>
      {error && <p className="err">{error}</p>}
      {loading ? <p className="text-slate-400">Loading…</p> : recipes.length === 0
        ? <p className="card text-center text-slate-500">No saved recipes. <Link to="/generate" className="font-semibold text-brand-500">Generate one</Link>.</p>
        : recipes.map((r) => <RecipeCard key={r.id} recipe={r} onDelete={remove} />)}
    </div>
  )
}
