"use client";

import React from "react";

export type Categoria = "Top ten" | "A" | "B" | "C" | "D";

export type TablaItem = {
  playerId: string;
  nombre: string;
  apellido: string;
  categoria: Categoria;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  puntos: number;
  posicion: number;
};

type TablaPosicionesProps = {
  title?: string;

  categoria: Categoria;
  onCategoriaChange: (categoria: Categoria) => void;

  tabla: TablaItem[];
  loading?: boolean;
  errorMsg?: string | null;

  /**
   * Cantidad de ascensos/descensos definidos por el admin para ESTA categoría.
   */
  ascensos: number;
  descensos: number;

  /**
   * Muestra una leyenda para los colores.
   */
  showLegend?: boolean;

  /**
   * Texto para el estado vacío.
   */
  emptyText?: string;
};

const CATEGORIAS: Array<{ value: Categoria; label: string }> = [
  { value: "Top ten", label: "Top Ten" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

function clampZones(total: number, ascensos: number, descensos: number) {
  const safeAsc = Math.max(0, Math.min(ascensos, total));
  const safeDesc = Math.max(0, Math.min(descensos, Math.max(0, total - safeAsc)));
  return { safeAsc, safeDesc };
}

function getRowClass(position: number, total: number, ascensos: number, descensos: number) {
  if (total <= 0) return "bg-white";

  const { safeAsc, safeDesc } = clampZones(total, ascensos, descensos);

  if (safeAsc > 0 && position <= safeAsc) {
    return "bg-green-50 border-l-4 border-l-green-500";
  }

  if (safeDesc > 0 && position > total - safeDesc) {
    return "bg-red-50 border-l-4 border-l-red-500";
  }

  return "bg-white";
}

export default function TablaPosiciones({
  title = "Tabla de Posiciones",
  categoria,
  onCategoriaChange,
  tabla,
  loading = false,
  errorMsg = null,
  ascensos,
  descensos,
  showLegend = true,
  emptyText = "No hay resultados aprobados para esta categoría.",
}: TablaPosicionesProps) {
  const total = tabla.length;
  const { safeAsc, safeDesc } = clampZones(total, ascensos, descensos);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">Clasificación actual de los jugadores de la liga</p>

      {/* Filtro por categoría */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-700">Mostrando tabla de la categoría:</p>
          <p className="text-lg font-semibold text-gray-900">
            {categoria === "Top ten" ? "Top Ten" : `Categoría ${categoria}`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Ascensos: <span className="font-semibold">{safeAsc}</span> · Descensos:{" "}
            <span className="font-semibold">{safeDesc}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar categoría</label>
          <select
            value={categoria}
            onChange={(e) => onCategoriaChange(e.target.value as Categoria)}
            className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#A50343]"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {errorMsg ? <p className="mb-4 text-sm text-red-600">{errorMsg}</p> : null}

          {tabla.length === 0 ? (
            <p className="text-gray-600 text-center">{emptyText}</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#A50343] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Pos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Jugador
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                          PJ
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                          PG
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                          PP
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                          Pts
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {tabla.map((row) => (
                        <tr
                          key={row.playerId}
                          className={`${getRowClass(
                            row.posicion,
                            total,
                            ascensos,
                            descensos
                          )} transition-colors hover:bg-opacity-80`}
                        >
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {row.posicion}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {row.apellido}, {row.nombre}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-gray-600">
                            {row.partidosJugados}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-gray-600">
                            {row.partidosGanados}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-gray-600">
                            {row.partidosPerdidos}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                            {row.puntos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showLegend && (safeAsc > 0 || safeDesc > 0) ? (
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {safeAsc > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-gray-700">Ascenso ({safeAsc})</span>
                      </div>
                    ) : null}

                    {safeDesc > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded" />
                        <span className="text-gray-700">Descenso ({safeDesc})</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
