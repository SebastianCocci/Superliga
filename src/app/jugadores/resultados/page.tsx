"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ResultadoParaMi = "victoria" | "derrota" | "—";

type PlayerRef = {
  _id: string;
  userId: {
    _id: string;
    nombre: string;
    apellido: string;
  };
};

type PartidoAprobado = {
  _id: string;
  fechaNumero: number;
  estado: "aprobado";
  jugador1: PlayerRef;
  jugador2: PlayerRef;
  ganador?: PlayerRef | null;

  // Extras desde el endpoint
  resultadoParaMi?: ResultadoParaMi;
  marcador?: string;
};

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === "string" ? data.error : "Error en la petición";
  } catch {
    return "Error en la petición";
  }
}

function resultadoLabel(v?: ResultadoParaMi) {
  if (v === "victoria") return "Victoria";
  if (v === "derrota") return "Derrota";
  return "—";
}

function resultadoClass(v?: ResultadoParaMi) {
  if (v === "victoria") return "text-green-700";
  if (v === "derrota") return "text-red-700";
  return "text-gray-600";
}

function nombreCompleto(p?: PlayerRef | null) {
  if (!p?.userId) return "—";
  return `${p.userId.apellido}, ${p.userId.nombre}`;
}

export default function ResultadosJugadorPage() {
  const router = useRouter();

  const [partidos, setPartidos] = useState<PartidoAprobado[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAprobados() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch("/api/partidos/aprobados", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace(
            `/login?next=${encodeURIComponent("/jugadores/resultados")}`
          );
          return;
        }

        if (!res.ok) {
          setErrorMsg(await parseErrorMessage(res));
          return;
        }

        const data = (await res.json()) as PartidoAprobado[];
        setPartidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error obteniendo partidos aprobados:", err);
        setErrorMsg("No se pudieron cargar los resultados aprobados.");
      } finally {
        setLoading(false);
      }
    }

    fetchAprobados();
  }, [router]);

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-2">Resultados</h1>
      <p className="text-gray-600 mb-6">
        Partidos aprobados en los que participaste.
      </p>

      {errorMsg ? (
        <p className="mb-4 text-sm text-red-600">{errorMsg}</p>
      ) : null}

      {!errorMsg && partidos.length === 0 ? (
        <p className="text-gray-600">Todavía no tenés partidos aprobados.</p>
      ) : null}

      {/* MOBILE (cards) */}
      {!errorMsg && partidos.length > 0 ? (
        <div className="space-y-3 sm:hidden">
          {partidos.map((p) => {
            const j1 = nombreCompleto(p.jugador1);
            const j2 = nombreCompleto(p.jugador2);
            const ganador = nombreCompleto(p.ganador ?? null);

            return (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Fecha {p.fechaNumero}
                  </div>
                  <div
                    className={[
                      "text-sm font-semibold",
                      resultadoClass(p.resultadoParaMi),
                    ].join(" ")}
                  >
                    {resultadoLabel(p.resultadoParaMi)}
                  </div>
                </div>

                <div className="mt-2 text-sm font-medium text-gray-900 break-words">
                  {j1} vs {j2}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Marcador</div>
                    <div className="text-sm text-gray-700">
                      {p.marcador ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ganador</div>
                    <div className="text-sm text-gray-700 break-words">
                      {ganador}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* DESKTOP/TABLET (table) */}
      {!errorMsg && partidos.length > 0 ? (
        <div className="hidden sm:block w-full overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#A50343] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Partido
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Marcador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Ganador
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {partidos.map((p) => {
                    const j1 = nombreCompleto(p.jugador1);
                    const j2 = nombreCompleto(p.jugador2);
                    const ganador = nombreCompleto(p.ganador ?? null);

                    return (
                      <tr
                        key={p._id}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Fecha {p.fechaNumero}
                        </td>

                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {j1} vs {j2}
                        </td>

                        <td
                          className={[
                            "px-4 py-3 text-sm font-medium",
                            resultadoClass(p.resultadoParaMi),
                          ].join(" ")}
                        >
                          {resultadoLabel(p.resultadoParaMi)}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.marcador ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ganador}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
