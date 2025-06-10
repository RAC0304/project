# 🗄️ Database Connection Setup Guide - Supabase

Panduan lengkap untuk menghubungkan WanderWise dengan database Supabase PostgreSQL.

## 📋 Prerequisites

- Node.js 18+
- NPM atau Yarn
- Akun Supabase (https://supabase.com)

## 🚀 Langkah-langkah Setup

### 1. Buat Project di Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Pilih organization atau buat yang baru
4. Masukkan nama project: `wanderwise-indonesia`
5. Buat database password yang kuat
6. Pilih region terdekat (Singapore untuk Indonesia)
7. Tunggu project setup selesai (sekitar 2-3 menit)

### 2. Konfigurasi Environment Variables

1. Di Supabase Dashboard, masuk ke **Settings > Database**
2. Scroll ke bawah dan cari **Connection String**
3. Pilih **URI** dan copy connection string
4. Buka file `.env` di root project
5. Update konfigurasi database dengan credentials Supabase Anda:

```env
# Supabase PostgreSQL Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DB_HOST=db.[YOUR-PROJECT-REF].supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=[YOUR-PASSWORD]
```

**Catatan penting:**

- Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat
- Ganti `[YOUR-PROJECT-REF]` dengan project reference dari Supabase
- Project reference bisa ditemukan di URL dashboard atau di Settings > General

### 3. Install Dependencies

```bash
npm install
```

Dependencies yang diperlukan:

- `pg`: PostgreSQL client untuk Node.js
- `@types/pg`: TypeScript types untuk pg
- `dotenv`: Environment variables loader

### 4. Setup Database Schema

Jalankan script untuk membuat tabel-tabel database:

```bash
npm run db:setup
```

Script ini akan:

- Test koneksi ke Supabase
- Membaca file `database/wanderwise_supabase.sql`
- Mengeksekusi semua DDL statements
- Membuat semua tabel, indexes, dan triggers
- Insert data sample admin user

### 5. Test Koneksi

Test koneksi database:

```bash
npm run db:test
```

Atau test melalui UI di halaman admin dashboard.

### 6. Setup Demo Users (Opsional)

Untuk testing dan development:

```bash
node scripts/setup-demo-users.js
```

## 📁 File Structure

```
src/
├── config/
│   └── environment.ts          # Konfigurasi environment
├── services/
│   ├── databaseService.ts      # Database connection service
│   └── apiService.ts           # API service layer
├── types/
│   └── database.ts             # Database entity types
└── components/admin/
    └── DatabaseConnectionTest.tsx # UI untuk test koneksi

scripts/
├── setup-db-supabase.js       # Script setup database untuk Supabase
├── test-connection-supabase.js # Test koneksi Supabase
└── setup-demo-users.js        # Setup user demo

database/
├── wanderwise_supabase.sql     # Schema lengkap untuk Supabase
└── wanderwise_neon.sql         # Schema untuk Neon (backup)
```

## 🔧 Services Overview

### DatabaseService

- **Location**: `src/services/databaseService.ts`
- **Purpose**: Mengelola koneksi pool PostgreSQL
- **Features**:
  - Connection pooling
  - Error handling
  - Health checks
  - Transaction management

### ApiService

- **Location**: `src/services/apiService.ts`
- **Purpose**: HTTP client untuk komunikasi dengan backend
- **Features**:
  - RESTful API calls
  - Request/response interceptors
  - Error handling

## 🏗️ Database Schema

Schema database mencakup:

### Core Tables

- `users` - User management dan authentication
- `security_logs` - Audit trail dan security events
- `destinations` - Data destinasi wisata
- `tours` - Paket tour dan itinerary
- `bookings` - Reservasi dan pembayaran
- `reviews` - Review dan rating
- `tour_guides` - Data tour guide

### Content Tables

- `cultural_insights` - Konten budaya lokal
- `itineraries` - Detail itinerary perjalanan
- `itinerary_activities` - Aktivitas dalam itinerary

### System Tables

- `analytics_events` - Event tracking
- `notifications` - System notifications
- `settings` - Application settings

## 🔒 Security Features

### Row Level Security (RLS)

Supabase mendukung RLS yang dapat dikonfigurasi untuk:

- User isolation
- Role-based access
- Data protection

### Authentication Integration

- Dapat menggunakan Supabase Auth (opsional)
- Custom authentication dengan bcrypt
- Session management

### Audit Logging

- Semua aktivitas penting tercatat di `security_logs`
- IP tracking dan user agent logging
- Failed login attempts monitoring

## 🚨 Troubleshooting

### Connection Failed

1. **Check credentials**: Pastikan DATABASE*URL atau DB*\* variables benar
2. **Check network**: Pastikan firewall tidak memblokir koneksi
3. **Check SSL**: Supabase memerlukan SSL connection
4. **Check project status**: Pastikan project Supabase aktif

### Schema Errors

1. **Run setup again**: `npm run db:setup`
2. **Check permissions**: Pastikan user memiliki CREATE permission
3. **Check syntax**: Lihat log error untuk statement yang gagal
4. **Reset database**: Drop tables manual di Supabase SQL Editor

### Performance Issues

1. **Monitor pool**: Check connection pool status
2. **Add indexes**: Tambah index untuk query yang sering digunakan
3. **Optimize queries**: Review query performance di Supabase Dashboard
4. **Use connection pooling**: Supabase sudah include PgBouncer

## 📊 Monitoring

### Database Metrics

- Connection pool metrics tersedia di `DatabaseService.getPoolStatus()`
- Security logs otomatis tersimpan di tabel `security_logs`
- Database statistics bisa diakses via `ApiService.getDatabaseStats()`

### Supabase Dashboard

- Real-time database stats
- Query performance monitoring
- API usage metrics
- Connection monitoring

## 🔄 Migration

Untuk update schema di masa depan:

1. Buat file migration baru
2. Update schema version
3. Run migration script
4. Test di development environment dulu

### Migration Tools

- Supabase CLI untuk migration management
- Manual SQL execution via Supabase SQL Editor
- Custom migration scripts

## 📞 Support

Jika mengalami masalah:

1. Check log error di console
2. Verify environment configuration
3. Test koneksi manual ke Supabase
4. Check Supabase dashboard untuk status project
5. Review Supabase logs di Dashboard

### Supabase Resources

- [Documentation](https://supabase.com/docs)
- [Community Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase)

## 🎯 Next Steps

Setelah database setup berhasil:

1. **Authentication**: Setup Supabase Auth atau gunakan custom auth
2. **API endpoints**: Implement CRUD operations
3. **Real-time features**: Gunakan Supabase Realtime subscriptions
4. **File storage**: Setup Supabase Storage untuk gambar
5. **Edge Functions**: Deploy serverless functions di Supabase

### Supabase Features to Explore

- **Auth**: Built-in authentication
- **Storage**: File upload dan CDN
- **Edge Functions**: Serverless Deno functions
- **Realtime**: WebSocket subscriptions
- **API**: Auto-generated REST dan GraphQL APIs

---

**Happy coding with Supabase! 🚀**
