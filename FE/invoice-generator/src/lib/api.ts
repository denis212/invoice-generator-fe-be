import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4209'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (token) {
    localStorage.setItem('authToken', token)
    api.defaults.headers.common['Authorization'] = token
  } else {
    localStorage.removeItem('authToken')
    delete api.defaults.headers.common['Authorization']
  }
}

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken')
    if (authToken) {
      api.defaults.headers.common['Authorization'] = authToken
    }
  }
  return authToken
}

// Initialize token from localStorage on app start
getAuthToken()

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Clear the invalid token
      setAuthToken(null)
      
      // Only redirect to login if we're not already on login/setup pages
      // and if this isn't a profile check during auth flow
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/setup')) {
        // Let the auth context handle 401s during authentication flow
        if (error.config?.url?.includes('/users/profile')) {
          return Promise.reject(error)
        }
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  unit: string
}

export interface InvoiceItem {
  id?: string
  productId: string
  product?: Product
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  customer?: Customer
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
  notes?: string
  items: InvoiceItem[]
}

export interface BusinessProfile {
  id: string
  businessName: string
  address: string
  phone: string
  email: string
  website?: string
  taxId?: string
  bankAccounts: Array<{
    bankName: string
    accountNumber: string
    accountName: string
  }>
  logoUrl?: string
}

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: { username: string; email: string; password: string; role: string }) =>
    axios.post(`${API_BASE_URL}/auth/register`, data),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get<User>('/users/profile'),
  
  checkSetup: () => axios.get(`${API_BASE_URL}/auth/setup-check`),
}

export const customerApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, 'id'>) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
}

export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

export const invoiceApi = {
  getAll: () => api.get<Invoice[]>('/invoices'),
  getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  create: (data: Omit<Invoice, 'id' | 'number'>) => api.post<Invoice>('/invoices', data),
  update: (id: string, data: Partial<Invoice>) => api.put<Invoice>(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
}

export const businessProfileApi = {
  get: () => api.get<BusinessProfile>('/business-profile'),
  create: (data: Omit<BusinessProfile, 'id'>) => api.post<BusinessProfile>('/business-profile', data),
  update: (data: Partial<BusinessProfile>) => api.put<BusinessProfile>('/business-profile', data),
}