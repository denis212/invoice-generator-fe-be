import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerService {
  static async create(data: {
    name: string;
    email: string;
    phone?: string;
    address: string;
  }) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { email: data.email }
    });

    if (existingCustomer) {
      throw new Error('Email customer sudah terdaftar');
    }

    return await prisma.customer.create({
      data
    });
  }

  static async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) {
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      throw new Error('Customer tidak ditemukan');
    }

    if (data.email && data.email !== customer.email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          email: data.email,
          NOT: { id }
        }
      });

      if (existingCustomer) {
        throw new Error('Email customer sudah digunakan');
      }
    }

    return await prisma.customer.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { invoices: true }
    });

    if (!customer) {
      throw new Error('Customer tidak ditemukan');
    }

    if (customer.invoices.length > 0) {
      throw new Error('Tidak dapat menghapus customer yang memiliki invoice');
    }

    return await prisma.customer.delete({
      where: { id }
    });
  }

  static async findById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          select: {
            id: true,
            number: true,
            issueDate: true,
            dueDate: true,
            totalAmount: true,
            status: true
          }
        }
      }
    });

    if (!customer) {
      throw new Error('Customer tidak ditemukan');
    }

    return customer;
  }

  static async findAll(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      })
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}