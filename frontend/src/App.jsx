import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthView from './views/AuthView'
import Dashboard from './views/Dashboard'
import PantryView from './views/PantryView'
import GenerateView from './views/GenerateView'
import RecipeBox from './views/RecipeBox'
import ShoppingView from './views/ShoppingView'

function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-slate-400">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8"><Outlet /></main>
    </>
  )
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthView mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <AuthView mode="register" />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pantry" element={<PantryView />} />
        <Route path="/generate" element={<GenerateView />} />
        <Route path="/recipes" element={<RecipeBox />} />
        <Route path="/shopping" element={<ShoppingView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
