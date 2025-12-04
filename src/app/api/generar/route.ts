import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

// REGISTRA TODOS LOS MODELOS
import "@/models";

import { Player } from "@/models/PlayerModel";
import { Partido } from "@/models/PartidoModel";
import generarFixture from "@/utils/generarFixture";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { categoria } = await req.json();

    if (!categoria) {
      return NextResponse.json(
        { error: "Debe enviar una categoría" },
        { status: 400 }
      );
    }

    const jugadores = await Player.find({ categoria, activo: true })
      .populate("userId")
      .lean();

    if (jugadores.length < 2) {
      return NextResponse.json(
        { error: "Se necesitan al menos 2 jugadores" },
        { status: 400 }
      );
    }

    const fixture = generarFixture(jugadores, categoria);

    await Partido.deleteMany({ categoria });
    await Partido.insertMany(fixture);

    return NextResponse.json(
      { message: "Fixture generado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generando fixture:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
