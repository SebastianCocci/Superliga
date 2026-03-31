import { NextRequest, NextResponse } from "next/server";
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "jugador";
}

async function getAuth(): Promise<
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

  return { ok: true, payload };
}

export async function PATCH(_req: NextRequest, ctx: RouteContext) {
  const auth = await getAuth();
  if (!auth.ok) return auth.res;

  // Solo admin
  if (auth.payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    await connectDB();

    const { id } = await ctx.params;

    const partido = await Partido.findById(id);

    if (!partido) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    if (partido.estado !== "pendiente") {
      return NextResponse.json(
        { error: "Solo se pueden aprobar resultados pendientes" },
        { status: 400 }
      );
    }

    partido.estado = "aprobado";
    partido.fechaAprobacion = new Date();

    // Si tenés historial en el schema, dejamos traza
    const anyPartido = partido as unknown as {
      historial?: Array<{ fecha: Date; accion: string; usuario: string }>;
    };
    if (!Array.isArray(anyPartido.historial)) anyPartido.historial = [];
    anyPartido.historial.push({
      fecha: new Date(),
      accion: "admin_aprueba_resultado",
      usuario: auth.payload.id,
    });

    await partido.save();

    return NextResponse.json({ message: "Resultado aprobado correctamente" }, { status: 200 });
  } catch (err) {
    console.error("Error aprobando resultado:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
