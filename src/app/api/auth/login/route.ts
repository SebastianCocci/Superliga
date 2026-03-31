import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/UserModel";
import { signToken } from "@/lib/jwt";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = (await req.json()) as LoginBody;

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    // password tiene select:false, por eso lo pedimos explícitamente
    const user = await User.findOne({ email }).select("+password");

    // Respuesta genérica (no revelamos si el email existe)
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password as string);
    if (!ok) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          nombre: user.nombre,
          apellido: user.apellido,
        },
      },
      { status: 200 }
    );

    // JWT en cookie httpOnly: clave para proteger /admin y /jugadores con middleware
    res.cookies.set("slp_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error en el servidor." },
      { status: 500 }
    );
  }
}
