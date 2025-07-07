import { z } from 'zod';

// User Schemas
export const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Customer Schemas
export const customerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(5),
});

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  unit: z.string(),
});

// Invoice Schemas
export const invoiceItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export const invoiceSchema = z.object({
  customerId: z.string().uuid(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  items: z.array(invoiceItemSchema),
  notes: z.string().optional(),
});

// Business Profile Schemas
export const bankAccountSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
});

export const businessProfileSchema = z.object({
  businessName: z.string().min(2).max(100),
  address: z.string().min(5),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().url().optional(),
  taxId: z.string().optional(),
  bankAccounts: z.array(bankAccountSchema),
  logoUrl: z.string().url().optional(),
});