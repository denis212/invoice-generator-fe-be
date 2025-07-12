import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessProfileApi } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
})

const businessProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  taxId: z.string().optional(),
  bankAccounts: z.array(bankAccountSchema).min(1, 'At least one bank account is required'),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type BusinessProfileForm = z.infer<typeof businessProfileSchema>

export function BusinessProfileSettings() {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: () => businessProfileApi.get().then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: businessProfileApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      setIsEditing(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: businessProfileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      setIsEditing(false)
    },
  })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      bankAccounts: [{ bankName: '', accountNumber: '', accountName: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankAccounts',
  })

  const onSubmit = (data: BusinessProfileForm) => {
    if (profile) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = () => {
    if (profile) {
      reset({
        ...profile,
        website: profile.website || '',
        logoUrl: profile.logoUrl || '',
      })
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  if (isLoading) {
    return <div>Loading business profile...</div>
  }

  if (!profile && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Business Profile</h2>
        </div>
        
        <Card className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-gray-500">
              No business profile found. Set up your business information to appear on invoices.
            </div>
            <Button onClick={handleEdit}>
              Create Business Profile
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {profile ? 'Edit Business Profile' : 'Create Business Profile'}
          </h2>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input {...register('businessName')} placeholder="Your Company Name" />
                {errors.businessName && (
                  <p className="text-sm text-red-600 mt-1">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...register('email')} type="email" placeholder="business@company.com" />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input {...register('phone')} placeholder="Business phone number" />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input {...register('website')} placeholder="https://company.com (optional)" />
                {errors.website && (
                  <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input {...register('taxId')} placeholder="Tax identification number (optional)" />
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input {...register('logoUrl')} placeholder="https://company.com/logo.png (optional)" />
                {errors.logoUrl && (
                  <p className="text-sm text-red-600 mt-1">{errors.logoUrl.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <textarea 
                {...register('address')} 
                className="w-full p-2 border rounded" 
                rows={3}
                placeholder="Complete business address"
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bank Accounts</h3>
                <Button 
                  type="button" 
                  onClick={() => append({ bankName: '', accountNumber: '', accountName: '' })}
                >
                  Add Bank Account
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded">
                  <div>
                    <Label>Bank Name</Label>
                    <Input {...register(`bankAccounts.${index}.bankName`)} placeholder="Bank name" />
                    {errors.bankAccounts?.[index]?.bankName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.bankAccounts[index].bankName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Account Number</Label>
                    <Input {...register(`bankAccounts.${index}.accountNumber`)} placeholder="Account number" />
                    {errors.bankAccounts?.[index]?.accountNumber && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.bankAccounts[index].accountNumber?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Account Name</Label>
                    <Input {...register(`bankAccounts.${index}.accountName`)} placeholder="Account holder name" />
                    {errors.bankAccounts?.[index]?.accountName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.bankAccounts[index].accountName?.message}
                      </p>
                    )}
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
              
              {errors.bankAccounts && (
                <p className="text-sm text-red-600">{errors.bankAccounts.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {profile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Profile</h2>
        <Button onClick={handleEdit}>
          Edit Profile
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Business Name</div>
                <div className="font-medium">{profile.businessName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div>{profile.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div>{profile.phone}</div>
              </div>
              {profile.website && (
                <div>
                  <div className="text-sm text-gray-600">Website</div>
                  <div>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
              {profile.taxId && (
                <div>
                  <div className="text-sm text-gray-600">Tax ID</div>
                  <div>{profile.taxId}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="whitespace-pre-line">{profile.address}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Bank Accounts</h3>
            <div className="space-y-4">
              {profile.bankAccounts.map((account, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{account.bankName}</div>
                  <div className="text-sm text-gray-600">
                    Account: {account.accountNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    Name: {account.accountName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}