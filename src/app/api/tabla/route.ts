// src/app/api/tabla/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import "@/models";
import { Player } from "@/models/PlayerModel";
import { Partido } from "@/models/PartidoModel";
import type { Types } from "mongoose";

const CATEGORIAS = ["Top ten", "A", "B", "C", "D"] as const;
type Categoria = (typeof CATEGORIAS)[number];

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
type TipoResultado = "normal" | "wo" | "doble_wo";

type TablaItem = {
  playerId: string;
  nombre: string;
  apellido: string;
  categoria: Categoria;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  puntos: number;
};

type TablaItemConPosicion = TablaItem & {
  posicion: number;
};

interface PlayerPopulado {
  _id: Types.ObjectId;
  userId?: {
    _id: Types.ObjectId;
    nombre?: string;
    apellido?: string;
  };
  categoria: Categoria;
  activo: boolean;
}

interface PartidoAprobado {
  _id: Types.ObjectId;
  categoria: Categoria;
  jugador1: Types.ObjectId;
  jugador2: Types.ObjectId;
  estado: EstadoResultado;
  tipoResultado?: TipoResultado;
  ganador?: Types.ObjectId | null;
}

function isCategoria(value: string | null): value is Categoria {
  return value !== null && (CATEGORIAS as readonly string[]).includes(value);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoriaParam = searchParams.get("categoria");

    if (!isCategoria(categoriaParam)) {
      return NextResponse.json(
        { error: "Debe indicar una categoría válida" },
        { status: 400 }
      );
    }

    const categoria = categoriaParam;

    // 1) Jugadores activos de la categoría
    const jugadores = await Player.find({ categoria, activo: true })
      .populate({ path: "userId", select: "nombre apellido" })
      .lean<PlayerPopulado[]>();

    const statsMap = new Map<string, TablaItem>();

    jugadores.forEach((j) => {
      statsMap.set(String(j._id), {
        playerId: String(j._id),
        nombre: j.userId?.nombre ?? "",
        apellido: j.userId?.apellido ?? "",
        categoria: j.categoria,
        partidosJugados: 0,
        partidosGanados: 0,
        partidosPerdidos: 0,
        puntos: 0,
      });
    });

    // 2) Partidos aprobados de esa categoría
    const partidos = await Partido.find({
      categoria,
      estado: "aprobado",
    })
      .select("jugador1 jugador2 tipoResultado ganador")
      .lean<PartidoAprobado[]>();

    // 3) Reglas de puntos (y stats)
    for (const p of partidos) {
      const j1Id = String(p.jugador1);
      const j2Id = String(p.jugador2);

      const j1 = statsMap.get(j1Id);
      const j2 = statsMap.get(j2Id);
      if (!j1 || !j2) continue;

      const tipo = p.tipoResultado;
      const ganadorId = p.ganador ? String(p.ganador) : null;

      // Doble WO: PJ +1 para ambos, PP +1 para ambos, 0 puntos.
      if (tipo === "doble_wo") {
        j1.partidosJugados += 1;
        j2.partidosJugados += 1;

        j1.partidosPerdidos += 1;
        j2.partidosPerdidos += 1;

        continue;
      }

      // Partido normal o WO simple
      j1.partidosJugados += 1;
      j2.partidosJugados += 1;

      if (!ganadorId) continue;

      // Victoria (normal o WO): 1 punto
      if (ganadorId === j1Id) {
        j1.partidosGanados += 1;
        j2.partidosPerdidos += 1;
        j1.puntos += 1;
      } else if (ganadorId === j2Id) {
        j2.partidosGanados += 1;
        j1.partidosPerdidos += 1;
        j2.puntos += 1;
      }
    }

    // 4) Ordenar tabla + posición
    const tablaOrdenada = Array.from(statsMap.values()).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;

      if (b.partidosGanados !== a.partidosGanados) {
        return b.partidosGanados - a.partidosGanados;
      }

      const diffA = a.partidosGanados - a.partidosPerdidos;
      const diffB = b.partidosGanados - b.partidosPerdidos;
      if (diffB !== diffA) return diffB - diffA;

      const byLastName = a.apellido.localeCompare(b.apellido);
      if (byLastName !== 0) return byLastName;
      return a.nombre.localeCompare(b.nombre);
    });

    const tablaConPosicion: TablaItemConPosicion[] = tablaOrdenada.map(
      (item, index) => ({
        ...item,
        posicion: index + 1,
      })
    );

    return NextResponse.json(tablaConPosicion, { status: 200 });
  } catch (error) {
    console.error("Error generando tabla de posiciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
