import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, getCurrentUser } from '../services/auth'

const AuthContext = createContext(null)
const RefreshUserContext = createContext(() => {})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    return onAuthStateChanged(setUser)
  }, [])

  // Profile edits (display name) don't retrigger onAuthStateChanged — in
  // Firebase mode that only fires on sign-in/out, not local profile field
  // changes — so callers that change the current user's profile must
  // explicitly refresh the context afterwards.
  const refreshUser = useCallback(() => {
    setUser(getCurrentUser())
  }, [])

  return (
    <AuthContext.Provider value={user}>
      <RefreshUserContext.Provider value={refreshUser}>{children}</RefreshUserContext.Provider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useRefreshUser() {
  return useContext(RefreshUserContext)
}
