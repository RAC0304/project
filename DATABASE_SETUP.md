# 🗄️ Database Connection Setup Guide

Panduan lengkap untuk menghubungkan WanderWise dengan database Neon PostgreSQL.

## 📋 Prerequisites

- Node.js 18+
- NPM atau Yarn
- Akun Neon PostgreSQL (https://neon.tech)

## 🚀 Langkah-langkah Setup

### 1. Buat Database di Neon

1. Buka [Neon Console](https://console.neon.tech)
2. Klik "Create Project"
3. Pilih region terdekat (Singapore untuk Indonesia)
4. Salin connection string yang diberikan

### 2. Konfigurasi Environment Variables

1. Buka file `.env` di root project
2. Update konfigurasi database dengan credentials Neon Anda:

```env
# Neon PostgreSQL Database Configuration
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
DB_HOST=ep-xxx-xxx.region.aws.neon.tech
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
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
- Membaca file `database/wanderwise_neon.sql`
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
└── setup-database.js           # Script setup database

database/
├── wanderwise_neon.sql         # Schema lengkap untuk Neon
├── wanderwise_neon_part1.sql   # Setup dan types
├── wanderwise_neon_part2.sql   # Core tables
├── wanderwise_neon_part3.sql   # Destinations & content
├── wanderwise_neon_part4.sql   # Tours & bookings
├── wanderwise_neon_part5.sql   # Reviews & responses
├── wanderwise_neon_part6.sql   # Itinerary management
└── wanderwise_neon_part7.sql   # Sample data
```

## 🔧 Services Overview

### DatabaseService

- Singleton pattern untuk connection pooling
- Support untuk transactions
- Error handling dan logging
- Connection pool monitoring

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

1. **Check credentials**: Pastikan DATABASE*URL atau DB*\* variables benar
2. **Check network**: Pastikan firewall tidak memblokir koneksi
3. **Check SSL**: Neon requires SSL connection
4. **Check database exists**: Pastikan database sudah dibuat di Neon

### Schema Errors

1. **Run setup again**: `npm run db:setup`
2. **Check permissions**: Pastikan user memiliki CREATE permission
3. **Check syntax**: Lihat log error untuk statement yang gagal

### Performance Issues

1. **Monitor pool**: Check connection pool status
2. **Add indexes**: Tambah index untuk query yang sering digunakan
3. **Optimize queries**: Review query performance di Neon dashboard

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
3. Test koneksi manual ke Neon
4. Check Neon dashboard untuk status database

## 🎯 Next Steps

Setelah database setup berhasil:

1. Implementasi authentication
2. Setup API endpoints
3. Implement CRUD operations
4. Add real-time features
5. Setup monitoring dan alerts

---

**Happy coding! 🚀**
