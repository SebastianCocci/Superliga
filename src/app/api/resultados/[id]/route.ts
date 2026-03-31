import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

import "@/models";
import { Partido } from "@/models/PartidoModel";
import { Player } from "@/models/PlayerModel";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

type TipoResultado = "normal" | "wo" | "doble_wo";
type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";

type RouteContext = { params: Promise<{ id: string }> };

function toIdString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value) {
    const s = (value as { toString: () => string }).toString();
    return typeof s === "string" ? s : null;
  }
  return null;
}

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

async function getPlayerIdForUser(userId: string): Promise<string | null> {
  const player = await Player.findOne({ userId })
    .select("_id")
    .lean<{ _id: unknown } | null>();

  return player ? toIdString(player._id) : null;
}

function isTipoResultado(v: unknown): v is TipoResultado {
  return v === "normal" || v === "wo" || v === "doble_wo";
}

function getPartidoPlayerIds(partido: unknown): { jugador1Id: string | null; jugador2Id: string | null } {
  const p = partido as {
    jugador1?: unknown;
    jugador2?: unknown;
  };

  // Si viene populateado, usamos ._id; si no, el valor directo (ObjectId)
  const j1PopId = (p.jugador1 as { _id?: unknown } | undefined)?._id;
  const j2PopId = (p.jugador2 as { _id?: unknown } | undefined)?._id;

  const jugador1Id = toIdString(j1PopId ?? p.jugador1);
  const jugador2Id = toIdString(j2PopId ?? p.jugador2);

  return { jugador1Id, jugador2Id };
}

export async function GET(_req: Request, ctx: RouteContext) {
  const auth = await getAuth();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    const { id } = await ctx.params;

    const partido = await Partido.findById(id)
      .populate({
        path: "jugador1",
        model: "Player",
        populate: { path: "userId", model: "User", select: "nombre apellido" },
      })
      .populate({
        path: "jugador2",
        model: "Player",
        populate: { path: "userId", model: "User", select: "nombre apellido" },
      })
      .populate({
        path: "ganador",
        model: "Player",
        populate: { path: "userId", model: "User", select: "nombre apellido" },
      });

    if (!partido) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    // Jugador: solo si participa
    if (auth.payload.role === "jugador") {
      const myPlayerId = await getPlayerIdForUser(auth.payload.id);
      if (!myPlayerId) {
        return NextResponse.json(
          { error: "Jugador no encontrado para el usuario logueado" },
          { status: 404 }
        );
      }

      const { jugador1Id, jugador2Id } = getPartidoPlayerIds(partido);
      const participa = myPlayerId === jugador1Id || myPlayerId === jugador2Id;

      if (!participa) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
      }
    }

    return NextResponse.json(partido, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/resultados/[id]:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const auth = await getAuth();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    const { id } = await ctx.params;

    const body = (await req.json()) as {
      tipoResultado?: unknown;
      ganador?: unknown; // string | null
      sets?: unknown; // string
    };

    const tipoResultado = body.tipoResultado;

    if (!isTipoResultado(tipoResultado)) {
      return NextResponse.json({ error: "tipoResultado inválido" }, { status: 400 });
    }

    const partido = await Partido.findById(id).select(
      "jugador1 jugador2 estado tipoResultado sets ganador historial cargadoPor fechaCarga"
    );

    if (!partido) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    // Jugador: solo si participa y NO si está aprobado
    if (auth.payload.role === "jugador") {
      const myPlayerId = await getPlayerIdForUser(auth.payload.id);
      if (!myPlayerId) {
        return NextResponse.json(
          { error: "Jugador no encontrado para el usuario logueado" },
          { status: 404 }
        );
      }

      const jugador1Id = toIdString((partido as unknown as { jugador1?: unknown }).jugador1);
      const jugador2Id = toIdString((partido as unknown as { jugador2?: unknown }).jugador2);

      const participa = myPlayerId === jugador1Id || myPlayerId === jugador2Id;
      if (!participa) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
      }

      const estado = (partido as unknown as { estado?: EstadoResultado }).estado;
      if (estado === "aprobado") {
        return NextResponse.json(
          { error: "No podés modificar un partido aprobado." },
          { status: 409 }
        );
      }
    }

    // Validaciones de negocio
    const sets = typeof body.sets === "string" ? body.sets.trim() : "";
    const ganadorRaw = body.ganador;

    const jugador1Id = toIdString((partido as unknown as { jugador1?: unknown }).jugador1);
    const jugador2Id = toIdString((partido as unknown as { jugador2?: unknown }).jugador2);

    if (!jugador1Id || !jugador2Id) {
      return NextResponse.json({ error: "Partido inválido" }, { status: 500 });
    }

    let ganador: string | null = null;

    if (tipoResultado === "normal") {
      if (!sets) {
        return NextResponse.json(
          { error: "Sets es obligatorio para resultado normal." },
          { status: 400 }
        );
      }
      if (ganadorRaw !== jugador1Id && ganadorRaw !== jugador2Id) {
        return NextResponse.json(
          { error: "Ganador inválido para resultado normal." },
          { status: 400 }
        );
      }
      ganador = ganadorRaw as string;
    }

    if (tipoResultado === "wo") {
      if (ganadorRaw !== jugador1Id && ganadorRaw !== jugador2Id) {
        return NextResponse.json(
          { error: "Ganador es obligatorio y debe ser jugador1 o jugador2." },
          { status: 400 }
        );
      }
      ganador = ganadorRaw as string;
    }

    if (tipoResultado === "doble_wo") {
      ganador = null;
    }

    // Persistencia
    (partido as unknown as { tipoResultado?: TipoResultado }).tipoResultado = tipoResultado;
    (partido as unknown as { estado?: EstadoResultado }).estado = "pendiente";
    (partido as unknown as { fechaCarga?: Date }).fechaCarga = new Date();
    (partido as unknown as { cargadoPor?: string }).cargadoPor = auth.payload.id;

    if (tipoResultado === "normal") {
      (partido as unknown as { sets?: string }).sets = sets;
    } else {
      (partido as unknown as { sets?: string }).sets = undefined;
    }

    (partido as unknown as { ganador?: string | null }).ganador = ganador;

    // Historial
    const anyPartido = partido as unknown as {
      historial?: Array<{ fecha: Date; accion: string; usuario: string }>;
    };
    if (!Array.isArray(anyPartido.historial)) anyPartido.historial = [];
    anyPartido.historial.push({
      fecha: new Date(),
      accion:
        auth.payload.role === "admin"
          ? "admin_edita_resultado"
          : "jugador_carga_resultado",
      usuario: auth.payload.id,
    });

    await partido.save();

    return NextResponse.json(
      { ok: true, message: "Resultado actualizado." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PATCH /api/resultados/[id]:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
