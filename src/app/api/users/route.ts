import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/UserModel";
import { NextResponse } from "next/server";

interface CreateUserDTO {
  email: string;
  password: string;
  role: "admin" | "jugador";
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().lean();
    return NextResponse.json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const data: CreateUserDTO = await request.json();

    // Validaciones básicas
    if (!data.email || !data.password || !data.role) {
      return NextResponse.json(
        { error: "email, password y role son obligatorios" },
        { status: 400 }
      );
    }

    // Chequear si ya existe
    const userExists = await User.findOne({ email: data.email });
    if (userExists) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 409 }
      );
    }

    // Crear usuario
    const newUser = await User.create(data);

    // Remover password antes de responder
    const userSafe = {
      ...newUser.toObject(),
      password: undefined,
    };

    return NextResponse.json(userSafe);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
