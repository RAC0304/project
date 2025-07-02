# Fix untuk Destination ID pada Reviews

## Masalah

Field `destination_id` di tabel `reviews` tidak terisi saat membuat review dari booking karena:

1. Tabel `tours` tidak memiliki field `destination_id`
2. Kode tidak menyertakan `destinationId` saat memanggil `createBookingReview`

## Solusi yang Diimplementasikan

### 1. Database Migration

File: `database/add_destination_id_to_tours.sql`

Menambahkan field `destination_id` ke tabel `tours` untuk menghubungkan tour dengan destination.

### 2. Update Interface dan Kode

**File yang diubah:**

- `src/services/bookingStatusService.ts` - Menambahkan `destination_id` ke query dan interface
- `src/pages/HistoryPage.tsx` - Menyertakan `destinationId` saat membuat review
- `src/components/customer/ReviewModal.tsx` - Menyertakan `destinationId` saat membuat review

## Langkah-langkah Implementasi

### 1. Jalankan Migration Database

```sql
-- Buka Supabase SQL Editor dan jalankan:
ALTER TABLE tours ADD COLUMN destination_id BIGINT;
ALTER TABLE tours
ADD CONSTRAINT tours_destination_id_fkey
FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL;
CREATE INDEX idx_tours_destination_id ON tours (destination_id);
```

### 2. Update Data Tours dengan Destination ID

Anda perlu manually mengupdate tours yang sudah ada untuk menghubungkannya dengan destination berdasarkan lokasi:

```sql
-- Contoh update berdasarkan location
UPDATE tours SET destination_id = 1 WHERE location ILIKE '%bali%';
UPDATE tours SET destination_id = 2 WHERE location ILIKE '%jakarta%';
UPDATE tours SET destination_id = 3 WHERE location ILIKE '%yogyakarta%' OR location ILIKE '%yogya%';
UPDATE tours SET destination_id = 4 WHERE location ILIKE '%lombok%';
UPDATE tours SET destination_id = 5 WHERE location ILIKE '%raja ampat%';
UPDATE tours SET destination_id = 6 WHERE location ILIKE '%komodo%';
UPDATE tours SET destination_id = 7 WHERE location ILIKE '%bromo%';
UPDATE tours SET destination_id = 8 WHERE location ILIKE '%toba%';

-- Cek tours yang belum ada destination_id
SELECT id, title, location, destination_id FROM tours WHERE destination_id IS NULL;
```

### 3. Test Review System

Setelah migration dan update data:

1. **Login sebagai customer**
2. **Pastikan ada booking dengan status 'completed' dan 'paid'**
3. **Buat review melalui History page**
4. **Cek di database apakah destination_id terisi:**

```sql
SELECT id, user_id, booking_id, destination_id, tour_guide_id, title
FROM reviews
WHERE destination_id IS NOT NULL
ORDER BY created_at DESC;
```

## Verifikasi

### Query untuk cek apakah fix berhasil:

```sql
-- 1. Cek struktur tabel tours
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tours' AND column_name = 'destination_id';

-- 2. Cek foreign key constraint
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.key_column_usage
WHERE constraint_name = 'tours_destination_id_fkey';

-- 3. Cek review terbaru dengan destination_id
SELECT r.id, r.title, r.destination_id, d.name as destination_name, t.title as tour_title
FROM reviews r
LEFT JOIN destinations d ON r.destination_id = d.id
LEFT JOIN bookings b ON r.booking_id = b.id
LEFT JOIN tours t ON b.tour_id = t.id
WHERE r.destination_id IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 10;
```

## Hasil yang Diharapkan

Setelah implementasi:

- ✅ Tabel `tours` memiliki field `destination_id`
- ✅ Review yang dibuat dari booking akan memiliki `destination_id` yang terisi
- ✅ Review dapat difilter berdasarkan destination
- ✅ Statistik review per destination bisa dihitung dengan akurat

## Troubleshooting

**Jika destination_id masih NULL pada review baru:**

1. Pastikan migration database sudah dijalankan
2. Pastikan tours sudah diupdate dengan destination_id yang benar
3. Restart aplikasi untuk memastikan kode terbaru terload
4. Cek console browser untuk error saat membuat review

**Jika ada error foreign key:**

1. Pastikan semua destination_id yang diset ke tours benar-benar exist di tabel destinations
2. Gunakan query untuk cek: `SELECT id FROM destinations ORDER BY id;`
