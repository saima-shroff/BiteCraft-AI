import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['/', 'Dashboard'],
  ['/pantry', 'Pantry'],
  ['/generate', 'AI Chef'],
  ['/recipes', 'Recipes'],
  ['/shopping', 'Shopping'],
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#0b0b14]/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="text-lg font-extrabold tracking-tight">
          Bite<span className="bg-gradient-to-r from-brand-400 to-mint-400 bg-clip-text text-transparent">Craft</span> AI
        </Link>
        <nav className="flex flex-1 flex-wrap gap-1">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-brand-600/15 text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <span className="hidden text-xs text-slate-500 sm:block">{user?.email}</span>
        <button className="btn-ghost !px-3 !py-1.5" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? '☀️' : '🌙'}</button>
        <button className="btn-ghost !px-3 !py-1.5" onClick={logout}>Log out</button>
      </div>
    </header>
  )
}
