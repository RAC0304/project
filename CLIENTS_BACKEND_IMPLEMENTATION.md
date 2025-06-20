# Implementasi Backend Clients untuk Dashboard Tour Guide

## Overview

Dokumen ini menjelaskan implementasi logika backend untuk mengelola data clients di dashboard tour guide yang terintegrasi dengan Supabase.

## Arsitektur

### 1. Service Layer (`clientsService.ts`)

Service utama yang menangani komunikasi dengan database Supabase:

- **getClientsByTourGuide()**: Mengambil daftar clients untuk tour guide tertentu
- **getClientStats()**: Menghitung statistik clients (total, active, bookings, rating)
- **getClientDetails()**: Mengambil detail lengkap client termasuk riwayat booking
- **sendMessageToClient()**: Mengirim pesan ke client (placeholder)
- **updateClientNotes()**: Update catatan private tour guide tentang client

### 2. Hook Layer (`useClients.ts`)

React hook untuk state management dan integrasi dengan UI:

- State management untuk clients, loading, error
- Filtering dan pagination
- Refresh functionality
- Error handling

### 3. Component Layer (`ClientsContent.tsx`)

UI component yang menggunakan hook dan menampilkan data:

- Daftar clients dengan search dan filter
- Statistik dashboard
- Detail modal client
- Pagination

## Database Schema

### Tabel Utama

1. **users**: Data pengguna (clients)
2. **tour_guides**: Data tour guide
3. **tours**: Tour yang ditawarkan tour guide
4. **bookings**: Booking yang dilakukan clients
5. **reviews**: Review dari clients

### Relationships

```
users (clients) -> bookings -> tours -> tour_guides
users (clients) -> reviews -> tours -> tour_guides
```

## Query Logic

### Mengambil Clients

```sql
SELECT DISTINCT
  users.*,
  COUNT(bookings.id) as total_bookings,
  SUM(bookings.total_amount) as total_spent,
  MAX(bookings.date) as last_booking
FROM bookings
JOIN users ON bookings.user_id = users.id
JOIN tours ON bookings.tour_id = tours.id
WHERE tours.tour_guide_id = ?
GROUP BY users.id
```

### Status Client

- **Active**: Booking dalam 6 bulan terakhir
- **Inactive**: Tidak ada booking dalam 6 bulan terakhir

## Features Implemented

### ✅ Sudah Diimplementasi

1. **Daftar Clients**: Menampilkan semua clients tour guide
2. **Search & Filter**: Berdasarkan nama, email, dan status
3. **Pagination**: Untuk performa yang lebih baik
4. **Statistik**: Total clients, active clients, total bookings, average rating
5. **Client Details**: Modal dengan detail lengkap client
6. **Loading States**: Loading indicators dan error handling
7. **Responsive Design**: UI yang responsif

### 🔄 Dalam Pengembangan

1. **Messaging System**: Kirim pesan ke clients
2. **Notes System**: Catatan private tour guide
3. **Advanced Filtering**: Filter berdasarkan lokasi, tanggal
4. **Export Data**: Export daftar clients

### 📝 Rencana Pengembangan

1. **Real-time Updates**: WebSocket untuk update real-time
2. **Advanced Analytics**: Grafik dan analisis mendalam
3. **Automated Communication**: Template pesan otomatis
4. **Client Segmentation**: Grouping clients berdasarkan kriteria

## Error Handling

1. **Database Errors**: Try-catch dengan logging
2. **Network Errors**: Retry mechanism
3. **Validation Errors**: Input validation
4. **User Feedback**: Error messages yang user-friendly

## Performance Optimizations

1. **Pagination**: Limit data yang dimuat
2. **Lazy Loading**: Load detail hanya saat dibutuhkan
3. **Caching**: Cache data statistik
4. **Debounced Search**: Mengurangi API calls saat search

## Security Considerations

1. **Row Level Security**: Hanya data tour guide yang bersangkutan
2. **Data Validation**: Validasi input di frontend dan backend
3. **Rate Limiting**: Membatasi request per user
4. **Audit Logging**: Log aktivitas penting

## Cara Penggunaan

### 1. Setup

```typescript
import { ClientsContent } from "./components/tourguide/dashboard/ClientsContent";

// Dalam component
<ClientsContent tourGuideId="tour-guide-123" />;
```

### 2. Kustomisasi Filter

```typescript
const { updateFilters } = useClients(tourGuideId);

updateFilters({
  searchTerm: "john",
  status: "active",
  page: 1,
  limit: 20,
});
```

### 3. Handle Client Details

```typescript
const { getClientDetails } = useClients(tourGuideId);

const handleViewClient = async (clientId: string) => {
  const details = await getClientDetails(clientId);
  // Handle detail data
};
```

## Testing

### Unit Tests

- Service functions
- Hook behavior
- Component rendering

### Integration Tests

- Database queries
- API endpoints
- UI interactions

### E2E Tests

- Complete user flows
- Error scenarios
- Performance testing

## Deployment Notes

1. **Environment Variables**: Setup Supabase credentials
2. **Database Migrations**: Run schema migrations
3. **Monitoring**: Setup error tracking dan performance monitoring
4. **Backup**: Regular database backup

## Troubleshooting

### Common Issues

1. **Slow Queries**: Check indexes on foreign keys
2. **Memory Issues**: Implement pagination properly
3. **Stale Data**: Implement refresh mechanisms
4. **Network Timeouts**: Add retry logic

### Debug Tips

1. Check browser console untuk errors
2. Verify Supabase connection
3. Test dengan data dummy
4. Monitor network requests

## API Documentation

### Endpoints (Service Methods)

#### `getClientsByTourGuide(tourGuideId, filters)`

- **Purpose**: Ambil daftar clients
- **Parameters**:
  - `tourGuideId`: ID tour guide
  - `filters`: Search, status, pagination
- **Returns**: Array clients dengan metadata pagination

#### `getClientStats(tourGuideId)`

- **Purpose**: Ambil statistik clients
- **Parameters**: `tourGuideId`
- **Returns**: Object dengan total, active, bookings, rating

#### `getClientDetails(clientId, tourGuideId)`

- **Purpose**: Ambil detail client
- **Parameters**: `clientId`, `tourGuideId`
- **Returns**: Detail client dengan booking history

## Maintenance

### Regular Tasks

1. Monitor query performance
2. Update dependencies
3. Review error logs
4. Optimize database indexes

### Monthly Reviews

1. Analyze usage patterns
2. Performance optimization
3. Security audit
4. User feedback review
