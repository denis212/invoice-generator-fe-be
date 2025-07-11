import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { productApi, Product } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  unit: z.string().min(1, 'Unit is required'),
})

type ProductForm = z.infer<typeof productSchema>

export function ProductList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll().then(res => res.data.data || []),
  })

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsCreateOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingProduct(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const onSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    reset(product)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div>Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          Add Product
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Unit</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">{product.description || '-'}</td>
                  <td className="p-4">${product.price.toFixed(2)}</td>
                  <td className="p-4">{product.unit}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
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
          
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found. Add your first product to get started.
            </div>
          )}
        </div>
      </Card>

      {(isCreateOpen || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingProduct(null)
                  reset()
                }}
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input {...register('name')} placeholder="Product name" />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea 
                  {...register('description')} 
                  className="w-full p-2 border rounded" 
                  rows={3}
                  placeholder="Product description (optional)"
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input 
                  {...register('price', { valueAsNumber: true })} 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input {...register('unit')} placeholder="e.g., piece, hour, kg" />
                {errors.unit && (
                  <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingProduct(null)
                    reset()
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}