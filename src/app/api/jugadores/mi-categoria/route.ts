import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

import "@/models";
import { Player } from "@/models/PlayerModel";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "jugador";
}

async function requireJugador(): Promise<
  | { ok: true; payload: JWTPayload }
  | { ok: false; res: NextResponse }
> {
  const cookieStore = await cookies();
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

  if (payload.role !== "jugador") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }),
    };
  }

  return { ok: true, payload };
}

export async function GET() {
  const auth = await requireJugador();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    // 1) Buscar la categoría del jugador logueado
    const me = await Player.findOne({ userId: auth.payload.id })
      .select("categoria")
      .lean<{ categoria?: unknown } | null>();

    const categoria = me?.categoria;
    if (
      categoria !== "Top ten" &&
      categoria !== "A" &&
      categoria !== "B" &&
      categoria !== "C" &&
      categoria !== "D"
    ) {
      return NextResponse.json(
        { error: "Jugador sin categoría válida" },
        { status: 404 }
      );
    }

    // 2) Listar jugadores activos de esa categoría
    const jugadores = await Player.find({ categoria, activo: true })
      .populate({ path: "userId", select: "nombre apellido dni telefono email" })
      .sort({ "userId.apellido": 1 })
      .lean();

    return NextResponse.json({ categoria, jugadores }, { status: 200 });
  } catch (error) {
    console.error("Error /api/jugadores/mi-categoria:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
