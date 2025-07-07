import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Nomor invoice harus diisi'),
  customerName: z.string().min(1, 'Nama pelanggan harus diisi'),
  customerEmail: z.string().email('Email tidak valid'),
  customerPhone: z.string().min(1, 'Nomor telepon harus diisi'),
  customerAddress: z.string().min(1, 'Alamat harus diisi'),
  items: z.array(z.object({
    name: z.string().min(1, 'Nama item harus diisi'),
    quantity: z.coerce.number().min(1, 'Jumlah minimal 1'),
    price: z.coerce.number().min(0, 'Harga tidak boleh negatif')
  })).min(1, 'Minimal harus ada 1 item'),
  dueDate: z.string().min(1, 'Tanggal jatuh tempo harus diisi'),
  paymentMethod: z.enum(['CASH', 'TRANSFER']),
  createdAt: z.string()
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormValues) => void
}

export function InvoiceForm({ onSubmit }: InvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
      items: [{ name: '', quantity: 1, price: 0 }],
      paymentMethod: 'TRANSFER'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Data Pelanggan</h2>
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama pelanggan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Masukkan email pelanggan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nomor telepon" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan alamat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Item Invoice</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', quantity: 1, price: 0 })}
            >
              Tambah Item
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  Hapus
                </Button>
              )}
              <FormField
                control={form.control}
                name={`items.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Masukkan jumlah"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Masukkan harga"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Informasi Pembayaran</h2>
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metode Pembayaran</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CASH">Tunai</SelectItem>
                    <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Buat Invoice</Button>
      </form>
    </Form>
  )
}