import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/UserModel";
import { Player } from "@/models/PlayerModel";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { nombre, apellido, dni, email, telefono, role, categoria } = body;

    if (!email || !dni || !nombre || !apellido || !categoria) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    const password = dni; 
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nombre,
      apellido,
      dni,
      telefono,
      email,
      password: hashedPassword,
      role,
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
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

/* GET */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");

    // Tipo correcto para la consulta a Player
    type PlayerQuery = {
      categoria?: "Top ten" | "A" | "B" | "C" | "D";
    };

    const query: PlayerQuery = {};

    if (categoria) {
      query.categoria = categoria as PlayerQuery["categoria"];
    }

    const jugadores = await Player.find(query)
      .populate("userId")
      .sort({ "userId.apellido": 1 });

    return NextResponse.json(jugadores, { status: 200 });

  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

