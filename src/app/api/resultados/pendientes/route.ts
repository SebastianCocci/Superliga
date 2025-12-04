import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Partido } from "@/models/PartidoModel";

export async function GET() {
  try {
    await connectDB();

    const partidos = await Partido.find({ estado: "pendiente" })
      .populate({
        path: "jugador1",
        populate: { path: "userId" }
      })
      .populate({
        path: "jugador2",
        populate: { path: "userId" }
      })
      .sort({ fechaNumero: 1 });

    return NextResponse.json(partidos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
