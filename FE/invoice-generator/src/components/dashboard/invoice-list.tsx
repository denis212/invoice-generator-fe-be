import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceApi, Invoice } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { InvoicePreview } from '../invoice/invoice-preview'

type InvoiceStatus = 'ALL' | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

export function InvoiceList() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const queryClient = useQueryClient()

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getAll().then(res => res.data.data || []),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      invoiceApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: invoiceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteMutation.mutate(id)
    }
  }

  const getPreviewData = (invoice: Invoice) => ({
    invoiceNumber: invoice.number,
    customerName: invoice.customer?.name || '',
    customerEmail: invoice.customer?.email || '',
    customerPhone: invoice.customer?.phone || '',
    customerAddress: invoice.customer?.address || '',
    createdAt: invoice.issueDate,
    dueDate: invoice.dueDate,
    paymentMethod: 'TRANSFER' as const,
    items: invoice.items.map(item => ({
      name: item.product?.name || '',
      quantity: item.quantity,
      price: item.price,
    })),
  })

  if (isLoading) {
    return <div>Loading invoices...</div>
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Invoice Details</h2>
          <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
            Back to List
          </Button>
        </div>
        <InvoicePreview {...getPreviewData(selectedInvoice)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <div className="flex space-x-4">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus)}
            className="p-2 border rounded"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Invoice #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Issue Date</th>
                <th className="text-left p-4">Due Date</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-blue-600 hover:underline"
                    >
                      {invoice.number}
                    </button>
                  </td>
                  <td className="p-4">{invoice.customer?.name}</td>
                  <td className="p-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">${invoice.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className="text-xs p-1 border rounded"
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SENT">Sent</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No invoices match your search criteria.'
                : 'No invoices found. Create your first invoice to get started.'
              }
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold">{invoices.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'PAID').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-blue-600">
            {invoices.filter(i => i.status === 'SENT').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Overdue</div>
          <div className="text-2xl font-bold text-red-600">
            {invoices.filter(i => i.status === 'OVERDUE').length}
          </div>
        </Card>
      </div>
    </div>
  )
}