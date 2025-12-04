import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Partido } from "@/models/PartidoModel";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const partido = await Partido.findById(params.id);

    if (!partido) {
      return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    }

    partido.estado = "aprobado";
    partido.fechaAprobacion = new Date();

    await partido.save();

    return NextResponse.json({ message: "Resultado aprobado correctamente" });
  } catch (err) {
    console.error("Error aprobando resultado:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
