import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background print:min-h-0 print:bg-white">
      <main className="container mx-auto py-4 space-y-4 print:p-0 print:m-0">
          <h1 className="text-4xl font-bold print:hidden">Invoice Generator</h1>
        {children}
      </main>
    </div>
  )
}