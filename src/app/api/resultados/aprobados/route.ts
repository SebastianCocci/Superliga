import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";

import "@/models";
import { Partido } from "@/models/PartidoModel";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
type Categoria = "Top ten" | "A" | "B" | "C" | "D";

type QueryFilter = {
  estado: EstadoResultado;
  categoria?: Categoria;
};

async function getAuth(): Promise<
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
  if (!payload) {
    return {
      ok: false,
      res: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { ok: true, payload };
}

function isCategoria(v: unknown): v is Categoria {
  return v === "Top ten" || v === "A" || v === "B" || v === "C" || v === "D";
}

export async function GET(req: Request) {
  const auth = await getAuth();
  if (!auth.ok) return auth.res;

  if (auth.payload.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoriaParam = searchParams.get("categoria");

    const filter: QueryFilter = { estado: "aprobado" };

    if (categoriaParam && isCategoria(categoriaParam)) {
      filter.categoria = categoriaParam;
    }

    const partidos = await Partido.find(filter)
      .populate({
        path: "jugador1",
        populate: { path: "userId" },
      })
      .populate({
        path: "jugador2",
        populate: { path: "userId" },
      })
      .populate({
        path: "ganador",
        populate: { path: "userId" },
      })
      .sort({ fechaNumero: 1 });

    return NextResponse.json(partidos, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/resultados/aprobados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
