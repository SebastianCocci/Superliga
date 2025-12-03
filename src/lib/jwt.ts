import jwt from "jsonwebtoken";

type JWTPayload = {
  id: string;
  email: string;
  role: "admin" | "jugador";
};

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("❌ Falta JWT_SECRET en el archivo .env.local");
}

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // tiempo estándar
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
