import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Partido } from "@/models/PartidoModel";

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

    const cantidad = await Partido.countDocuments({ categoria });

    return NextResponse.json({ existe: cantidad > 0 });
  } catch (error) {
    console.error("Error verificando fixture:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
