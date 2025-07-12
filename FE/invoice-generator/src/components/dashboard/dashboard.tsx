import { useState } from 'react'
import { Button } from '../ui/button'
import { InvoiceList } from './invoice-list'
import { CreateInvoice } from './create-invoice'
import { CustomerList } from './customer-list'
import { ProductList } from './product-list'
import { BusinessProfileSettings } from './business-profile-settings'

type ActiveTab = 'invoices' | 'create-invoice' | 'customers' | 'products' | 'settings'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('invoices')

  const tabs = [
    { id: 'invoices', label: 'Invoices' },
    { id: 'create-invoice', label: 'Create Invoice' },
    { id: 'customers', label: 'Customers' },
    { id: 'products', label: 'Products' },
    { id: 'settings', label: 'Settings' },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex-1"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'invoices' && <InvoiceList />}
        {activeTab === 'create-invoice' && <CreateInvoice />}
        {activeTab === 'customers' && <CustomerList />}
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'settings' && <BusinessProfileSettings />}
      </div>
    </div>
  )
}