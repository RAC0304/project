// src/config/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.");
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Singleton pattern using globalThis to prevent multiple instances (especially during HMR)
declare global {
  // eslint-disable-next-line no-var
  var _supabase: SupabaseClient<Database> | undefined;
}

const _supabaseGlobal = globalThis as typeof globalThis & {
  _supabase?: SupabaseClient<Database>;
};

if (!_supabaseGlobal._supabase) {
  _supabaseGlobal._supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}

export const supabase: SupabaseClient<Database> = _supabaseGlobal._supabase;

// Simple test function to check connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("count")
      .limit(1)
      .single();
    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
    return {
      ok: true,
      message: "Connection successful!",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

// Default export for convenience
export default supabase;
