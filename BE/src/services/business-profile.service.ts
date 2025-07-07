import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BusinessProfileService {
  static async create(data: {
    businessName: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
    bankAccounts: Array<{
      bankName: string;
      accountNumber: string;
      accountName: string;
    }>;
    logoUrl?: string;
  }) {
    const existingProfile = await prisma.businessProfile.findFirst();

    if (existingProfile) {
      throw new Error('Profil bisnis sudah ada, gunakan method update untuk mengubah data');
    }

    return await prisma.businessProfile.create({
      data
    });
  }

  static async update(id: string, data: {
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    bankAccounts?: Array<{
      bankName: string;
      accountNumber: string;
      accountName: string;
    }>;
    logoUrl?: string;
  }) {
    const profile = await prisma.businessProfile.findUnique({
      where: { id }
    });

    if (!profile) {
      throw new Error('Profil bisnis tidak ditemukan');
    }

    return await prisma.businessProfile.update({
      where: { id },
      data
    });
  }

  static async getProfile() {
    const profile = await prisma.businessProfile.findFirst();

    if (!profile) {
      throw new Error('Profil bisnis belum dibuat');
    }

    return profile;
  }

  static async updateLogo(id: string, logoUrl: string) {
    const profile = await prisma.businessProfile.findUnique({
      where: { id }
    });

    if (!profile) {
      throw new Error('Profil bisnis tidak ditemukan');
    }

    return await prisma.businessProfile.update({
      where: { id },
      data: { logoUrl }
    });
  }

  static async updateBankAccounts(id: string, bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  }>) {
    const profile = await prisma.businessProfile.findUnique({
      where: { id }
    });

    if (!profile) {
      throw new Error('Profil bisnis tidak ditemukan');
    }

    return await prisma.businessProfile.update({
      where: { id },
      data: { bankAccounts }
    });
  }
}