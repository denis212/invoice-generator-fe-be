# Invoice Generator Frontend

Frontend untuk aplikasi Invoice Generator yang dibangun dengan React + TypeScript + Vite.

## Teknologi yang Digunakan

- React 18.2.0 - UI library
- TypeScript - Type safety
- Vite 4.5.1 - Build tool
- Tailwind CSS 3.3.0 - Styling
- shadcn/ui - UI components
- React Hook Form 7.43.9 - Form handling
- Zod - Form validation
- React Query - Data fetching (akan diimplementasikan)
- Axios - HTTP client (akan diimplementasikan)

## Development

1. Install dependencies:
```bash
bun install
```

2. Copy file environment dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

3. Jalankan development server:
```bash
bun run dev
```

Aplikasi akan berjalan di http://localhost:5173

## Status Integrasi dengan Backend

Saat ini, frontend belum terintegrasi dengan backend. Beberapa hal yang perlu diimplementasikan:

1. Konfigurasi API client menggunakan axios
2. Setup React Query untuk state management
3. Implementasi service layer untuk API calls
4. Error handling untuk API calls
5. Authentication dan authorization
6. Environment variables untuk API endpoint

## Scripts

- `bun run dev` - Menjalankan development server
- `bun run build` - Build aplikasi untuk production
- `bun run lint` - Menjalankan ESLint
- `bun run preview` - Preview build hasil production

## Expanding the ESLint configuration

Jika Anda mengembangkan aplikasi untuk production, kami merekomendasikan untuk mengaktifkan type-aware lint rules. Lihat dokumentasi ESLint untuk detail konfigurasi lebih lanjut.
