import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export class AuthService {
  private static hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  static async register(username: string, email: string, password: string, role: string = 'user') {
    const hashedPassword = this.hashPassword(password);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Username atau email sudah terdaftar');
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  }

  static async login(username: string, password: string) {
    const hashedPassword = this.hashPassword(password);

    const user = await prisma.user.findFirst({
      where: {
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw new Error('Username atau password salah');
    }

    return user;
  }

  static async validateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    return user;
  }
}