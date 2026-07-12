import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('af_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = useCallback((token, nextUser) => {
    localStorage.setItem('af_token', token)
    localStorage.setItem('af_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('af_token')
    localStorage.removeItem('af_user')
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => !!user && roles.includes(user.role), [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
