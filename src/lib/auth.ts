import { verifyToken } from "@/lib/jwt";

export type Role = "admin" | "jugador";

export type AuthPayload = {
  id: string;
  email: string;
  role: Role;
};

function getCookieValue(cookieHeader: string, name: string): string | null {
  // Busca: "name=value" al inicio o después de "; "
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthPayloadFromRequest(req: Request): AuthPayload | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = getCookieValue(cookieHeader, "slp_token");
  if (!token) return null;

  return verifyToken(token);
}
