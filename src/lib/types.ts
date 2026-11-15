export type UserRole = "admin" | "profesor" | "parinte" | "elev" | "anonim";

export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  /** Cerere de rol în așteptare (doar „profesor”), aprobată de un admin. */
  requested_role?: UserRole | null;
  school_id: string | null;
  xp: number;
  created_at: string;
}
