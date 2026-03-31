import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";
import { Player } from "@/models/PlayerModel";
import { User } from "@/models/UserModel";

type Role = "admin" | "jugador";

type RequireAdminResult =
  | { ok: true; payload: { id: string; email: string; role: Role } }
  | { ok: false; res: NextResponse };

async function requireAdmin(): Promise<RequireAdminResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("slp_token")?.value;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }),
    };
  }

  if (payload.role !== "admin") {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }

  return { ok: true, payload };
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    const { id } = await context.params;

    const player = await Player.findById(id);

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    const userId = player.userId;

    await Player.findByIdAndDelete(id);
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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();
    const { id } = await context.params;
    const body = (await request.json()) as {
      nombre: string;
      apellido: string;
      dni: string;
      telefono: string;
      categoria: string;
    };

    const { nombre, apellido, dni, telefono, categoria } = body;

    const jugador = await Player.findById(id).populate("userId");

    if (!jugador) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    const userId = (jugador.userId as { _id: string })._id;

    await User.findByIdAndUpdate(
      userId,
      { nombre, apellido, dni, telefono },
      { new: true }
    );

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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    const { id } = await context.params;

    const player = await Player.findById(id).populate("userId").lean();

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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();
    const { id } = await context.params;

    const { activo } = (await request.json()) as { activo: boolean };

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
