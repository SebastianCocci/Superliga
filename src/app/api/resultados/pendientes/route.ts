import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

import "@/models";
import { Partido } from "@/models/PartidoModel";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "jugador";
}

async function getAuth(): Promise<
  | { ok: true; payload: JWTPayload }
  | { ok: false; res: NextResponse }
> {
  const cookieStore = await cookies(); // IMPORTANTE: await (Next 16)
  const token = cookieStore.get("slp_token")?.value ?? null;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const payload = verifyToken(token) as JWTPayload | null;
  if (!payload || !payload.id || !payload.email || !isRole(payload.role)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { ok: true, payload };
}

export async function GET() {
  const auth = await getAuth();
  if (!auth.ok) return auth.res;

  if (auth.payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    await connectDB();

    const partidos = await Partido.find({ estado: "pendiente" })
      .populate({
        path: "jugador1",
        model: "Player",
        populate: {
          path: "userId",
          model: "User",
          select: "nombre apellido",
        },
      })
      .populate({
        path: "jugador2",
        model: "Player",
        populate: {
          path: "userId",
          model: "User",
          select: "nombre apellido",
        },
      })
      .populate({
        path: "ganador",
        model: "Player",
        populate: {
          path: "userId",
          model: "User",
          select: "nombre apellido",
        },
      })
      .sort({ fechaNumero: 1 });

    return NextResponse.json(partidos, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/resultados/pendientes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
