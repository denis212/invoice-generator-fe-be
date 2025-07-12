import { ReactNode } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { LoginForm } from './login-form'
import { SetupWizard } from '../setup/setup-wizard'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, setupRequired, completeSetup } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (setupRequired) {
    return <SetupWizard onComplete={completeSetup} />
  }

  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
}