import { supabase } from "../utils/supabaseClient";

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
  preventReuse: number;
}

export interface SecuritySettings {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  requireTwoFactor: boolean;
  passwordPolicy: PasswordPolicy;
  auditLogRetention: number;
}

// Mendapatkan security settings dari Supabase
export async function getSecuritySettings(): Promise<SecuritySettings> {
  const { data, error } = await supabase
    .from("security_settings")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching security settings:", error);
    // Kembalikan default settings jika terjadi error
    return {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 120,
      requireTwoFactor: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expirationDays: 90,
        preventReuse: 5,
      },
      auditLogRetention: 365,
    };
  }

  // Jika data ditemukan, return data tersebut
  if (data) {
    return {
      maxLoginAttempts: data.max_login_attempts,
      lockoutDuration: data.lockout_duration,
      sessionTimeout: data.session_timeout,
      requireTwoFactor: data.require_two_factor,
      passwordPolicy: {
        minLength: data.password_policy.min_length,
        requireUppercase: data.password_policy.require_uppercase,
        requireLowercase: data.password_policy.require_lowercase,
        requireNumbers: data.password_policy.require_numbers,
        requireSpecialChars: data.password_policy.require_special_chars,
        expirationDays: data.password_policy.expiration_days,
        preventReuse: data.password_policy.prevent_reuse,
      },
      auditLogRetention: data.audit_log_retention,
    };
  }

  // Jika tidak ada data, kembalikan default settings
  return {
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 120,
    requireTwoFactor: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expirationDays: 90,
      preventReuse: 5,
    },
    auditLogRetention: 365,
  };
}

// Menyimpan security settings ke Supabase
export async function updateSecuritySettings(
  settings: SecuritySettings
): Promise<boolean> {
  try {
    const { error } = await supabase.from("security_settings").upsert(
      {
        max_login_attempts: settings.maxLoginAttempts,
        lockout_duration: settings.lockoutDuration,
        session_timeout: settings.sessionTimeout,
        require_two_factor: settings.requireTwoFactor,
        password_policy: {
          min_length: settings.passwordPolicy.minLength,
          require_uppercase: settings.passwordPolicy.requireUppercase,
          require_lowercase: settings.passwordPolicy.requireLowercase,
          require_numbers: settings.passwordPolicy.requireNumbers,
          require_special_chars: settings.passwordPolicy.requireSpecialChars,
          expiration_days: settings.passwordPolicy.expirationDays,
          prevent_reuse: settings.passwordPolicy.preventReuse,
        },
        audit_log_retention: settings.auditLogRetention,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Error updating security settings:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception while updating security settings:", error);
    return false;
  }
}
