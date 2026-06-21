export type UserRole = "admin" | "profesor" | "parinte" | "elev" | "anonim";

export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  school_id: string | null;
  xp: number;
  created_at: string;
}
