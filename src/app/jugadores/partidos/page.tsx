"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PlayerInfo = {
  _id: string;
  userId: {
    nombre: string;
    apellido: string;
  };
};

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";

type PartidoPendiente = {
  _id: string;
  fechaNumero: number;
  categoria: "Top ten" | "A" | "B" | "C" | "D";
  estado: EstadoResultado;
  jugador1: PlayerInfo;
  jugador2: PlayerInfo;
};

type PartidosPorFecha = {
  fechaNumero: number;
  partidos: PartidoPendiente[];
};

export default function JugadorPartidosPage() {
  const [grouped, setGrouped] = useState<PartidosPorFecha[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // TODO: cuando haya login, sacar la categoría del jugador logueado
  const categoriaActual: PartidoPendiente["categoria"] = "D";

  useEffect(() => {
    async function fetchPartidos() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(
          `/api/partidos/pendientes?categoria=${encodeURIComponent(
            categoriaActual
          )}`
        );

        if (!res.ok) {
          throw new Error("No se pudieron obtener los partidos pendientes");
        }

        const data: PartidoPendiente[] = await res.json();

        const mapPorFecha: Record<number, PartidoPendiente[]> = {};

        data.forEach((p) => {
          if (!mapPorFecha[p.fechaNumero]) {
            mapPorFecha[p.fechaNumero] = [];
          }
          mapPorFecha[p.fechaNumero].push(p);
        });

        const fechasOrdenadas = Object.keys(mapPorFecha)
          .map(Number)
          .sort((a, b) => a - b);

        const agrupado: PartidosPorFecha[] = fechasOrdenadas.map(
          (fechaNumero) => ({
            fechaNumero,
            partidos: mapPorFecha[fechaNumero],
          })
        );

        setGrouped(agrupado);
      } catch (err) {
        console.error(err);
        setErrorMsg("Hubo un problema al cargar los partidos.");
      } finally {
        setLoading(false);
      }
    }

    fetchPartidos();
  }, [categoriaActual]);

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-6">
        Mis Partidos – Categoría {categoriaActual}
      </h1>

      {errorMsg && (
        <p className="mb-4 text-sm text-red-600">
          {errorMsg}
        </p>
      )}

      {grouped.length === 0 ? (
        <p className="text-gray-600">
          No tenés partidos pendientes en esta categoría.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map((fecha) => (
            <div
              key={fecha.fechaNumero}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-800">
                  Fecha {fecha.fechaNumero}
                </h2>
              </div>

              <ul className="divide-y divide-gray-100">
                {fecha.partidos.map((p) => (
                  <li
                    key={p._id}
                    className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    {/* Jugadores */}
                    <div className="text-sm text-gray-800">
                      <strong>
                        {p.jugador1.userId.apellido}, {p.jugador1.userId.nombre}
                      </strong>{" "}
                      vs{" "}
                      <strong>
                        {p.jugador2.userId.apellido}, {p.jugador2.userId.nombre}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Estado */}
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            p.estado === "sin_cargar"
                              ? "bg-gray-200 text-gray-700"
                              : ""
                          }
                          ${
                            p.estado === "pendiente"
                              ? "bg-yellow-200 text-yellow-900"
                              : ""
                          }
                          ${
                            p.estado === "rechazado"
                              ? "bg-red-200 text-red-900"
                              : ""
                          }
                        `}
                      >
                        {p.estado === "sin_cargar" && "Sin resultado cargado"}
                        {p.estado === "pendiente" && "Pendiente de aprobación"}
                        {p.estado === "rechazado" && "Resultado rechazado"}
                      </span>

                      {/* Botón Cargar Resultado: solo si aún no está aprobado */}
                      {(p.estado === "sin_cargar" ||
                        p.estado === "rechazado") && (
                        <Link
                          href={`/jugadores/partidos/${p._id}`}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#A50343] text-white hover:bg-[#8A0336]"
                        >
                          Cargar resultado
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
