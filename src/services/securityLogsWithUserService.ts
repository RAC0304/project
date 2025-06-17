import { supabase } from "../utils/supabaseClient";

export interface SecurityLogWithUser {
  id: string;
  created_at: string;
  action: string;
  ip_address: string;
  user_agent: string;
  status: "success" | "failed" | "warning";
  details: string;
  user_id: string | null;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: string | null;
}

/**
 * Mendapatkan security logs yang sudah digabung dengan data users
 * @param filterStatus Filter berdasarkan status (success, failed, warning)
 * @param searchTerm Pencarian berdasarkan email, username, nama, atau detail logs
 * @param startDate Filter dari tanggal mulai
 * @param endDate Filter sampai tanggal akhir
 * @param maxRecords Jumlah maksimum record yang diambil
 * @returns Array dari SecurityLogWithUser
 */
export async function getSecurityLogsWithUsers(
  filterStatus?: "success" | "failed" | "warning",
  searchTerm?: string,
  startDate?: Date,
  endDate?: Date,
  maxRecords: number = 100
): Promise<SecurityLogWithUser[]> {
  try {
    // Menggunakan RPC untuk memanggil fungsi yang sudah dibuat di database
    const { data, error } = await supabase.rpc("get_security_logs_with_users", {
      filter_status: filterStatus || null,
      search_term: searchTerm || null,
      start_date: startDate?.toISOString() || null,
      end_date: endDate?.toISOString() || null,
      max_records: maxRecords,
    });

    if (error) throw error;

    return data.map((log: any) => ({
      ...log,
      id: log.id.toString(),
      user_id: log.user_id ? log.user_id.toString() : null,
    }));
  } catch (error) {
    console.error("Error fetching security logs with users:", error);
    return [];
  }
}

/**
 * Menambahkan log keamanan baru ke dalam sistem
 * @param userId ID user yang melakukan aksi (opsional)
 * @param action Jenis aksi yang dilakukan
 * @param ipAddress Alamat IP user
 * @param userAgent User Agent dari browser/aplikasi
 * @param status Status dari aksi (success, failed, warning)
 * @param details Detail tambahan dari aksi
 * @returns ID dari log yang dibuat atau null jika gagal
 */
export async function addSecurityLog(
  userId: string | null,
  action: string,
  ipAddress: string,
  userAgent: string,
  status: "success" | "failed" | "warning" = "success",
  details?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("add_security_log", {
      p_user_id: userId ? parseInt(userId) : null,
      p_action: action,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_status: status,
      p_details: details || null,
    });

    if (error) throw error;

    return data.toString();
  } catch (error) {
    console.error("Error adding security log:", error);
    return null;
  }
}
