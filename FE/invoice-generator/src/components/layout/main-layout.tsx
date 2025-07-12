import { ReactNode } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { Button } from '../ui/button'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background print:min-h-0 print:bg-white">
      <nav className="border-b print:hidden">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Invoice Generator</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-4 space-y-4 print:p-0 print:m-0">
        {children}
      </main>
    </div>
  )
}