# Panduan Konfirmasi Booking untuk Admin

## 🎯 **Ringkasan Sistem Konfirmasi**

Admin adalah pihak yang **bertanggung jawab penuh** untuk mengkonfirmasi booking customer. Tour guide hanya berperan sebagai executor, tidak memiliki akses konfirmasi.

## 📍 **Lokasi Menu Konfirmasi**

### **1. Cara Akses Admin Dashboard**
```
URL: http://localhost:5173/admin
Login: Gunakan akun admin yang sudah terdaftar
Menu: Klik "Bookings" di sidebar kiri (sudah tersedia)
```

### **2. Tampilan Dashboard**
- **✅ Menu Bookings**: Sudah tersedia di sidebar grup "Operations"
- **Daftar Booking**: Semua request booking customer dalam satu halaman
- **Status Indicator**: Badge berwarna sesuai status (pending, processing, confirmed, dll)
- **Action Buttons**: Tombol untuk mengubah status sesuai workflow

### **3. Struktur Menu Admin**
```
📁 Main
  └── 📊 Dashboard

📁 Management  
  └── 👥 Users
  └── 🧑‍🏫 Tour Guides
  └── 🛡️ Security
  └── 💾 Database

📁 Content
  └── 📍 Destinations
  └── 📅 Itineraries

📁 Operations
  └── 📋 Tour Bookings (Booking tour guide - fitur yang sudah ada)
  └── 🗺️ Trip Requests ← MENU KONFIRMASI ITINERARY REQUESTS ADA DI SINI
  └── 📈 Analytics
```

## 🔄 **Workflow Konfirmasi Booking**

### **Status Flow:**
```
1. PENDING (Kuning) 
   ↓ [Admin klik "Start Processing"]
2. PROCESSING (Biru)
   ↓ [Admin klik "Confirm & Set Price"]
3. CONFIRMED (Hijau)
   ↓ [Setelah trip selesai]
4. COMPLETED (Hijau tua)
```

### **Alternative Flow:**
```
PENDING/PROCESSING → REJECTED (Merah)
PENDING/PROCESSING → CANCELLED (Merah)
```

## 🎛️ **Tombol Konfirmasi yang Tersedia**

### **1. "Start Processing" (Biru)**
- **Kapan Muncul**: Ketika status = `pending`
- **Fungsi**: Mengubah status menjadi `processing`
- **Artinya**: Admin mulai review dan persiapan itinerary

### **2. "Confirm & Set Price" (Hijau)**
- **Kapan Muncul**: Ketika status = `processing`
- **Fungsi**: Buka modal konfirmasi untuk set harga
- **Artinya**: Admin konfirmasi booking dengan detail harga

### **3. "Reject" (Merah)**
- **Kapan Muncul**: Untuk semua status kecuali `rejected`/`cancelled`
- **Fungsi**: Tolak booking request
- **Artinya**: Booking tidak bisa diproses

## 💰 **Modal Konfirmasi Harga**

Ketika admin klik "Confirm & Set Price", akan muncul modal dengan:

### **Field yang Harus Diisi:**
1. **Total Price (USD)**: Harga final trip
   - Auto-calculated: Days × GroupSize × $150
   - Bisa diedit manual

2. **Payment Due Date**: Batas waktu pembayaran
   - Default: 7 hari dari sekarang
   - Bisa disesuaikan

3. **Admin Notes**: Catatan untuk customer
   - Opsional
   - Muncul di notifikasi customer

### **Setelah Konfirmasi:**
- Status berubah ke `confirmed`
- Customer dapat notifikasi otomatis
- Harga dan due date tersimpan di database

## 🔔 **Notifikasi Otomatis untuk Customer**

### **Status "Processing":**
```
Judul: "Your Trip Request is Being Reviewed"
Pesan: "Kami telah menerima permintaan trip Anda dan tim kami sedang meninjau detailnya. Kami akan menghubungi Anda dalam 24-48 jam dengan konfirmasi dan detail harga."
```

### **Status "Confirmed":**
```
Judul: "Great News! Your Trip is Confirmed"
Pesan: "Selamat! Permintaan trip Anda telah dikonfirmasi. Silakan cek email untuk itinerary detail dan instruksi pembayaran. Kami menantikan untuk memberikan pengalaman travel yang luar biasa."
```

### **Status "Rejected":**
```
Judul: "Trip Request Update"
Pesan: "Maaf, kami tidak dapat mengakomodasi permintaan trip Anda saat ini. Ini bisa karena ketersediaan, pembatasan musiman, atau faktor lain."
```

## 📊 **Fitur Dashboard Admin**

### **Informasi yang Ditampilkan:**
- **Customer Details**: Nama, email, telepon
- **Trip Details**: Itinerary, tanggal, durasi
- **Group Info**: Jumlah peserta
- **Status**: Current status dengan warna
- **Timeline**: Kapan booking dibuat/diupdate
- **Special Requests**: Permintaan khusus customer

### **Status Indicators:**
- 🟡 **Pending**: Belum diproses
- 🔵 **Processing**: Sedang diproses
- 🟢 **Confirmed**: Sudah dikonfirmasi
- 🔴 **Rejected**: Ditolak
- 🔴 **Cancelled**: Dibatalkan
- 🟢 **Completed**: Selesai

## 🛠️ **Troubleshooting**

### **Problem 1: Menu Bookings tidak muncul**
**Solusi**: 
- Pastikan login sebagai admin (bukan user biasa)
- Refresh halaman dengan Ctrl+F5
- Cek console browser untuk error

### **Problem 2: Menu Bookings kosong**
**Solusi**: 
- Pastikan ada customer yang sudah booking
- Cek koneksi Supabase
- Pastikan tabel `itinerary_requests` ada data

### **Problem 3: Tombol tidak muncul**
**Solusi**: 
- Refresh halaman atau cek koneksi database
- Pastikan user memiliki role admin
- Periksa console untuk error detail

### **Problem 4: Error saat konfirmasi**
**Solusi**: 
- Pastikan login sebagai admin
- Cek koneksi Supabase
- Periksa console untuk error detail
- Pastikan migration database sudah dijalankan

### **Problem 5: Notifikasi tidak terkirim**
**Solusi**: 
- Cek trigger database aktif
- Periksa table `itinerary_notifications`
- Pastikan customer user_id valid

### **Problem 6: Harga tidak tersimpan**
**Solusi**:
- Pastikan field `total_price` di database ada
- Cek format input harga (number, bukan string)
- Periksa validation di form

## 🎯 **Best Practices**

### **1. Response Time**
- **Pending → Processing**: Maksimal 4 jam
- **Processing → Confirmed**: Maksimal 24 jam

### **2. Komunikasi**
- Selalu isi admin notes yang jelas
- Set payment due date yang reasonable
- Double-check harga sebelum konfirmasi

### **3. Pricing**
- Base price: $150/day/person
- Tambahan guide: $50/day
- Adjust berdasarkan kompleksitas trip

## 📋 **Checklist Konfirmasi**

### **Sebelum Konfirmasi:**
- [ ] Review detail itinerary
- [ ] Cek availability tanggal
- [ ] Konfirmasi guide assignment
- [ ] Hitung harga yang akurat
- [ ] Siapkan payment instructions

### **Saat Konfirmasi:**
- [ ] Set harga yang tepat
- [ ] Tentukan payment due date
- [ ] Tulis admin notes yang informatif
- [ ] Klik "Confirm Trip"

### **Setelah Konfirmasi:**
- [ ] Pantau customer dashboard
- [ ] Siapkan detailed itinerary
- [ ] Follow up payment status
- [ ] Koordinasi dengan guide

## 📞 **Escalation Path**

Jika ada masalah dalam proses konfirmasi:
1. **Technical Issue**: Hubungi developer
2. **Business Issue**: Diskusi dengan manager
3. **Customer Complaint**: Direct communication

---

**Sistem ini dirancang untuk memberikan kontrol penuh kepada admin dalam mengelola booking sambil memberikan transparency kepada customer melalui notifikasi otomatis dan status tracking.**
