import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

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

type ResumenJugadorResponse = {
  categoryLabel: string;
  positionLabel: string;
  pointsLabel: string;
  nextMatchLabel: string;
};

function labelCategoria(categoria: Categoria): string {
  return categoria === "Top ten" ? "Top Ten" : `Categoría ${categoria}`;
}

function toIdString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    const s = (value as { toString: () => string }).toString();
    return typeof s === "string" ? s : null;
  }
  return null;
}

function nombreCompleto(userId: unknown): string | null {
  if (!userId || typeof userId !== "object") return null;

  const u = userId as { nombre?: unknown; apellido?: unknown };
  const nombre = typeof u.nombre === "string" ? u.nombre : null;
  const apellido = typeof u.apellido === "string" ? u.apellido : null;

  if (!nombre || !apellido) return null;
  return `${apellido}, ${nombre}`;
}

export async function GET() {
  try {
    await connectDB();

    // 1) Auth por cookie (Next 16: cookies() es Promise)
    const cookieStore = await cookies();
    const token = cookieStore.get("slp_token")?.value ?? null;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token) as JWTPayload | null;
    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (payload.role !== "jugador") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // 2) Obtener Player del usuario logueado
    const player = await Player.findOne({ userId: payload.id })
      .select("_id categoria")
      .lean<{ _id: unknown; categoria: Categoria } | null>();

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado para el usuario logueado" },
        { status: 404 }
      );
    }

    const playerId = toIdString(player._id);
    if (!playerId) {
      return NextResponse.json(
        { error: "Error de datos del jugador" },
        { status: 500 }
      );
    }

    const categoria = player.categoria;

    // 3) Próximo partido del jugador SIN resultado cargado (solo sin_cargar)
    const proximo = await Partido.findOne({
      categoria,
      estado: "sin_cargar",
      $or: [{ jugador1: playerId }, { jugador2: playerId }],
    })
      .sort({ fechaNumero: 1 })
      .populate({
        path: "jugador1",
        populate: { path: "userId", select: "nombre apellido" },
      })
      .populate({
        path: "jugador2",
        populate: { path: "userId", select: "nombre apellido" },
      })
      .lean<{
        fechaNumero?: unknown;
        jugador1?: { userId?: unknown };
        jugador2?: { userId?: unknown };
      } | null>();

    let nextMatchLabel = "—";
    if (proximo) {
      const fechaNumero =
        typeof proximo.fechaNumero === "number" ? proximo.fechaNumero : null;

      const j1Name = proximo.jugador1
        ? nombreCompleto(proximo.jugador1.userId)
        : null;
      const j2Name = proximo.jugador2
        ? nombreCompleto(proximo.jugador2.userId)
        : null;

      const partes: string[] = [];
      if (typeof fechaNumero === "number") partes.push(`Fecha ${fechaNumero}`);
      if (j1Name && j2Name) partes.push(`${j1Name} vs ${j2Name}`);

      nextMatchLabel = partes.length > 0 ? partes.join(" · ") : "—";
    }

    // 4) Calcular puntos y posición (solo con partidos aprobados de la categoría)
    const playersCat = await Player.find({ categoria })
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

      const name = nombreCompleto(p.userId) ?? "";
      table.set(pid, {
        playerId: pid,
        nombreOrden: name,
        puntos: 0,
        ganados: 0,
        jugados: 0,
        perdidos: 0,
      });
    }

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
        continue; // doble WO: cuenta jugado, no suma puntos ni W/L
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

    const rows = Array.from(table.values()).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.ganados !== a.ganados) return b.ganados - a.ganados;
      return a.nombreOrden.localeCompare(b.nombreOrden);
    });

    const idx = rows.findIndex((r) => r.playerId === playerId);
    const positionLabel = idx >= 0 ? `${idx + 1}°` : "—";

    const myRow = table.get(playerId);
    const pointsLabel = myRow ? String(myRow.puntos) : "—";

    const response: ResumenJugadorResponse = {
      categoryLabel: labelCategoria(categoria),
      positionLabel,
      pointsLabel,
      nextMatchLabel,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en resumen jugador:", error);
    return NextResponse.json(
      { error: "Error interno al generar el resumen del jugador" },
      { status: 500 }
    );
  }
}
