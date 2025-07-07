import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductService {
  static async create(data: {
    name: string;
    description?: string;
    price: number;
    unit: string;
  }) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: data.name }
    });

    if (existingProduct) {
      throw new Error('Nama produk sudah digunakan');
    }

    return await prisma.product.create({
      data
    });
  }

  static async update(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    unit?: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }

    if (data.name && data.name !== product.name) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: data.name,
          NOT: { id }
        }
      });

      if (existingProduct) {
        throw new Error('Nama produk sudah digunakan');
      }
    }

    return await prisma.product.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { InvoiceItem: true }
    });

    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }

    if (product.InvoiceItem.length > 0) {
      throw new Error('Tidak dapat menghapus produk yang digunakan dalam invoice');
    }

    return await prisma.product.delete({
      where: { id }
    });
  }

  static async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        InvoiceItem: {
          select: {
            invoice: {
              select: {
                id: true,
                number: true,
                issueDate: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }

    return product;
  }

  static async findAll(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      })
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}