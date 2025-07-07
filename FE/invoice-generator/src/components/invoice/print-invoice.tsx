import { forwardRef } from 'react'
import { formatCurrency, formatDate } from '../../lib/utils'

interface InvoiceItem {
  name: string
  quantity: number
  price: number
}

interface PrintInvoiceProps {
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

export const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(function PrintInvoice(props, ref) {
  const {
    invoiceNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    dueDate,
    paymentMethod,
    createdAt
  } = props

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <div id="print-content" ref={ref} className="hidden print:block print:p-8 print:bg-white print:w-[210mm] print:min-h-[297mm] print:mx-auto print:shadow-none">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">INVOICE</h1>
        <p className="text-xl">#{invoiceNumber}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Dari:</h2>
          <p>{import.meta.env.VITE_COMPANY_NAME}</p>
          <p>{import.meta.env.VITE_COMPANY_ADDRESS}</p>
          <p>Email: {import.meta.env.VITE_COMPANY_EMAIL}</p>
          <p>Telp: {import.meta.env.VITE_COMPANY_PHONE}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Untuk:</h2>
          <p>{customerName}</p>
          <p>{customerEmail}</p>
          <p>{customerPhone}</p>
          <p>{customerAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p><span className="font-semibold">Tanggal:</span> {formatDate(createdAt)}</p>
          <p><span className="font-semibold">Jatuh Tempo:</span> {formatDate(dueDate)}</p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Metode Pembayaran:</span>{' '}
            {paymentMethod === 'CASH' ? 'Tunai' : 'Transfer Bank'}
          </p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="py-2 text-left">Item</th>
            <th className="py-2 text-right">Jumlah</th>
            <th className="py-2 text-right">Harga</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2">{item.name}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(item.price)}</td>
              <td className="py-2 text-right">
                {formatCurrency(item.quantity * item.price)}
              </td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td colSpan={3} className="py-2 text-right">Total</td>
            <td className="py-2 text-right">{formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>

      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Catatan:</h2>
        <p>Terima kasih atas kepercayaan Anda. Mohon lakukan pembayaran sesuai dengan tanggal jatuh tempo yang telah ditentukan.</p>
        {paymentMethod === 'TRANSFER' && (
          <div className="mt-4">
            <p className="font-semibold">Informasi Rekening:</p>
            <p>{import.meta.env.VITE_BANK_NAME}</p>
            <p>No. Rekening: {import.meta.env.VITE_BANK_ACCOUNT_NUMBER}</p>
            <p>Atas Nama: {import.meta.env.VITE_BANK_ACCOUNT_NAME}</p>
          </div>
        )}
      </div>
    </div>
  )
})

PrintInvoice.displayName = 'PrintInvoice'