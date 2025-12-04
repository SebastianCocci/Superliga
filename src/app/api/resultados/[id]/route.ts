import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";

// registra User, Player, Partido
import "@/models";
import { Partido } from "@/models/PartidoModel";

type ParamsPromise = {
  params: Promise<{ id: string }>;
};

/* =========================================
   GET /api/resultados/[id]
   Devuelve el partido con jugadores poblados
========================================= */
export async function GET(_req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    // 👈 AHORA SÍ: params es una Promise
    const { id } = await params;

    const partido = await Partido.findById(id)
      .populate({
        path: "jugador1",
        populate: { path: "userId" },
      })
      .populate({
        path: "jugador2",
        populate: { path: "userId" },
      })
      .lean();

    if (!partido) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(partido, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo partido:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

/* =========================================
   PATCH /api/resultados/[id]
   Actualiza el resultado (jugador o admin)
========================================= */
export async function PATCH(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    // 👈 lo mismo aquí
    const { id } = await params;

    const body = await req.json();
    const { tipoResultado, ganador, sets } = body as {
      tipoResultado?: "normal" | "wo" | "doble_wo";
      ganador?: string | null;
      sets?: string;
    };

    const partido = await Partido.findById(id);

    if (!partido) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    // Actualizamos los campos básicos
    if (tipoResultado) {
      partido.tipoResultado = tipoResultado;
    }

    if (tipoResultado === "normal") {
      partido.sets = sets ?? partido.sets;
    } else {
      partido.sets = undefined;
    }

    if (tipoResultado === "doble_wo") {
      // doble WO → sin ganador
      partido.ganador = undefined;
    } else if (ganador !== undefined) {
      // si viene null lo guardamos como null, si viene string lo guardamos tal cual
      partido.ganador = ganador;
    }

    // cada vez que alguien carga/edita, queda pendiente
    partido.estado = "pendiente";
    partido.fechaCarga = new Date();

    await partido.save();

    return NextResponse.json(
      { message: "Resultado actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando resultado:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
