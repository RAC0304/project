# Tour Guide Dashboard - Wanderwise Style Update

## Overview

The `DashboardContent` component has been updated to match the modern design and functionality from the wanderwise project. This update brings improved user experience, better visual design, and enhanced functionality.

## Key Features

### ✨ Modern Design Elements

- **StatCard Components**: Clean, modern stat cards with icons, trends, and contextual information
- **Responsive Layout**: Mobile-first responsive design that works on all screen sizes
- **Color-coded Status**: Visual status indicators for tour confirmations and other states
- **Interactive Elements**: Hover effects and smooth transitions

### 📊 Enhanced Stats Display

- **Monthly Bookings**: Shows current month bookings with trend indicators
- **Monthly Earnings**: Displays earnings in Indonesian Rupiah with growth trends
- **Total Clients**: Client count with upcoming tours information
- **Guide Rating**: Average rating with response rate percentage

### 🎯 Interactive Features

- **View Details**: Click to see detailed tour information in a modal
- **Message Clients**: Direct messaging functionality for tour participants
- **Quick Actions**: Fast access to schedule management, messages, and reviews
- **Page Navigation**: Seamless navigation to different dashboard sections

### 🔧 Component Props

```typescript
interface DashboardContentProps {
  guideStats?: GuideStats;
  upcomingTours?: UpcomingTour[];
  recentReviews?: Review[];
  setActivePage?: (page: string) => void;
}
```

### 📱 Responsive Design

- **Grid Layout**: Responsive grid that adapts from 1 column on mobile to 4 columns on desktop
- **Flexible Cards**: Tour and review cards that stack appropriately on smaller screens
- **Touch-friendly**: Buttons and interactive elements sized for mobile interaction

## Usage Example

```tsx
<DashboardContent
  guideStats={{
    totalTours: 6,
    upcomingTours: 5,
    totalClients: 22,
    averageRating: 4.8,
    monthlyEarnings: 15600000,
    responseRate: 94,
    monthlyBookings: 7,
    bookingsTrend: "100% this month",
    earningsTrend: "IDR 15.600.000",
    clientsTrend: "6 upcoming",
    ratingTrend: "Active guide",
  }}
  upcomingTours={[
    {
      id: 1,
      title: "Sacred Temples of Bali",
      date: "2025-06-25",
      time: "09:00 AM",
      location: "Bali, Indonesia",
      clients: 4,
      status: "confirmed",
    },
  ]}
  recentReviews={[
    {
      id: 1,
      clientName: "Sarah Johnson",
      rating: 5,
      comment: "Amazing tour!",
      tour: "Jakarta Walking Tour",
      date: "2025-01-10",
    },
  ]}
  setActivePage={setActivePage}
/>
```

## Dependencies

### Required Components

- `StatCard` - For displaying statistics with trends and icons
- `TourDetailsModal` - Modal for showing detailed tour information
- `MessageClientsModal` - Modal for messaging tour clients

### Required Utilities

- `getStatusColor` - Helper function for status color coding
- `formatCurrency` - Indonesian Rupiah currency formatting

### Icons (Lucide React)

- `Calendar`, `MapPin`, `Users`, `Star`, `DollarSign`, `MessageSquare`, `Eye`

## File Structure

```
src/
├── components/
│   ├── tourguide/
│   │   ├── dashboard/
│   │   │   ├── DashboardContent.tsx    # Main dashboard component
│   │   │   └── StatCard.tsx           # Stat display component
│   │   └── modals/
│   │       ├── TourDetailsModal.tsx   # Tour details modal
│   │       └── MessageClientsModal.tsx # Messaging modal
│   └── ...
├── utils/
│   └── statusHelpers.ts               # Status styling utilities
└── pages/
    └── TourGuideDashboard.tsx         # Main dashboard page
```

## Styling

- Uses Tailwind CSS for styling
- Color palette: Teal primary, with green, blue, and amber accents
- Consistent spacing and typography following the wanderwise design system

## Improvements Made

1. **Better UX**: More intuitive navigation and interaction patterns
2. **Visual Hierarchy**: Clearer information organization and visual flow
3. **Accessibility**: Better contrast ratios and keyboard navigation
4. **Performance**: Optimized rendering with proper React patterns
5. **Maintainability**: Cleaner component structure and separation of concerns

The updated dashboard provides a professional, modern interface that enhances the tour guide experience while maintaining excellent usability across all devices.
