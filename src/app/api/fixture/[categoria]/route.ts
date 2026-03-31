import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

// registra User, Player, Partido
import "@/models";

import { Partido } from "@/models/PartidoModel";

interface PartidoPopulado {
  _id: string;
  fechaNumero: number;
  jugador1: { userId: { nombre: string; apellido: string } };
  jugador2: { userId: { nombre: string; apellido: string } };
  estado: string;
}

interface FechaFixture {
  fechaNumero: number;
  partidos: PartidoPopulado[];
}

type Params = {
  params: Promise<{ categoria: string }>;
};


export async function GET(_req: Request, context: Params) {
  try {
    await connectDB();

    const { categoria } = await context.params;

    const partidos = await Partido.find({ categoria })
      .populate({
        path: "jugador1",
        populate: { path: "userId" },
      })
      .populate({
        path: "jugador2",
        populate: { path: "userId" },
      })
      .sort({ fechaNumero: 1 })
      .lean<PartidoPopulado[]>();

    // ... resto igual


    if (partidos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const fixture: FechaFixture[] = partidos.reduce(
      (acc: FechaFixture[], partido) => {
        const index = partido.fechaNumero - 1;

        if (!acc[index]) {
          acc[index] = {
            fechaNumero: partido.fechaNumero,
            partidos: [],
          };
        }

        acc[index].partidos.push(partido);
        return acc;
      },
      []
    );

    return NextResponse.json(fixture, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo fixture:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
