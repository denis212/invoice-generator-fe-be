import { useEffect, useState, ReactNode } from 'react'
import { authApi, User, setAuthToken, getAuthToken } from '../lib/api'
import { AuthContext } from '../lib/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState(false)

  useEffect(() => {
    checkSetup()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkSetup = async () => {
    try {
      const setupResponse = await authApi.checkSetup()
      if (setupResponse.data.setupRequired) {
        setSetupRequired(true)
        setLoading(false)
        return
      }
      await checkAuth()
    } catch {
      setSetupRequired(true)
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      // Only check auth if we have a token
      const token = getAuthToken()
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      const response = await authApi.getProfile()
      setUser(response.data)
      setSetupRequired(false)
    } catch {
      setUser(null)
      setAuthToken(null) // Clear invalid token
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password })
    const token = response.data.data.token
    setAuthToken(token)
    await checkAuth()
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    } finally {
      setAuthToken(null)
      setUser(null)
    }
  }

  const completeSetup = async () => {
    setSetupRequired(false)
    await checkAuth()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setupRequired, completeSetup }}>
      {children}
    </AuthContext.Provider>
  )
}

