# Petunjuk Penyelesaian Sistem Review

## Status Saat Ini

✅ File `HistoryPage.tsx` sudah terintegrasi dengan sistem review
✅ Function `createBookingReview` sudah dibuat di `reviewService.ts`
✅ Function `getUserBookingReviews` sudah ada untuk menampilkan review user
✅ Function dan trigger SQL sudah disiapkan di database

## Langkah Penyelesaian

### 1. Setup Database Trigger (PENTING)

**Buka Supabase SQL Editor dan jalankan:**

```sql
-- Copy-paste seluruh isi file: database/setup_trigger_rating.sql
```

File ini akan:

- Membuat ulang trigger `update_tour_guide_rating`
- Melakukan test otomatis untuk memastikan trigger bekerja
- Memperbaiki rating yang sudah ada di database
- Menampilkan log untuk debugging

### 2. Test Sistem Review

1. **Buka aplikasi**: http://localhost:5174/
2. **Login sebagai customer**
3. **Pergi ke History page** (User Profile → History tab)
4. **Pastikan ada booking dengan status "completed"**:
   - Jika belum ada, ubah status booking di database: `UPDATE bookings SET status='completed', payment_status='paid' WHERE id=X`
5. **Klik "Write Review"** pada booking yang eligible
6. **Isi form review** dan submit
7. **Cek rating tour guide di database** setelah review berhasil

### 3. Verifikasi Trigger Bekerja

**Query untuk cek rating sebelum dan sesudah review:**

```sql
-- 1. Cek rating tour guide saat ini
SELECT id, rating, review_count, updated_at
FROM tour_guides
ORDER BY updated_at DESC;

-- 2. Cek review terbaru
SELECT id, tour_guide_id, rating, title, created_at
FROM reviews
ORDER BY created_at DESC
LIMIT 5;

-- 3. Manual check: rating harus = rata-rata dari semua review
SELECT
  tg.id as guide_id,
  tg.rating as stored_rating,
  tg.review_count as stored_count,
  COALESCE(AVG(r.rating), 0) as calculated_rating,
  COUNT(r.id) as calculated_count
FROM tour_guides tg
LEFT JOIN reviews r ON r.tour_guide_id = tg.id
GROUP BY tg.id, tg.rating, tg.review_count
HAVING ABS(tg.rating - COALESCE(AVG(r.rating), 0)) > 0.1
   OR tg.review_count != COUNT(r.id);
```

Jika query terakhir mengembalikan hasil, berarti trigger belum bekerja dengan benar.

### 4. Troubleshooting

**Jika rating tidak update otomatis:**

1. **Cek trigger ada:**

```sql
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_tour_guide_rating';
```

2. **Cek log trigger:**

```sql
-- Enable logging (jika perlu)
SET log_statement = 'all';
SET log_min_messages = 'notice';
```

3. **Manual update rating:**

```sql
-- Fix semua rating sekaligus
UPDATE tour_guides
SET
  rating = COALESCE((
    SELECT AVG(r.rating)
    FROM reviews r
    WHERE r.tour_guide_id = tour_guides.id
  ), 0),
  review_count = COALESCE((
    SELECT COUNT(r.id)
    FROM reviews r
    WHERE r.tour_guide_id = tour_guides.id
  ), 0);
```

### 5. Fitur yang Sudah Selesai

✅ **Review Eligibility**: Hanya booking "completed" & "paid" yang belum di-review
✅ **Prevent Double Review**: User tidak bisa review 2x untuk booking yang sama  
✅ **Review Display**: Tab "My Reviews" untuk melihat review yang sudah dibuat
✅ **Review Details**: Modal untuk melihat detail review
✅ **Statistics**: Menampilkan jumlah trip, reviewed, dan pending review
✅ **Auto Rating Update**: Trigger untuk update rating tour guide (perlu diaktifkan)

### 6. Test Flow Lengkap

1. **Customer login** → History Page
2. **Melihat completed bookings** yang eligible untuk review
3. **Write review** → Form validation → Submit berhasil
4. **Review tersimpan** di database dengan benar
5. **Rating tour guide** otomatis terupdate
6. **Booking tidak lagi eligible** untuk review (tombol berubah "Already Reviewed")
7. **Review muncul** di tab "My Reviews"
8. **Detail review** bisa dilihat via modal

### 7. File-File Penting

- `src/pages/HistoryPage.tsx` - UI utama sistem review
- `src/services/reviewService.ts` - API calls untuk review
- `src/services/bookingStatusService.ts` - Eligibility check
- `database/setup_trigger_rating.sql` - Script setup trigger rating
- `database/booking_status_functions.sql` - Function `can_user_review`

## Hasil Akhir

Setelah setup trigger selesai, sistem review akan berfungsi sepenuhnya:

- Customer bisa review booking yang completed
- Rating tour guide otomatis terupdate
- Tidak ada double review untuk booking yang sama
- UI menampilkan semua review yang pernah dibuat user

**Next Steps**: Implementasi sistem review juga bisa ditambahkan untuk tour guide dashboard untuk melihat dan merespon review dari customer.
