import { useState } from 'react'
import { MainLayout } from './components/layout/main-layout'
import { InvoiceForm } from './components/invoice/invoice-form'
import { InvoicePreview } from './components/invoice/invoice-preview'
import { Card } from './components/ui/card'

interface InvoiceItem {
  name: string
  quantity: number
  price: number
}

interface InvoiceData {
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  items: InvoiceItem[]
  dueDate: string
  paymentMethod: 'CASH' | 'TRANSFER'
  createdAt: string
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${new Date().getTime()}`,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    createdAt: new Date().toISOString(),
    dueDate: '',
    paymentMethod: 'TRANSFER',
    items: [{ name: '', quantity: 1, price: 0 }]
  })

  const handleFormSubmit = (data: InvoiceData) => {
    setInvoiceData(data)
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:m-0 print:p-0">
        <Card className="p-4 print:hidden">
          <InvoiceForm onSubmit={handleFormSubmit} />
        </Card>
        <div className="lg:sticky lg:top-4 lg:self-start">
          <InvoicePreview {...invoiceData} />
        </div>
      </div>
    </MainLayout>
  )
}

export default App
