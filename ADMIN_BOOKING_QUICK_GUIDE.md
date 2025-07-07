# 🎯 Quick Guide: Admin Booking Confirmation

## 📍 **Cara Akses (5 Detik)**
1. Buka: `http://localhost:5173/admin`
2. Login sebagai admin
3. Klik menu **"Trip Requests"** di sidebar kiri (BUKAN "Tour Bookings")
4. Lihat daftar itinerary requests dari customer

## 🔄 **Workflow Konfirmasi (3 Langkah)**

### Status: **PENDING** (Kuning)
- Klik tombol **"Start Processing"** (Biru)
- Status berubah jadi **PROCESSING**

### Status: **PROCESSING** (Biru)  
- Klik tombol **"Confirm & Set Price"** (Hijau)
- Isi modal: harga, tanggal bayar, notes
- Klik **"Confirm Trip"**
- Status berubah jadi **CONFIRMED**

### Status: **CONFIRMED** (Hijau)
- Customer dapat notifikasi otomatis
- Siap untuk pembayaran dan trip

## 💰 **Modal Konfirmasi**
- **Total Price**: Auto-calculate (bisa edit)
- **Payment Due Date**: Default 7 hari (bisa edit)
- **Admin Notes**: Catatan untuk customer

## 🔔 **Notifikasi Otomatis**
- **Processing**: "Your trip is being reviewed..."
- **Confirmed**: "Great news! Your trip is confirmed..."
- **Rejected**: "Unable to accommodate your request..."

## 🚨 **Troubleshooting**
- **Menu tidak ada**: Refresh atau login ulang
- **Tombol tidak muncul**: Cek koneksi database
- **Error konfirmasi**: Lihat console browser

## 📋 **Checklist Cepat**
- [ ] Login sebagai admin
- [ ] Buka menu **"Trip Requests"** (BUKAN "Tour Bookings")
- [ ] Klik "Start Processing" untuk pending
- [ ] Klik "Confirm & Set Price" untuk processing
- [ ] Isi harga dan tanggal bayar
- [ ] Klik "Confirm Trip"
- [ ] Customer otomatis dapat notifikasi

**⚠️ Penting: "Tour Bookings" = booking tour guide (fitur lama), "Trip Requests" = booking itinerary (fitur baru)**

**Total waktu per konfirmasi: ~2 menit**
