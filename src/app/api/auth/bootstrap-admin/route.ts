import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/UserModel";

type Body = {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
};

export async function POST(req: Request) {
  try {
    // Seguridad: no permitir esto en producción
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const headerToken = (req.headers.get("x-bootstrap-token") ?? "").trim();
    const expected = (process.env.BOOTSTRAP_TOKEN ?? "").trim();

    // Mensaje claro si el env no está cargado
    if (!expected) {
      return NextResponse.json(
        { error: "BOOTSTRAP_TOKEN no está definido o no fue cargado. Reiniciá npm run dev." },
        { status: 500 }
      );
    }

    if (headerToken !== expected) {
      return NextResponse.json({ error: "Token de bootstrap inválido." }, { status: 401 });
    }

    await connectDB();

    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount >= 2) {
      return NextResponse.json(
        { error: "Ya existen 2 administradores. Bootstrap bloqueado." },
        { status: 409 }
      );
    }

    const body = (await req.json()) as Body;

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const apellido =
      typeof body.apellido === "string" ? body.apellido.trim() : "";
    const dni = typeof body.dni === "string" ? body.dni.trim() : "";
    const telefono =
      typeof body.telefono === "string" ? body.telefono.trim() : "";

    if (!email || !password || !nombre || !apellido || !dni) {
      return NextResponse.json(
        {
          error:
            "Faltan datos obligatorios (email, password, nombre, apellido, dni)",
        },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email }).select("_id").lean();
    if (existing) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      nombre,
      apellido,
      dni,
      telefono,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: newAdmin._id.toString(),
          email: newAdmin.email,
          role: newAdmin.role,
          nombre: newAdmin.nombre,
          apellido: newAdmin.apellido,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error bootstrap admin:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
