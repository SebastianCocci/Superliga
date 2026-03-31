"use client";

import { useEffect, useMemo, useState } from "react";
import type { Categoria } from "@/components/TablaPosiciones";

type CategoriaConfig = {
  categoria: Categoria;
  ascensos: number;
  descensos: number;
};

const CATEGORIAS: Array<{ value: Categoria; label: string }> = [
  { value: "Top ten", label: "Top Ten" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

function toNonNegativeInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n < 0) return null;
  return n;
}

export default function ConfiguracionAdminPage() {
  const [categoria, setCategoria] = useState<Categoria>("D");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [ascensosInput, setAscensosInput] = useState<string>("0");
  const [descensosInput, setDescensosInput] = useState<string>("0");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const ascensosParsed = useMemo(() => toNonNegativeInt(ascensosInput), [ascensosInput]);
  const descensosParsed = useMemo(() => toNonNegativeInt(descensosInput), [descensosInput]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        const res = await fetch(
          `/api/config/categorias?categoria=${encodeURIComponent(categoria)}`
        );

        if (!res.ok) {
          throw new Error("No se pudo obtener la configuración de la categoría");
        }

        const data: CategoriaConfig = await res.json();

        setAscensosInput(String(Number.isFinite(data.ascensos) ? data.ascensos : 0));
        setDescensosInput(String(Number.isFinite(data.descensos) ? data.descensos : 0));
      } catch (error) {
        console.error("Error cargando configuración:", error);
        setErrorMsg("Hubo un problema al cargar la configuración.");
        setAscensosInput("0");
        setDescensosInput("0");
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [categoria]);

  async function handleGuardar() {
    setSuccessMsg(null);
    setErrorMsg(null);

    const ascensos = ascensosParsed;
    const descensos = descensosParsed;

    if (ascensos === null || descensos === null) {
      setErrorMsg("Ascensos y descensos deben ser enteros mayores o iguales a 0.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/config/categorias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria, ascensos, descensos }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const maybeError =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo guardar la configuración.";
        throw new Error(maybeError);
      }

      setSuccessMsg("Configuración guardada correctamente.");
    } catch (error) {
      console.error("Error guardando configuración:", error);
      setErrorMsg(
        error instanceof Error ? error.message : "Hubo un problema al guardar la configuración."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-2">Configuración</h1>
      <p className="text-gray-600 mb-6">
        Definí cuántos ascienden y cuántos descienden por categoría. Esto impacta en el pintado
        (verde/rojo) de la tabla.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        {/* Selector categoría */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="w-full sm:max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#A50343]"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {categoria === "Top ten" ? "Top Ten" : `Categoría ${categoria}`}
          </div>
        </div>

        {/* Inputs ascensos/descensos */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ascensos
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={ascensosInput}
              onChange={(e) => setAscensosInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#A50343]"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cantidad de jugadores que se pintan en verde desde la posición 1.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descensos
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={descensosInput}
              onChange={(e) => setDescensosInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#A50343]"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cantidad de jugadores que se pintan en rojo desde el final de la tabla.
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {errorMsg ? (
          <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
        ) : null}
        {successMsg ? (
          <p className="mt-4 text-sm text-green-700">{successMsg}</p>
        ) : null}

        {/* Acción */}
        <div className="mt-6 flex items-center justify-end">
          <button
            onClick={handleGuardar}
            disabled={saving || ascensosParsed === null || descensosParsed === null}
            className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#A50343] hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
