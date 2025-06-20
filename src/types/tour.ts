export type TourStatus = "confirmed" | "pending" | "cancelled";

export interface TourData {
  id?: number; // Made id optional to allow deletion
  title: string;
  description: string;
  location: string;
  duration: string;
  price: string;
  date: string;
  time: string;
  capacity: string;
  status: TourStatus;
  clients: number;
}

export interface Review {
  id: number;
  clientName: string;
  rating: number;
  date: string;
  comment: string;
  tour: string;
}

export interface GuideStats {
  totalTours: number;
  upcomingTours: number;
  totalClients: number;
  averageRating: number;
  monthlyEarnings: number;
  responseRate: number;
}
