import { ProtectedRoute } from './components/auth/protected-route'
import { MainLayout } from './components/layout/main-layout'
import { Dashboard } from './components/dashboard/dashboard'

function App() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  )
}

export default App
