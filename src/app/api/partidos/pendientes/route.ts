import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

// Registramos TODOS los modelos (User, Player, Partido)
import "@/models";
import { Partido } from "@/models/PartidoModel";

type EstadoResultado =
  | "sin_cargar"
  | "pendiente"
  | "aprobado"
  | "rechazado";

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

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");

    if (!categoria) {
      return NextResponse.json(
        { error: "Debe indicar una categoría" },
        { status: 400 }
      );
    }

    // Partidos NO jugados (todo lo que no está aprobado)
    const estadosPendientes: EstadoResultado[] = [
      "sin_cargar",
      "pendiente",
      "rechazado",
    ];

    const partidos = await Partido.find({
      categoria,
      estado: { $in: estadosPendientes },
    })
      .populate({
        path: "jugador1",
        populate: {
          path: "userId",
          select: "nombre apellido",
        },
      })
      .populate({
        path: "jugador2",
        populate: {
          path: "userId",
          select: "nombre apellido",
        },
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
