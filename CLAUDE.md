# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invoice Generator application with separate frontend and backend:
- **BE/**: Elysia.js API server with Prisma ORM and PostgreSQL
- **FE/invoice-generator/**: React + TypeScript + Vite frontend with shadcn/ui components

## Development Commands

### Backend (BE/)
```bash
cd BE
bun install                  # Install dependencies
bun run dev                 # Start development server (http://localhost:3000)
bun run build               # Build application
bunx prisma generate        # Generate Prisma client
bunx prisma db push         # Push schema to database
bunx prisma migrate dev     # Run migrations
```

### Frontend (FE/invoice-generator/)
```bash
cd FE/invoice-generator
bun install                 # Install dependencies
bun run dev                 # Start development server (http://localhost:5173)
bun run build              # Build for production
bun run lint               # Run ESLint
bun run preview            # Preview production build
```

## Architecture

### Backend Stack
- **Elysia.js** with TypeScript for API server
- **Prisma ORM** with PostgreSQL database
- **JWT authentication** with cookie support
- **Swagger/OpenAPI** documentation at `/swagger`
- **CORS** enabled for frontend integration

### Database Schema
Core entities: User, BusinessProfile, Customer, Product, Invoice, InvoiceItem
- Users have authentication with roles
- Business profiles store company information
- Invoices link customers with products through invoice items
- All models use UUID primary keys

### API Routes Structure
- `/auth/*` - Authentication (login, register) - public
- `/users/*` - User management - protected
- `/customers/*` - Customer CRUD - protected  
- `/products/*` - Product CRUD - protected
- `/invoices/*` - Invoice CRUD - protected
- `/business-profile/*` - Business profile management - protected

### Frontend Stack
- **React 18** with TypeScript and Vite
- **Tailwind CSS** with shadcn/ui components
- **React Hook Form** with Zod validation
- **React Query** and **Axios** for API integration (planned)
- Native browser print dialog for invoice printing

### Frontend Components Structure
- `components/ui/` - shadcn/ui base components
- `components/invoice/` - Invoice-specific components (form, preview, print)
- `components/layout/` - Layout components
- `lib/utils.ts` - Utility functions

## Environment Setup

Copy and configure environment files:
- `BE/.env.example` → `BE/.env` (database, JWT secret, SMTP)
- `FE/invoice-generator/.env.example` → `FE/invoice-generator/.env` (company info)

## Integration Status

Frontend and backend are not yet integrated. Key integration points needed:
- API client setup with axios in frontend
- Authentication flow implementation
- Error handling for API calls
- Environment variables for API endpoints