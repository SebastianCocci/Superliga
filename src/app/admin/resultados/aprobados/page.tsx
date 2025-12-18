"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionLink } from "@/components/ActionButtons";

type Categoria = "Top ten" | "A" | "B" | "C" | "D";
type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
type TipoResultado = "normal" | "wo" | "doble_wo";

type UserMini = {
  nombre: string;
  apellido: string;
};

type PlayerInfo = {
  _id: string;
  userId?: UserMini | null;
};

type PartidoAprobado = {
  _id: string;
  categoria: Categoria;
  fechaNumero: number;
  estado: EstadoResultado;
  tipoResultado?: TipoResultado;
  sets?: string;
  jugador1: PlayerInfo;
  jugador2: PlayerInfo;
  ganador?: PlayerInfo | null;
};

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: "Top ten", label: "Top Ten" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

function labelCategoria(categoria: Categoria) {
  return categoria === "Top ten" ? "Top Ten" : `Categoría ${categoria}`;
}

function labelTipoResultado(tipo?: TipoResultado) {
  if (tipo === "normal") return "Partido jugado";
  if (tipo === "wo") return "Ganador por WO";
  if (tipo === "doble_wo") return "Doble WO";
  return "Sin tipo";
}

function nombreCompleto(u?: UserMini | null) {
  if (!u) return null;
  return `${u.apellido}, ${u.nombre}`;
}

export default function ResultadosAnterioresPage() {
  const router = useRouter();

  const [categoria, setCategoria] = useState<Categoria>("D");
  const [resultados, setResultados] = useState<PartidoAprobado[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoriaLabel = useMemo(() => labelCategoria(categoria), [categoria]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResultados() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(
          `/api/resultados/aprobados?categoria=${encodeURIComponent(categoria)}`,
          {
            signal: controller.signal,
            cache: "no-store",
            credentials: "include",
          }
        );

        if (res.status === 401) {
          router.replace("/login?next=/admin/resultados/aprobados");
          return;
        }

        if (res.status === 403) {
          setResultados([]);
          setErrorMsg("No tenés permisos para ver esta sección.");
          return;
        }

        if (!res.ok) {
          throw new Error("No se pudieron obtener los resultados anteriores");
        }

        const data: PartidoAprobado[] = await res.json();
        setResultados(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        console.error(err);
        setErrorMsg("Hubo un problema al cargar los resultados.");
        setResultados([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchResultados();

    return () => {
      controller.abort();
    };
  }, [categoria, router]);

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
        Resultados Anteriores
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando partidos <span className="font-semibold">aprobados</span>{" "}
            de la categoría:
          </p>
          <p className="text-lg font-semibold text-gray-900">{categoriaLabel}</p>
          <p className="text-xs text-gray-500 mt-1">Total: {resultados.length}</p>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cambiar categoría
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#A50343]"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg ? <p className="mb-4 text-sm text-red-600">{errorMsg}</p> : null}

      {resultados.length === 0 ? (
        <p className="text-gray-600 text-center">
          No hay resultados aprobados para esta categoría.
        </p>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm divide-y">
          {resultados.map((p) => {
            const esDobleWO = p.tipoResultado === "doble_wo";

            const ganadorNombre = esDobleWO
              ? null
              : nombreCompleto(p.ganador?.userId ?? null);

            const ganadorTexto = esDobleWO
              ? "Sin ganador (Doble WO)"
              : ganadorNombre
              ? `Ganador: ${ganadorNombre}`
              : "Ganador no registrado";

            const tipoTexto = labelTipoResultado(p.tipoResultado);

            const j1 =
              nombreCompleto(p.jugador1.userId ?? null) ?? "Jugador 1";
            const j2 =
              nombreCompleto(p.jugador2.userId ?? null) ?? "Jugador 2";

            return (
              <div
                key={p._id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="text-sm text-gray-800">
                  <div className="leading-snug">
                    <strong>{j1}</strong> vs <strong>{j2}</strong>
                  </div>

                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Tipo:</span> {tipoTexto}
                    </div>

                    {p.tipoResultado === "normal" && p.sets ? (
                      <div>
                        <span className="font-medium">Sets:</span> {p.sets}
                      </div>
                    ) : null}

                    <div>{ganadorTexto}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 md:text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border">
                    Fecha: {p.fechaNumero}
                  </span>
                </div>

                <div className="flex gap-3 md:justify-end">
                  <div className="w-full md:w-auto">
                    <ActionLink variant="edit" href={`/admin/resultados/${p._id}`}>
                      Ver / Editar
                    </ActionLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
