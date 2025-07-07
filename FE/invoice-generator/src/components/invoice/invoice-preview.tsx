import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintInvoice } from "./print-invoice";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  dueDate: string;
  paymentMethod: "CASH" | "TRANSFER";
  createdAt: string;
}

export function InvoicePreview(props: InvoicePreviewProps) {

  const handlePrint = () => window.print();

  const total = props.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="space-y-4 print:m-0 print:p-0">
      <Card className="w-full print:hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoice #{props.invoiceNumber}</CardTitle>
          <Button onClick={handlePrint}>Cetak Invoice</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Dari:</h3>
              <p>PT. Invoice Generator</p>
              <p>Jl. Contoh No. 123</p>
              <p>Jakarta, Indonesia</p>
              <p>Telp: (021) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Untuk:</h3>
              <p>{props.customerName || "-"}</p>
              <p>{props.customerEmail || "-"}</p>
              <p>{props.customerPhone || "-"}</p>
              <p>{props.customerAddress || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <span className="font-semibold">Tanggal:</span>{" "}
                {formatDate(props.createdAt)}
              </p>
              <p>
                <span className="font-semibold">Jatuh Tempo:</span>{" "}
                {props.dueDate ? formatDate(props.dueDate) : "-"}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Metode Pembayaran:</span>{" "}
                {props.paymentMethod === "CASH" ? "Tunai" : "Transfer Bank"}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name || "-"}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.quantity * item.price)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Catatan:</h3>
            <p>
              Terima kasih atas kepercayaan Anda. Mohon lakukan pembayaran
              sesuai dengan tanggal jatuh tempo yang telah ditentukan.
            </p>
          </div>
        </CardContent>
      </Card>

      <PrintInvoice {...props} />
    </div>
  );
}
