import { createContext } from 'react'
import { User } from './api'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  setupRequired: boolean
  completeSetup: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)