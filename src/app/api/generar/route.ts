import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Player } from "@/models/PlayerModel";
import { Partido } from "@/models/PartidoModel";
import { generarFixture } from "@/utils/generarFixture";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Recibimos la categoría desde el body
    const { categoria } = await req.json();

    if (!categoria) {
      return NextResponse.json(
        { error: "Debe enviar una categoría" },
        { status: 400 }
      );
    }

    // Obtenemos jugadores activos de esa categoría
    const jugadores = await Player.find({ categoria, activo: true })
      .select("_id")
      .lean();

    if (jugadores.length < 2) {
      return NextResponse.json(
        { error: "Se necesitan al menos 2 jugadores para generar el fixture" },
        { status: 400 }
      );
    }

    // Generar los partidos (OBJETOS EN MEMORIA)
    const partidos = generarFixture(
      jugadores as { _id: Types.ObjectId }[],
      categoria
    );

    // Eliminamos fixtures anteriores de la categoría
    await Partido.deleteMany({ categoria });

    // Insertamos los nuevos partidos en BD
    await Partido.insertMany(partidos);

    return NextResponse.json(
      {
        message: "Fixture generado correctamente",
        cantidadPartidos: partidos.length,
      },
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
