import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { UserRole } from "../lib/types";

/**
 * Redirectează spre `redirectTo` dacă userul nu are unul din rolurile permise.
 * Folosit în paginile restricționate (admin, profesor etc.).
 */
export function useRequireRole(
  allowedRoles: UserRole[],
  redirectTo = "/",
) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      navigate("/login");
      return;
    }
    if (!allowedRoles.includes(profile.role)) {
      navigate(redirectTo);
    }
  }, [user, profile, loading, navigate, allowedRoles, redirectTo]);

  return { loading, profile };
}
