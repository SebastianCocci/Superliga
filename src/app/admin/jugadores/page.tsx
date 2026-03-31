"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { playerService } from "@/app/api/jugadores/services/playerService";
import { useModal } from "@/app/context/ModalContext";
import { ActionButton, ActionLink } from "@/components/ActionButtons";

type Jugador = {
  _id: string;
  userId: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    dni: string;
  };
  categoria: string; // en DB: "Top ten" | "A" | "B" | "C" | "D"
  puntos: number;
  activo: boolean;
};

type CategoriaFiltro = "Todas" | "Bajas" | "Top ten" | "A" | "B" | "C" | "D";

const filtros: Array<{ value: CategoriaFiltro; label: string }> = [
  { value: "Todas", label: "Todas" },
  { value: "Top ten", label: "Top Ten" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "Bajas", label: "Bajas" },
];

function getStatus(error: unknown): number | null {
  if (error && typeof error === "object" && "status" in error) {
    const s = (error as { status?: unknown }).status;
    return typeof s === "number" ? s : null;
  }
  return null;
}

export default function JugadoresPage() {
  const router = useRouter();
  const { openModal } = useModal();

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [categoria, setCategoria] = useState<CategoriaFiltro>("Todas");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  /* ===========================================================
      FILTRO + BUSCADOR
  ============================================================ */
  const jugadoresFiltrados = useMemo(() => {
    const base = jugadores.filter((j) => {
      if (categoria === "Todas") return j.activo === true;
      if (categoria === "Bajas") return j.activo === false;
      return j.categoria === categoria && j.activo === true;
    });

    const term = search.trim().toLowerCase();
    if (!term) return base;

    return base.filter((j) => {
      const nombreCompleto = `${j.userId.nombre} ${j.userId.apellido}`.toLowerCase();
      const apellidoNombre = `${j.userId.apellido} ${j.userId.nombre}`.toLowerCase();
      const dni = (j.userId.dni || "").toLowerCase();
      const tel = (j.userId.telefono || "").toLowerCase();
      const email = (j.userId.email || "").toLowerCase();

      return (
        nombreCompleto.includes(term) ||
        apellidoNombre.includes(term) ||
        dni.includes(term) ||
        tel.includes(term) ||
        email.includes(term)
      );
    });
  }, [jugadores, categoria, search]);

  /* ===========================================================
      CARGA INICIAL
  ============================================================ */
  useEffect(() => {
    async function fetchJugadores() {
      try {
        setLoading(true);
        const data = await playerService.getAll();
        setJugadores(data);
      } catch (error: unknown) {
        const status = getStatus(error);

        if (status === 401) {
          router.replace("/login?next=/admin/jugadores");
          return;
        }

        if (status === 403) {
          openModal({
            title: "Acceso denegado",
            message: "Tu usuario no tiene permisos para administrar jugadores.",
            confirmText: "Cerrar",
          });
          setJugadores([]);
          return;
        }

        console.error("Error cargando jugadores", error);
        openModal({
          title: "Error",
          message: "No se pudieron cargar los jugadores.",
          confirmText: "Cerrar",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchJugadores();
  }, [openModal, router]);

  /* ===========================================================
      ACCIÓN: CAMBIAR ACTIVO/INACTIVO
  ============================================================ */
  const toggleEstado = (jugador: Jugador) => {
    const nuevoEstado = !jugador.activo;

    openModal({
      title: jugador.activo ? "Dar de baja" : "Dar de alta",
      message: jugador.activo
        ? `¿Confirmás dar de baja a ${jugador.userId.apellido}, ${jugador.userId.nombre}?`
        : `¿Confirmás dar de alta a ${jugador.userId.apellido}, ${jugador.userId.nombre}?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await playerService.toggleActivo(jugador._id, nuevoEstado);

          setJugadores((prev) =>
            prev.map((x) =>
              x._id === jugador._id ? { ...x, activo: nuevoEstado } : x
            )
          );
        } catch (error: unknown) {
          const status = getStatus(error);

          if (status === 401) {
            router.replace("/login?next=/admin/jugadores");
            return;
          }

          if (status === 403) {
            openModal({
              title: "Acceso denegado",
              message: "Tu usuario no tiene permisos para realizar esta acción.",
              confirmText: "Cerrar",
            });
            return;
          }

          openModal({
            title: "Error",
            message: "No se pudo cambiar el estado del jugador.",
            confirmText: "Cerrar",
          });
        }
      },
    });
  };

  /* ===========================================================
      ACCIÓN: ELIMINAR JUGADOR
  ============================================================ */
  const eliminarJugador = (jugador: Jugador) => {
    openModal({
      title: "Eliminar jugador",
      message: `¿Eliminar definitivamente a ${jugador.userId.apellido}, ${jugador.userId.nombre}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await playerService.delete(jugador._id);

          setJugadores((prev) => prev.filter((x) => x._id !== jugador._id));

          openModal({
            title: "Jugador eliminado",
            message: "El jugador fue eliminado correctamente.",
            confirmText: "Cerrar",
          });
        } catch (error: unknown) {
          const status = getStatus(error);

          if (status === 401) {
            router.replace("/login?next=/admin/jugadores");
            return;
          }

          if (status === 403) {
            openModal({
              title: "Acceso denegado",
              message: "Tu usuario no tiene permisos para realizar esta acción.",
              confirmText: "Cerrar",
            });
            return;
          }

          openModal({
            title: "Error",
            message: "No se pudo eliminar el jugador.",
            confirmText: "Cerrar",
          });
        }
      },
    });
  };

  /* ===========================================================
      UI
  ============================================================ */
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h1 className="text-3xl font-bold text-[#A50343]">
          Gestión de Jugadores
        </h1>

        <ActionLink
          variant="primary"
          href="/admin/jugadores/nuevo"
          className="mt-4 md:mt-0 px-5 py-3 text-sm"
        >
          + Agregar Jugador
        </ActionLink>
      </div>

      <p className="text-gray-600 mb-6">
        Administrá jugadores, filtrá por categoría y buscá por nombre, DNI,
        teléfono o email.
      </p>

      <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="w-full md:w-60">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por categoría
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaFiltro)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343] bg-white"
          >
            {filtros.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-[420px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar jugador
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, apellido, DNI, teléfono o email"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A50343] focus:outline-none text-sm bg-white"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-gray-500">
            Filtra sobre el listado actual (según categoría seleccionada).
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {jugadoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        {jugadores.length === 0
                          ? "No hay jugadores cargados."
                          : "No hay jugadores que coincidan con el filtro/búsqueda."}
                      </td>
                    </tr>
                  ) : (
                    jugadoresFiltrados.map((j) => (
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
                          {j.userId.telefono}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {j.categoria}
                        </td>

                        <td className="px-4 py-3 flex gap-3 flex-wrap items-center">
                          <ActionLink
                            variant="edit"
                            href={`/admin/jugadores/editar/${j._id}`}
                          >
                            Editar
                          </ActionLink>

                          <ActionButton
                            variant="warning"
                            onClick={() => toggleEstado(j)}
                          >
                            {j.activo ? "Dar de baja" : "Dar de alta"}
                          </ActionButton>

                          <ActionButton
                            variant="danger"
                            onClick={() => eliminarJugador(j)}
                          >
                            Eliminar
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {jugadoresFiltrados.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  {jugadores.length === 0
                    ? "No hay jugadores cargados."
                    : "No hay jugadores que coincidan con el filtro/búsqueda."}
                </div>
              ) : (
                jugadoresFiltrados.map((j) => (
                  <div key={j._id} className="p-4">
                    <div className="font-semibold text-[#A50343] text-lg">
                      {j.userId.apellido}, {j.userId.nombre}
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      DNI: {j.userId.dni}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tel: {j.userId.telefono}
                    </div>
                    <div className="text-sm text-gray-600">
                      Categoría: {j.categoria}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <ActionLink
                        variant="edit"
                        href={`/admin/jugadores/editar/${j._id}`}
                      >
                        Editar
                      </ActionLink>

                      <ActionButton
                        variant="warning"
                        onClick={() => toggleEstado(j)}
                      >
                        {j.activo ? "Dar de baja" : "Dar de alta"}
                      </ActionButton>

                      <ActionButton
                        variant="danger"
                        onClick={() => eliminarJugador(j)}
                      >
                        Eliminar
                      </ActionButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
