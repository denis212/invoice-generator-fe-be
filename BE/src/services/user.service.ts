import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export class UserService {
  private static hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  static async create(data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Username atau email sudah digunakan');
    }

    const hashedPassword = this.hashPassword(data.password);

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  static async update(id: string, data: {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    if (data.username || data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            data.username ? { username: data.username } : {},
            data.email ? { email: data.email } : {}
          ],
          NOT: { id }
        }
      });

      if (existingUser) {
        throw new Error('Username atau email sudah digunakan');
      }
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = this.hashPassword(data.password);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });
  }

  static async delete(id: string) {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' }
      });

      if (adminCount <= 1) {
        throw new Error('Tidak dapat menghapus admin terakhir');
      }
    }

    return await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });
  }

  static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    return user;
  }

  static async findAll(params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', role, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    };

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const hashedOldPassword = this.hashPassword(oldPassword);
    if (hashedOldPassword !== user.password) {
      throw new Error('Password lama tidak sesuai');
    }

    const hashedNewPassword = this.hashPassword(newPassword);
    return await prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });
  }
}