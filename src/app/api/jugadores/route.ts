import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

import { User } from "@/models/UserModel";
import { Player } from "@/models/PlayerModel";
import bcrypt from "bcryptjs";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

type Categoria = "Top ten" | "A" | "B" | "C" | "D";

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "jugador";
}

async function requireAdmin(): Promise<
  | { ok: true; payload: JWTPayload }
  | { ok: false; res: NextResponse }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("slp_token")?.value ?? null;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const payload = verifyToken(token) as JWTPayload | null;

  if (!payload || !payload.id || !payload.email || !isRole(payload.role)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  if (payload.role !== "admin") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }),
    };
  }

  return { ok: true, payload };
}

/* POST: crear jugador (solo admin) */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    const body = await req.json();

    const { nombre, apellido, dni, email, telefono, categoria } = body as {
      nombre?: string;
      apellido?: string;
      dni?: string;
      email?: string;
      telefono?: string;
      categoria?: Categoria;
      role?: Role; // ignorado a propósito
    };

    if (!email || !dni || !nombre || !apellido || !categoria) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // Password inicial = DNI (tu decisión). OK para MVP, luego lo endurecemos.
    const password = String(dni);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nombre,
      apellido,
      dni,
      telefono,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "jugador", // forzado
    });

    const newPlayer = await Player.create({
      userId: newUser._id,
      categoria,
      puntos: 0,
      partidosJugados: 0,
      partidosGanados: 0,
      partidosPerdidos: 0,
      activo: true,
    });

    return NextResponse.json(
      {
        message: "Jugador creado correctamente",
        user: newUser,
        player: newPlayer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear jugador:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

/* GET: listar jugadores (solo admin) */
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");

    type PlayerQuery = { categoria?: Categoria };
    const query: PlayerQuery = {};

    if (categoria) {
      // validación defensiva
      const c = categoria as Categoria;
      if (c === "Top ten" || c === "A" || c === "B" || c === "C" || c === "D") {
        query.categoria = c;
      }
    }

    const jugadores = await Player.find(query)
      .populate("userId")
      .sort({ "userId.apellido": 1 });

    return NextResponse.json(jugadores, { status: 200 });
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
