// src/types/supabase.ts
// Generated database types from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: number;
          destination_id: number;
          name: string;
          description: string;
          duration: string | null;
          price: string | null;
          image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          destination_id: number;
          name: string;
          description: string;
          duration?: string | null;
          price?: string | null;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          destination_id?: number;
          name?: string;
          description?: string;
          duration?: string | null;
          price?: string | null;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      attractions: {
        Row: {
          id: number;
          destination_id: number;
          name: string;
          description: string;
          image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          destination_id: number;
          name: string;
          description: string;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          destination_id?: number;
          name?: string;
          description?: string;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      destination_categories: {
        Row: {
          id: number;
          destination_id: number;
          category: string;
        };
        Insert: {
          id?: number;
          destination_id: number;
          category: string;
        };
        Update: {
          id?: number;
          destination_id?: number;
          category?: string;
        };
      };
      destination_images: {
        Row: {
          id: number;
          destination_id: number;
          image_url: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          destination_id: number;
          image_url: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          destination_id?: number;
          image_url?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      destinations: {
        Row: {
          id: number;
          slug: string;
          name: string;
          location: string;
          description: string;
          short_description: string | null;
          image_url: string | null;
          best_time_to_visit: string | null;
          google_maps_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          slug: string;
          name: string;
          location: string;
          description: string;
          short_description?: string | null;
          image_url?: string | null;
          best_time_to_visit?: string | null;
          google_maps_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          slug?: string;
          name?: string;
          location?: string;
          description?: string;
          short_description?: string | null;
          image_url?: string | null;
          best_time_to_visit?: string | null;
          google_maps_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      travel_tips: {
        Row: {
          id: number;
          destination_id: number;
          tip: string;
        };
        Insert: {
          id?: number;
          destination_id: number;
          tip: string;
        };
        Update: {
          id?: number;
          destination_id?: number;
          tip?: string;
        };
      };
      cultural_insights: {
        Row: {
          id: number;
          destination_id: number;
          title: string;
          content: string;
          image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          destination_id: number;
          title: string;
          content: string;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          destination_id?: number;
          title?: string;
          content?: string;
          image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      // Add other tables as needed
    };
  };
}
