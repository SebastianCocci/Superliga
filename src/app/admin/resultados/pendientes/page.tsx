"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";
import { ActionButton, ActionLink } from "@/components/ActionButtons";

type Categoria = "Top ten" | "A" | "B" | "C" | "D";
type CategoriaFiltro = "Todas" | Categoria;

type PartidoPendiente = {
  _id: string;
  fechaNumero: number;
  categoria: Categoria;
  tipoResultado?: "normal" | "wo" | "doble_wo" | null;
  sets?: string | null;
  jugador1: { userId: { nombre: string; apellido: string } };
  jugador2: { userId: { nombre: string; apellido: string } };
  ganador?: { userId: { nombre: string; apellido: string } } | null;
  estado: "pendiente";
};

function getResumenResultado(p: PartidoPendiente): string {
  if (!p.tipoResultado) return "Resultado todavía no cargado";

  switch (p.tipoResultado) {
    case "normal":
      return p.sets ? `Resultado: ${p.sets}` : "Resultado: marcador no cargado";
    case "wo":
      return "Resultado: WO";
    case "doble_wo":
      return "Resultado: doble WO";
  }
}

function getTextoGanador(p: PartidoPendiente): string {
  if (p.tipoResultado === "doble_wo") return "Ganador: — (doble WO)";

  if (!p.ganador || !p.ganador.userId) return "Ganador: todavía no definido";

  const u = p.ganador.userId;
  return `Ganador: ${u.apellido}, ${u.nombre}`;
}

export default function ResultadosPendientesPage() {
  const router = useRouter();
  const { openModal } = useModal();

  const [partidos, setPartidos] = useState<PartidoPendiente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaFiltro>("Todas");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPendientes() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch("/api/resultados/pendientes", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.status === 401) {
          router.replace("/login?next=/admin/resultados/pendientes");
          return;
        }

        if (res.status === 403) {
          setPartidos([]);
          setErrorMsg("No tenés permisos para ver esta sección.");
          return;
        }

        if (!res.ok) {
          throw new Error("No se pudieron obtener los resultados pendientes.");
        }

        const data: PartidoPendiente[] = await res.json();
        setPartidos(data);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Error cargando pendientes:", error);
        setErrorMsg("Hubo un problema al cargar los resultados pendientes.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPendientes();

    return () => controller.abort();
  }, [router]);

  async function aprobarResultado(id: string) {
    try {
      const res = await fetch(`/api/resultados/${id}/aprobar`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        router.replace("/login?next=/admin/resultados/pendientes");
        return;
      }

      if (res.status === 403) {
        openModal({
          title: "Acceso denegado",
          message: "No tenés permisos para aprobar resultados.",
          confirmText: "Cerrar",
        });
        return;
      }

      if (!res.ok) {
        throw new Error("No se pudo aprobar el resultado");
      }

      setPartidos((prev) => prev.filter((p) => p._id !== id));

      openModal({
        title: "Aprobado",
        message: "El resultado fue aprobado correctamente.",
        confirmText: "Aceptar",
      });
    } catch (err) {
      console.error(err);
      openModal({
        title: "Error",
        message: "No se pudo aprobar el resultado.",
        confirmText: "Cerrar",
      });
    }
  }

  const partidosFiltrados = useMemo(() => {
    return categoriaSeleccionada === "Todas"
      ? partidos
      : partidos.filter((p) => p.categoria === categoriaSeleccionada);
  }, [categoriaSeleccionada, partidos]);

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
        Resultados Pendientes
      </h1>
      <p className="text-gray-600 mb-6">
        Revisá resultados cargados por jugadores y aprobá los que correspondan.
      </p>

      {errorMsg ? <p className="mb-6 text-sm text-red-600">{errorMsg}</p> : null}

      {/* Caso sin pendientes en absoluto */}
      {partidos.length === 0 && !errorMsg ? (
        <p className="text-gray-600 text-center">
          No hay resultados pendientes de aprobación.
        </p>
      ) : null}

      {partidos.length > 0 ? (
        <>
          {/* Filtro por liga */}
          <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="w-full md:w-60">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por liga
              </label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) =>
                  setCategoriaSeleccionada(e.target.value as CategoriaFiltro)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343] bg-white"
              >
                <option value="Todas">Todas</option>
                <option value="Top ten">Top ten</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Mostrando:{" "}
              <span className="font-semibold">{partidosFiltrados.length}</span>{" "}
              de <span className="font-semibold">{partidos.length}</span>
            </div>
          </div>

          {/* Caso: hay pendientes, pero no en la liga seleccionada */}
          {partidosFiltrados.length === 0 ? (
            <p className="text-gray-600 text-center">
              No hay resultados pendientes para la liga seleccionada.
            </p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 overflow-hidden">
              {partidosFiltrados.map((p) => (
                <div
                  key={p._id}
                  className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  {/* Info del partido */}
                  <div className="flex-1 flex flex-col gap-1 text-sm text-gray-700">
                    <div>
                      <strong>
                        {p.jugador1.userId.apellido}, {p.jugador1.userId.nombre}
                      </strong>{" "}
                      vs{" "}
                      <strong>
                        {p.jugador2.userId.apellido}, {p.jugador2.userId.nombre}
                      </strong>
                    </div>

                    <div className="text-xs text-gray-500">
                      Liga: {p.categoria} · Fecha: {p.fechaNumero}
                    </div>

                    <div className="text-xs text-gray-600">
                      {getResumenResultado(p)}
                    </div>

                    <div className="text-xs text-gray-600">
                      {getTextoGanador(p)}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3 flex-wrap">
                    <ActionLink variant="edit" href={`/admin/resultados/${p._id}`}>
                      Ver / Editar
                    </ActionLink>

                    <ActionButton
                      variant="primary"
                      onClick={() =>
                        openModal({
                          title: "Aprobar resultado",
                          message: "¿Confirmás que este resultado es correcto?",
                          confirmText: "Aprobar",
                          cancelText: "Cancelar",
                          onConfirm: () => aprobarResultado(p._id),
                        })
                      }
                    >
                      Aprobar
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
