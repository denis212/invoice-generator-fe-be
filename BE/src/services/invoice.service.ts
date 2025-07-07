import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InvoiceService {
  private static async generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        number: {
          startsWith: `INV/${year}${month}/`
        }
      },
      orderBy: {
        number: 'desc'
      }
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.number.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `INV/${year}${month}/${String(sequence).padStart(4, '0')}`;
  }

  static async create(data: {
    customerId: string;
    issueDate: Date;
    dueDate: Date;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    notes?: string;
  }) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    if (!customer) {
      throw new Error('Customer tidak ditemukan');
    }

    // Validate all products exist
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    if (products.length !== productIds.length) {
      throw new Error('Beberapa produk tidak ditemukan');
    }

    const invoiceItems = data.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    }));

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0.11; // PPN 11%
    const totalAmount = subtotal + taxAmount;

    return await prisma.invoice.create({
      data: {
        number: await this.generateInvoiceNumber(),
        customerId: data.customerId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal,
        taxAmount,
        totalAmount,
        status: 'draft',
        notes: data.notes,
        items: {
          create: invoiceItems
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  static async update(id: string, data: {
    issueDate?: Date;
    dueDate?: Date;
    items?: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    notes?: string;
    status?: string;
  }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan');
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice yang sudah dibayar tidak dapat diubah');
    }

    let updateData: any = {
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      status: data.status
    };

    if (data.items) {
      // Validate all products exist
      const productIds = data.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        }
      });

      if (products.length !== productIds.length) {
        throw new Error('Beberapa produk tidak ditemukan');
      }

      const invoiceItems = data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      }));

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * 0.11; // PPN 11%
      const totalAmount = subtotal + taxAmount;

      // Delete existing items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      updateData = {
        ...updateData,
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: invoiceItems
        }
      };
    }

    return await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  static async delete(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan');
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice yang sudah dibayar tidak dapat dihapus');
    }

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });

    return await prisma.invoice.delete({
      where: { id }
    });
  }

  static async findById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan');
    }

    return invoice;
  }

  static async findAll(params: {
    search?: string;
    status?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      search = '',
      status,
      customerId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { number: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate && endDate) {
      where.issueDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateStatus(id: string, status: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan');
    }

    return await prisma.invoice.update({
      where: { id },
      data: { status }
    });
  }
}