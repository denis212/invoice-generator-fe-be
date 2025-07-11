import { useState } from 'react'
import { authApi } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Step 1 data
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Step 2 data
  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!businessName.trim()) {
      setError('Business name is required')
      return
    }
    if (!businessEmail.trim()) {
      setError('Business email is required')
      return
    }
    if (!businessEmail.includes('@')) {
      setError('Please enter a valid business email')
      return
    }
    if (!businessPhone.trim()) {
      setError('Business phone is required')
      return
    }
    if (!businessAddress.trim()) {
      setError('Business address is required')
      return
    }

    setLoading(true)
    
    try {
      await authApi.register({
        username,
        email,
        password,
        role: 'admin'
      })

      await authApi.login({
        username,
        password
      })

      const businessProfileApi = await import('../../lib/api').then(m => m.businessProfileApi)
      await businessProfileApi.create({
        businessName,
        email: businessEmail,
        phone: businessPhone,
        address: businessAddress,
        website: '',
        taxId: '',
        bankAccounts: [],
      })

      onComplete()
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Setup failed')
        : 'Setup failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const prevStep = () => {
    setStep(1)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Invoice Generator</h1>
          <p className="text-gray-600 mt-2">Let's set up your account and business profile</p>
          
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Create Admin Account</h2>
              <p className="text-gray-600 text-sm">This will be your login credentials</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <Label className="block mb-2">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <Label className="block mb-2">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label className="block mb-2">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <Label className="block mb-2">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                Next Step
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Business Information</h2>
              <p className="text-gray-600 text-sm">This will appear on your invoices</p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <Label className="block mb-2">Business Name</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <Label className="block mb-2">Business Email</Label>
                <Input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="business@company.com"
                />
              </div>

              <div>
                <Label className="block mb-2">Business Phone</Label>
                <Input
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="Business phone number"
                />
              </div>

              <div>
                <Label className="block mb-2">Business Address</Label>
                <textarea
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Complete business address"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By completing setup, you agree to our terms of service</p>
        </div>
      </Card>
    </div>
  )
}