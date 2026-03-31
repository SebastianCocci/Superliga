"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { playerService } from "@/app/api/jugadores/services/playerService";

type JugadorItem = {
  _id: string;
  categoria: "Top ten" | "A" | "B" | "C" | "D";
  userId: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    email: string;
  };
};

export default function JugadoresListaPage() {
  const router = useRouter();

  const [jugadores, setJugadores] = useState<JugadorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [categoriaActual, setCategoriaActual] =
    useState<JugadorItem["categoria"] | null>(null);

  useEffect(() => {
    async function fetchJugadores() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const data = await playerService.getMyCategory();
        setCategoriaActual(data.categoria as JugadorItem["categoria"]);
        setJugadores(data.jugadores as JugadorItem[]);
      } catch (err) {
        console.error("Error obteniendo jugadores:", err);

        const status = (err as { status?: number })?.status;
        if (status === 401) {
          router.replace(
            `/login?next=${encodeURIComponent("/jugadores/lista")}`
          );
          return;
        }

        setErrorMsg("No se pudieron cargar los jugadores.");
      } finally {
        setLoading(false);
      }
    }

    fetchJugadores();
  }, [router]);

  // ---------------------------------------
  // FILTRO LOCAL POR BUSCADOR
  // ---------------------------------------
  const term = search.trim().toLowerCase();

  const jugadoresFiltrados = jugadores.filter((j) => {
    if (!term) return true;

    const nombreCompleto =
      `${j.userId.nombre} ${j.userId.apellido}`.toLowerCase();
    const apellidoNombre =
      `${j.userId.apellido} ${j.userId.nombre}`.toLowerCase();
    const dni = (j.userId.dni || "").toLowerCase();
    const tel = (j.userId.telefono || "").toLowerCase();

    return (
      nombreCompleto.includes(term) ||
      apellidoNombre.includes(term) ||
      dni.includes(term) ||
      tel.includes(term)
    );
  });

  // ---------------------------------------
  // ESTADOS DE CARGA
  // ---------------------------------------
  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-2">
        Jugadores – Categoría {categoriaActual ?? "—"}
      </h1>
      <p className="text-gray-600 mb-6">
        Listado de jugadores de tu categoría con buscador rápido.
      </p>

      {errorMsg ? <p className="mb-4 text-sm text-red-600">{errorMsg}</p> : null}

      {/* BUSCADOR */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar jugador
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre, apellido, DNI o teléfono"
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#A50343] focus:outline-none text-sm bg-white"
        />
        <p className="mt-1 text-xs text-gray-500">
          Filtra solo dentro de tu categoría.
        </p>
      </div>

      {jugadoresFiltrados.length === 0 ? (
        <p className="text-gray-600">
          {jugadores.length === 0
            ? "No hay jugadores registrados en esta categoría."
            : "No se encontraron jugadores que coincidan con la búsqueda."}
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#A50343] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Jugador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Teléfono
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {jugadoresFiltrados.map((j) => (
                    <tr
                      key={j._id}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {j.userId.apellido}, {j.userId.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {j.userId.dni}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {j.userId.telefono || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
