import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import "@/models";
import { CategoryConfigModel, CATEGORIAS } from "@/models/CategoryConfigModel";
import type { Categoria } from "@/models/CategoryConfigModel";

function isCategoria(value: string | null): value is Categoria {
  return value !== null && (CATEGORIAS as readonly string[]).includes(value);
}

function isNonNegativeInteger(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoriaParam = searchParams.get("categoria");

    // Si viene categoria -> devolvemos esa config (o default si no existe)
    if (categoriaParam !== null) {
      if (!isCategoria(categoriaParam)) {
        return NextResponse.json(
          { error: "Categoría inválida" },
          { status: 400 }
        );
      }

      const cfg = await CategoryConfigModel.findOne({
        categoria: categoriaParam,
      }).lean();

      return NextResponse.json(
        cfg ?? { categoria: categoriaParam, ascensos: 0, descensos: 0 },
        { status: 200 }
      );
    }

    // Si no viene categoria -> devolvemos todas
    const all = await CategoryConfigModel.find({}).lean();
    return NextResponse.json(all, { status: 200 });
  } catch (error) {
    console.error("Error leyendo configuración de categorías:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body: unknown = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const { categoria, ascensos, descensos } = body as {
      categoria?: string;
      ascensos?: unknown;
      descensos?: unknown;
    };

    if (!isCategoria(categoria ?? null)) {
      return NextResponse.json(
        { error: "Debe indicar una categoría válida" },
        { status: 400 }
      );
    }

    if (!isNonNegativeInteger(ascensos) || !isNonNegativeInteger(descensos)) {
      return NextResponse.json(
        { error: "ascensos y descensos deben ser enteros >= 0" },
        { status: 400 }
      );
    }

    const updated = await CategoryConfigModel.findOneAndUpdate(
      { categoria },
      { $set: { ascensos, descensos } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error guardando configuración de categorías:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
