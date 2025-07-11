import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { customerApi, productApi, invoiceApi } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { InvoicePreview } from '../invoice/invoice-preview'

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.string().default('DRAFT'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be positive'),
  })).min(1, 'At least one item is required'),
})

type InvoiceForm = z.infer<typeof invoiceSchema>

export function CreateInvoice() {
  const [showPreview, setShowPreview] = useState(false)
  const queryClient = useQueryClient()

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll().then(res => res.data.data || []),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll().then(res => res.data.data || []),
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (data: Parameters<typeof invoiceApi.create>[0]) => invoiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      reset()
      setShowPreview(false)
    },
  })

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'DRAFT',
      items: [{ productId: '', quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchedCustomerId = watch('customerId')

  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const taxAmount = subtotal * 0.1
    const totalAmount = subtotal + taxAmount
    return { subtotal, taxAmount, totalAmount }
  }

  const onSubmit = (data: InvoiceForm) => {
    const { subtotal, taxAmount, totalAmount } = calculateTotals()
    
    const invoiceData = {
      ...data,
      subtotal,
      taxAmount,
      totalAmount,
      items: data.items.map(item => ({
        ...item,
        total: item.quantity * item.price,
      })),
    }

    createInvoiceMutation.mutate(invoiceData)
  }

  const getPreviewData = () => {
    const customer = customers.find(c => c.id === watchedCustomerId)
    calculateTotals()
    
    return {
      invoiceNumber: `INV-${Date.now()}`,
      customerName: customer?.name || '',
      customerEmail: customer?.email || '',
      customerPhone: customer?.phone || '',
      customerAddress: customer?.address || '',
      createdAt: new Date().toISOString(),
      dueDate: watch('dueDate'),
      paymentMethod: 'TRANSFER' as const,
      items: watchedItems.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          name: product?.name || '',
          quantity: item.quantity,
          price: item.price,
        }
      }),
    }
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Invoice Preview</h2>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Back to Edit
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={createInvoiceMutation.isPending}>
              {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
        <InvoicePreview {...getPreviewData()} />
      </div>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create New Invoice</h2>
        <Button onClick={() => setShowPreview(true)}>
          Preview Invoice
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerId">Customer</Label>
            <select {...register('customerId')} className="w-full p-2 border rounded">
              <option value="">Select customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-sm text-red-600 mt-1">{errors.customerId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select {...register('status')} className="w-full p-2 border rounded">
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input type="date" {...register('issueDate')} />
            {errors.issueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.issueDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input type="date" {...register('dueDate')} />
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea {...register('notes')} className="w-full p-2 border rounded" rows={3} />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
            <Button type="button" onClick={() => append({ productId: '', quantity: 1, price: 0 })}>
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded">
              <div>
                <Label>Product</Label>
                <select 
                  {...register(`items.${index}.productId`)}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value)
                    if (product) {
                      register(`items.${index}.price`).onChange({
                        target: { value: product.price }
                      })
                    }
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min="1"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label>Price</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.price`, { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Subtotal: ${calculateTotals().subtotal.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Tax (10%): ${calculateTotals().taxAmount.toFixed(2)}
            </div>
            <div className="text-lg font-bold">
              Total: ${calculateTotals().totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Card>
  )
}