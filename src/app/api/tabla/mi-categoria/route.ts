import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

// Registramos modelos
import "@/models";
import { Player } from "@/models/PlayerModel";
import { Partido } from "@/models/PartidoModel";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

type Categoria = "Top ten" | "A" | "B" | "C" | "D";
type TipoResultado = "normal" | "wo" | "doble_wo";

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "jugador";
}

function toIdString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    const s = (value as { toString: () => string }).toString();
    return typeof s === "string" ? s : null;
  }
  return null;
}

function nombreCompleto(userId: unknown): string {
  if (!userId || typeof userId !== "object") return "";
  const u = userId as { nombre?: unknown; apellido?: unknown };
  const nombre = typeof u.nombre === "string" ? u.nombre : "";
  const apellido = typeof u.apellido === "string" ? u.apellido : "";
  return `${apellido}, ${nombre}`.trim();
}

async function getAuth(): Promise<
  | { ok: true; payload: JWTPayload }
  | { ok: false; res: NextResponse }
> {
  const cookieStore = await cookies(); // Next 16
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

  // Solo jugador (para evitar que esto se use como “tabla pública”)
  if (auth.payload.role !== "jugador") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    await connectDB();

    // 1) Obtener la categoría del jugador logueado
    const myPlayer = await Player.findOne({ userId: auth.payload.id })
      .select("categoria")
      .lean<{ categoria: Categoria } | null>();

    if (!myPlayer) {
      return NextResponse.json(
        { error: "Jugador no encontrado para el usuario logueado" },
        { status: 404 }
      );
    }

    const categoria = myPlayer.categoria;

    // 2) Traer jugadores activos de esa categoría
    const playersCat = await Player.find({ categoria, activo: true })
      .select("_id userId")
      .populate({ path: "userId", select: "nombre apellido" })
      .lean<Array<{ _id: unknown; userId?: unknown }>>();

    type Row = {
      playerId: string;
      nombreOrden: string;
      puntos: number;
      ganados: number;
      jugados: number;
      perdidos: number;
    };

    const table = new Map<string, Row>();

    for (const p of playersCat) {
      const pid = toIdString(p._id);
      if (!pid) continue;

      table.set(pid, {
        playerId: pid,
        nombreOrden: nombreCompleto(p.userId),
        puntos: 0,
        ganados: 0,
        jugados: 0,
        perdidos: 0,
      });
    }

    // 3) Calcular con partidos aprobados
    const aprobados = await Partido.find({ categoria, estado: "aprobado" })
      .select("jugador1 jugador2 tipoResultado ganador")
      .lean<
        Array<{
          jugador1?: unknown;
          jugador2?: unknown;
          tipoResultado?: TipoResultado;
          ganador?: unknown | null;
        }>
      >();

    for (const m of aprobados) {
      const j1 = toIdString(m.jugador1);
      const j2 = toIdString(m.jugador2);
      if (!j1 || !j2) continue;

      const r1 = table.get(j1);
      const r2 = table.get(j2);
      if (!r1 || !r2) continue;

      r1.jugados += 1;
      r2.jugados += 1;

      const tipo = m.tipoResultado ?? "normal";

      if (tipo === "doble_wo" || m.ganador == null) {
        // doble WO: cuenta jugado, no suma puntos ni W/L
        continue;
      }

      const ganadorId = toIdString(m.ganador);
      if (!ganadorId) continue;

      const winner = ganadorId === j1 ? r1 : ganadorId === j2 ? r2 : null;
      const loser = ganadorId === j1 ? r2 : ganadorId === j2 ? r1 : null;
      if (!winner || !loser) continue;

      winner.puntos += 1;
      winner.ganados += 1;
      loser.perdidos += 1;
    }

    // Orden: puntos desc, ganados desc, jugados asc, nombre asc
    const rows = Array.from(table.values()).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.ganados !== a.ganados) return b.ganados - a.ganados;
      if (a.jugados !== b.jugados) return a.jugados - b.jugados; // menos PJ arriba
      return a.nombreOrden.localeCompare(b.nombreOrden);
    });

    return NextResponse.json(
      {
        categoria,
        rows: rows.map((r, idx) => ({
          pos: idx + 1,
          ...r,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tabla mi-categoria:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
