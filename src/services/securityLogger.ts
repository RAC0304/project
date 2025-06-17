import { addSecurityLog } from "./securityLogsWithUserService";

/**
 * Service untuk mencatat aktivitas keamanan sistem
 */
export const securityLogger = {
  /**
   * Mencatat aktivitas login yang berhasil
   * @param userId ID pengguna yang login
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param details Detail tambahan
   */
  loginSuccess: async (
    userId: string,
    ipAddress: string,
    userAgent: string,
    details?: string
  ) => {
    return addSecurityLog(
      userId,
      "Login",
      ipAddress,
      userAgent,
      "success",
      details
    );
  },

  /**
   * Mencatat aktivitas login yang gagal
   * @param email Email yang digunakan untuk login
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param details Alasan gagal login
   */
  loginFailed: async (
    email: string,
    ipAddress: string,
    userAgent: string,
    details?: string
  ) => {
    return addSecurityLog(
      null,
      `Login failed (${email})`,
      ipAddress,
      userAgent,
      "failed",
      details
    );
  },

  /**
   * Mencatat aktivitas logout
   * @param userId ID pengguna yang logout
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   */
  logout: async (userId: string, ipAddress: string, userAgent: string) => {
    return addSecurityLog(userId, "Logout", ipAddress, userAgent, "success");
  },

  /**
   * Mencatat aktivitas perubahan password
   * @param userId ID pengguna yang mengubah password
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param isReset Apakah ini reset password atau perubahan biasa
   */
  passwordChange: async (
    userId: string,
    ipAddress: string,
    userAgent: string,
    isReset: boolean = false
  ) => {
    const action = isReset ? "Password Reset" : "Password Change";
    return addSecurityLog(userId, action, ipAddress, userAgent, "success");
  },

  /**
   * Mencatat aktivitas perubahan pengaturan keamanan
   * @param userId ID admin yang mengubah pengaturan
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param settingName Nama pengaturan yang diubah
   */
  securitySettingChange: async (
    userId: string,
    ipAddress: string,
    userAgent: string,
    settingName: string
  ) => {
    return addSecurityLog(
      userId,
      `Security Setting Change: ${settingName}`,
      ipAddress,
      userAgent,
      "success"
    );
  },

  /**
   * Mencatat aktivitas mencurigakan
   * @param userId ID pengguna (opsional)
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param details Detail aktivitas mencurigakan
   */
  suspiciousActivity: async (
    userId: string | null,
    ipAddress: string,
    userAgent: string,
    details: string
  ) => {
    return addSecurityLog(
      userId,
      "Suspicious Activity",
      ipAddress,
      userAgent,
      "warning",
      details
    );
  },

  /**
   * Mencatat request akses tidak sah
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param resource Resource yang coba diakses
   */
  unauthorizedAccess: async (
    ipAddress: string,
    userAgent: string,
    resource: string
  ) => {
    return addSecurityLog(
      null,
      "Unauthorized Access",
      ipAddress,
      userAgent,
      "failed",
      `Attempted to access: ${resource}`
    );
  },

  /**
   * Mencatat aktivitas keamanan kustom
   * @param userId ID pengguna (opsional)
   * @param action Jenis aksi
   * @param ipAddress Alamat IP
   * @param userAgent User Agent
   * @param status Status aktivitas
   * @param details Detail tambahan
   */
  custom: async (
    userId: string | null,
    action: string,
    ipAddress: string,
    userAgent: string,
    status: "success" | "failed" | "warning" = "success",
    details?: string
  ) => {
    return addSecurityLog(
      userId,
      action,
      ipAddress,
      userAgent,
      status,
      details
    );
  },
};
