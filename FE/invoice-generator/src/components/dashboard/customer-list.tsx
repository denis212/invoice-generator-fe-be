import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { customerApi, Customer } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
})

type CustomerForm = z.infer<typeof customerSchema>

export function CustomerList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const queryClient = useQueryClient()

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll().then(res => res.data.data || []),
  })

  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setIsCreateOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setEditingCustomer(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  })

  const onSubmit = (data: CustomerForm) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    reset(customer)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div>Loading customers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Address</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="p-4 font-medium">{customer.name}</td>
                  <td className="p-4">{customer.email}</td>
                  <td className="p-4">{customer.phone || '-'}</td>
                  <td className="p-4">{customer.address}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(customer.id)}
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
          
          {customers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No customers found. Add your first customer to get started.
            </div>
          )}
        </div>
      </Card>

      {(isCreateOpen || editingCustomer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingCustomer(null)
                  reset()
                }}
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input {...register('name')} placeholder="Customer name" />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...register('email')} type="email" placeholder="customer@email.com" />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input {...register('phone')} placeholder="Phone number (optional)" />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <textarea 
                  {...register('address')} 
                  className="w-full p-2 border rounded" 
                  rows={3}
                  placeholder="Customer address"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingCustomer(null)
                    reset()
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCustomer ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}