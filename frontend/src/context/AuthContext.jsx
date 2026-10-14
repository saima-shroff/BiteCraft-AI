import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
  }, [])

  const authenticate = async (path, body) => {
    const { data } = await api.post(`/auth/${path}`, body)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
  }

  const login = (email, password) => authenticate('login', { email, password })
  const register = (email, password, dietary_flags) => authenticate('register', { email, password, dietary_flags })
  const logout = () => { localStorage.removeItem('token'); setUser(null) }
  const updateDiet = async (dietary_flags) => {
    const { data } = await api.put('/auth/me', { dietary_flags })
    setUser(data)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateDiet }}>{children}</AuthContext.Provider>
}
