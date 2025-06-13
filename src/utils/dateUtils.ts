// src/utils/dateUtils.ts
// Utility functions for proper timezone handling

/**
 * Convert UTC date to Indonesian timezone (WIB = UTC+7)
 */
export const convertToIndonesianTime = (utcDate: string | Date): Date => {
  const date = new Date(utcDate);
  // Add 7 hours for WIB (Western Indonesian Time)
  date.setHours(date.getHours() + 7);
  return date;
};

/**
 * Format date for Indonesian users
 */
export const formatIndonesianDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const indonesianDate =
    typeof date === "string" ? convertToIndonesianTime(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta", // WIB timezone
    ...options,
  };

  return indonesianDate.toLocaleDateString("id-ID", defaultOptions);
};

/**
 * Format datetime for Indonesian users with time
 */
export const formatIndonesianDateTime = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const indonesianDate =
    typeof date === "string" ? convertToIndonesianTime(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta", // WIB timezone
    ...options,
  };

  return indonesianDate.toLocaleDateString("id-ID", defaultOptions);
};

/**
 * Get current Indonesian time
 */
export const getCurrentIndonesianTime = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
};

/**
 * Convert Indonesian time to UTC for database storage
 */
export const convertToUTC = (indonesianDate: Date): string => {
  // Subtract 7 hours to convert from WIB to UTC
  const utcDate = new Date(indonesianDate);
  utcDate.setHours(utcDate.getHours() - 7);
  return utcDate.toISOString();
};

/**
 * Format relative time in Indonesian
 */
export const formatRelativeTime = (date: string | Date): string => {
  const indonesianDate =
    typeof date === "string" ? convertToIndonesianTime(date) : date;
  const now = getCurrentIndonesianTime();
  const diff = now.getTime() - indonesianDate.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  if (weeks < 4) return `${weeks} minggu yang lalu`;
  if (months < 12) return `${months} bulan yang lalu`;
  return `${years} tahun yang lalu`;
};
