# 🗄️ Database Connection Setup Guide

Panduan lengkap untuk menghubungkan WanderWise dengan database Supabase PostgreSQL.

## 📋 Prerequisites

- Node.js 18+
- NPM atau Yarn
- Akun Supabase (https://supabase.com)

## 🚀 Langkah-langkah Setup

### 1. Buat Database di Supabase

1. Buka [Supabase Console](https://app.supabase.com)
2. Klik "New Project"
3. Pilih organization atau buat yang baru
4. Masukkan nama project: `wanderwise-indonesia`
5. Buat database password yang kuat
6. Pilih region terdekat (Singapore untuk Indonesia)
7. Tunggu project setup selesai

### 2. Konfigurasi Environment Variables

1. Buka file `.env` di root project
2. Update konfigurasi database dengan credentials Supabase Anda:

```env
# Supabase PostgreSQL Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DB_HOST=db.[YOUR-PROJECT-REF].supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=[YOUR-PASSWORD]
```

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

- Test koneksi ke database
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
├── setup-db.js                # Script setup database untuk Supabase
├── test-connection.js          # Test koneksi Supabase
└── setup-demo-users.js        # Setup user demo

database/
└── wanderwise_supabase.sql     # Schema lengkap untuk Supabase
```

## 🔧 Services Overview

### DatabaseService

- **Location**: `src/services/databaseService.ts`
- **Purpose**: Mengelola koneksi pool PostgreSQL untuk Supabase
- **Features**:
  - Connection pooling
  - Error handling
  - Health checks
  - Transaction management
  - SSL connection support

### ApiService

- High-level API untuk database operations
- Pagination support
- Search dan filtering
- Type-safe responses

## 🏗️ Database Schema

Database terdiri dari 15+ tabel utama:

- **users**: Pengguna sistem (admin, tour guide, customer)
- **tour_guides**: Profil tour guide
- **destinations**: Destinasi wisata
- **tours**: Tour yang ditawarkan
- **bookings**: Pemesanan tour
- **reviews**: Review dan rating
- **itineraries**: Paket itinerary
- **security_logs**: Log aktivitas keamanan

## 🔒 Security Features

- SSL/TLS encryption untuk koneksi database
- Connection pooling untuk performa
- Prepared statements untuk mencegah SQL injection
- Environment variables untuk credentials
- Security logging untuk audit trail

## 🚨 Troubleshooting

### Connection Failed

1. **Check credentials**: Pastikan DATABASE_URL benar dan sesuai format Supabase
2. **Check network**: Pastikan firewall tidak memblokir koneksi
3. **Check SSL**: Supabase requires SSL connection
4. **Check database exists**: Pastikan project Supabase sudah aktif

### Schema Errors

1. **Run setup again**: `npm run db:setup`
2. **Check permissions**: Pastikan user memiliki CREATE permission
3. **Check syntax**: Lihat log error untuk statement yang gagal

### Performance Issues

1. **Monitor pool**: Check connection pool status
2. **Add indexes**: Tambah index untuk query yang sering digunakan
3. **Optimize queries**: Review query performance di Supabase dashboard
4. **Use Edge Functions**: Manfaatkan Supabase Edge Functions untuk operasi kompleks

## 📊 Monitoring

- Connection pool metrics tersedia di `DatabaseService.getPoolStatus()`
- Security logs otomatis tersimpan di tabel `security_logs`
- Database statistics bisa diakses via `ApiService.getDatabaseStats()`

## 🔄 Migration

Untuk update schema di masa depan:

1. Buat file migration baru
2. Update schema version
3. Run migration script
4. Test di development environment dulu

## 📞 Support

Jika mengalami masalah:

1. Check log error di console
2. Verify environment configuration
3. Test koneksi manual ke Supabase
4. Check Supabase dashboard untuk status database
5. Review Supabase documentation

## 🎯 Next Steps

Setelah database setup berhasil:

1. Implementasi authentication
2. Setup API endpoints
3. Implement CRUD operations
4. Add real-time features
5. Setup monitoring dan alerts

---

**Happy coding dengan Supabase! 🚀**
