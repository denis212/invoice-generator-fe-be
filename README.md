# Invoice Generator

Aplikasi generator invoice dengan backend menggunakan Elysia.js dan frontend menggunakan React + TypeScript + Vite.

## Struktur Proyek

```
├── BE/          # Backend dengan Elysia.js
└── FE/          # Frontend dengan React + TypeScript + Vite
```

## Backend (BE)

Backend dibangun menggunakan:
- Elysia.js - Web framework
- Prisma - ORM dan database migrations
- TypeScript - Type safety
- Swagger/OpenAPI - API documentation

### Menjalankan Backend

1. Masuk ke direktori BE:
```bash
cd BE
```

2. Install dependencies:
```bash
bun install
```

3. Jalankan development server:
```bash
bun run dev
```

Server akan berjalan di http://localhost:3000

## Frontend (FE)

Frontend dibangun menggunakan:
- React - UI library
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- shadcn/ui - UI components

### Menjalankan Frontend

1. Masuk ke direktori FE/invoice-generator:
```bash
cd FE/invoice-generator
```

2. Install dependencies:
```bash
bun install
```

3. Jalankan development server:
```bash
bun run dev
```

Aplikasi akan berjalan di http://localhost:5173

## Status Integrasi

Saat ini, frontend dan backend belum terintegrasi. Beberapa hal yang perlu dilakukan:

1. Implementasi API client di frontend menggunakan axios
2. Konfigurasi environment variables untuk API endpoint
3. Implementasi state management untuk data dari API
4. Implementasi error handling untuk API calls
5. Implementasi authentication dan authorization