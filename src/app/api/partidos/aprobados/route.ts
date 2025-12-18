import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

// Registramos TODOS los modelos (User, Player, Partido)
import "@/models";
import { Partido } from "@/models/PartidoModel";
import { Player } from "@/models/PlayerModel";

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
type TipoResultado = "normal" | "wo" | "doble_wo";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

interface PartidoAprobadoPopulado {
  _id: unknown;
  categoria: string;
  fechaNumero: number;
  estado: EstadoResultado;

  tipoResultado?: TipoResultado;
  sets?: string;

  jugador1: {
    _id: unknown;
    userId: {
      _id: unknown;
      nombre: string;
      apellido: string;
    };
  };
  jugador2: {
    _id: unknown;
    userId: {
      _id: unknown;
      nombre: string;
      apellido: string;
    };
  };
  ganador?: {
    _id: unknown;
    userId: {
      _id: unknown;
      nombre: string;
      apellido: string;
    };
  } | null;
}

type ResultadoParaMi = "victoria" | "derrota" | "—";

function formatSets(sets?: string): string {
  if (!sets) return "—";
  // En tu schema se guarda como "6/2 6/3". Lo mostramos como "6-2 6-3".
  return sets.replaceAll("/", "-");
}

function buildMarcador(tipo?: TipoResultado, sets?: string): string {
  if (tipo === "doble_wo") return "Doble WO";
  if (tipo === "wo") return "WO";
  if (tipo === "normal") return formatSets(sets);
  return "—";
}

export async function GET() {
  try {
    await connectDB();

    // 1) Auth: cookie httpOnly
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

    // 2) Buscar el Player asociado al user logueado
    const player = await Player.findOne({ userId: payload.id })
      .select("_id categoria")
      .lean<{ _id: unknown; categoria: string } | null>();

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado para el usuario logueado" },
        { status: 404 }
      );
    }

    const myPlayerId = String(player._id);

    // 3) Traer SOLO partidos aprobados donde participa este player
    const partidos = await Partido.find({
      categoria: player.categoria,
      estado: "aprobado",
      $or: [{ jugador1: player._id }, { jugador2: player._id }],
    })
      .populate({
        path: "jugador1",
        populate: { path: "userId", select: "nombre apellido" },
      })
      .populate({
        path: "jugador2",
        populate: { path: "userId", select: "nombre apellido" },
      })
      .populate({
        path: "ganador",
        populate: { path: "userId", select: "nombre apellido" },
      })
      .sort({ fechaNumero: 1 })
      .lean<PartidoAprobadoPopulado[]>();

    const partidosConExtras = partidos.map((p) => {
      const ganadorId = p.ganador?._id != null ? String(p.ganador._id) : null;

      let resultadoParaMi: ResultadoParaMi = "—";
      if (p.tipoResultado === "doble_wo") {
        resultadoParaMi = "—";
      } else if (ganadorId) {
        resultadoParaMi = ganadorId === myPlayerId ? "victoria" : "derrota";
      }

      const marcador = buildMarcador(p.tipoResultado, p.sets);

      return {
        ...p,
        resultadoParaMi,
        marcador,
      };
    });

    return NextResponse.json(partidosConExtras, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo partidos aprobados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
