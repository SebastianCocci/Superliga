import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

// Registramos TODOS los modelos (User, Player, Partido)
import "@/models";
import { Partido } from "@/models/PartidoModel";
import { Player } from "@/models/PlayerModel";

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

interface PartidoPendientePopulado {
  _id: string;
  categoria: string;
  fechaNumero: number;
  estado: EstadoResultado;
  jugador1: {
    _id: string;
    userId: {
      _id: string;
      nombre: string;
      apellido: string;
    };
  };
  jugador2: {
    _id: string;
    userId: {
      _id: string;
      nombre: string;
      apellido: string;
    };
  };
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

    // 3) Estados “pendientes” (todo lo que no está aprobado)
    const estadosPendientes: EstadoResultado[] = [
      "sin_cargar",
      "pendiente",
      "rechazado",
    ];

    // 4) Traer SOLO partidos donde participa este player
    const partidos = await Partido.find({
      categoria: player.categoria,
      estado: { $in: estadosPendientes },
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
      .sort({ fechaNumero: 1 })
      .lean<PartidoPendientePopulado[]>();

    return NextResponse.json(partidos, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo partidos pendientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
