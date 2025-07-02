# Troubleshooting: Reviews Tidak Tampil

## Masalah
Reviews yang tadi bisa tampil sekarang tidak tampil lagi di dashboard tour guide.

## Kemungkinan Penyebab
1. **ID Tour Guide berubah** - setelah perbaikan code, ID yang diteruskan mungkin berbeda
2. **Data reviews hilang** - mungkin data di database terhapus
3. **Cache browser** - data lama masih di-cache
4. **Error di query** - ada error di function reviewService

## Langkah Troubleshooting

### 1. Buka Browser Console dan Jalankan Script Debug
```javascript
// Copy paste script ini di browser console setelah login sebagai tour guide

async function quickDebug() {
  console.log('=== QUICK DEBUG REVIEWS ===');
  
  try {
    // Check user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user:', user);
    
    // Manual check dengan fetch API
    const response = await fetch('/api/supabase-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    
    console.log('API check result:', response);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

quickDebug();
```

### 2. Check Network Tab
- Buka DevTools → Network tab
- Refresh halaman reviews
- Lihat apakah ada request ke Supabase API
- Check apakah ada error 400, 404, atau 500

### 3. Check Console Logs
Setelah masuk ke halaman Reviews, lihat console untuk:
- `TourGuideId received: ...` 
- `Starting fetch reviews for tour guide ID: ...`
- `Debug result: ...`
- `Simple query succeeded: ...` atau error messages

### 4. Manual Check Data di Supabase
Jika punya akses ke Supabase dashboard:
1. Cek tabel `tour_guides` - pastikan ada record dengan ID yang benar
2. Cek tabel `reviews` - pastikan ada reviews dengan `tour_guide_id` yang sesuai
3. Cek tabel `users` - pastikan user yang login ada dan role-nya benar

### 5. Add Test Data
Jika tidak ada data reviews, jalankan script untuk menambah test data:
```javascript
// Copy paste script dari file: add-test-reviews-browser.js
```

### 6. Clear Cache & Hard Refresh
- Tekan Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
- Atau buka DevTools → Application → Storage → Clear storage

## Expected Console Output
Ketika berfungsi normal, seharusnya terlihat:
```
TourGuideId received: 1 Type: string Parsed: 1
Starting fetch reviews for tour guide ID: 1
Starting to fetch reviews for tour guide: 1
=== DEBUG: Checking reviews for tour guide ID: 1 ===
Tour guide found: { id: 1, user_id: 123, guide_name: "..." }
Reviews for tour guide ID 1: [array of reviews]
Simple query succeeded, got reviews: [array of reviews]
```

## Solution Steps
1. ✅ Perbaikan error 400 pada query count - DONE
2. ✅ Perbaikan ID tour guide yang diteruskan ke ReviewsContent - DONE  
3. 🔄 Check data actual di database - IN PROGRESS
4. 🔄 Add test data jika kosong - READY TO RUN

## Next Actions
1. Jalankan script debug di browser console
2. Check hasil console logs
3. Jika data kosong, jalankan script add test data
4. Refresh halaman untuk melihat hasil
