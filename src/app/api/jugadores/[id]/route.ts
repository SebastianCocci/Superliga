import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Player } from "@/models/PlayerModel";
import { User } from "@/models/UserModel";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Next.js 14: params es una promesa
    const { id } = await context.params;

    // 1. Buscar el jugador por ID
    const player = await Player.findById(id);

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    // Guardamos el userId antes de eliminar el jugador
    const userId = player.userId;

    // 2. Eliminar el jugador
    await Player.findByIdAndDelete(id);

    // 3. Eliminar el usuario asociado
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: "Jugador y usuario asociados eliminados correctamente",
    });
  } catch (error) {
    console.error("Error eliminando jugador y usuario:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/* Editar */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const { nombre, apellido, dni, telefono, categoria } = body;

    // Actualizar jugador
    const jugador = await Player.findById(id).populate("userId");

    if (!jugador) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    // actualizar campos del user
    await User.findByIdAndUpdate(
      jugador.userId._id,
      { nombre, apellido, dni, telefono },
      { new: true }
    );

    // actualizar categoría del player
    jugador.categoria = categoria;
    await jugador.save();

    return NextResponse.json(
      { message: "Jugador actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar jugador:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

/* GET */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // params ahora es una PROMESA → hay que await
    const { id } = await context.params;

    console.log("=== GET /api/jugadores/[id] ===");
    console.log("ID recibido:", id);

    const jugadores = await Player.find().select("_id");
    console.log(
      "Jugadores encontrados en la colección:",
      jugadores.map(j => j._id.toString())
    );

    const player = await Player.findById(id).populate("userId").lean();

    console.log("Resultado de findById:", player);

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(player, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo jugador:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/* PATCH */

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const { activo } = await request.json();

    const updated = await Player.findByIdAndUpdate(
      id,
      { activo },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Estado del jugador actualizado correctamente",
      jugador: updated,
    });
  } catch (error) {
    console.error("Error actualizando estado del jugador:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}