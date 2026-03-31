import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

import "@/models";
import { User } from "@/models/UserModel";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "jugador";
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("slp_token")?.value ?? null;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = verifyToken(token) as JWTPayload | null;

  if (!payload || !payload.id || !payload.email || !isRole(payload.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(payload.id)
      .select("nombre apellido role email")
      .lean<{ nombre?: string; apellido?: string; role?: Role; email?: string } | null>();

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(
      {
        nombre: user.nombre ?? "",
        apellido: user.apellido ?? "",
        role: user.role ?? payload.role,
        email: user.email ?? payload.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error GET /api/auth/me:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
