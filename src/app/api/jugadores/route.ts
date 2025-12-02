import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/UserModel";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { nombre, apellido, dni, email, telefono, role } = body;

    // Validaciones básicas
    if (!email || !dni || !nombre || !apellido) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Chequear si ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // Generar contraseña temporal
    const password = dni; // POR AHORA usamos DNI como pass
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      nombre,
      apellido,
      dni,
      telefono,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      { message: "Jugador creado", user: newUser },
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
