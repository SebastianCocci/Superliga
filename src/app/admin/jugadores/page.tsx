"use client";

import { useEffect, useState } from "react";
import { playerService } from "@/app/api/jugadores/services/playerService";
import { useModal } from "@/app/context/ModalContext";

type Jugador = {
  _id: string;
  userId: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    dni: string;
  };
  categoria: string;
  puntos: number;
  activo: boolean;
};

const filtros = ["Todas", "Top 10", "A", "B", "C", "D", "Bajas"];

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [categoria, setCategoria] = useState<string>("Todas");
  const [loading, setLoading] = useState<boolean>(true);

  const { openModal } = useModal();

  /* ===========================================================
      FILTRO DE JUGADORES
  ============================================================ */
  const jugadoresFiltrados = jugadores.filter((j) => {
    if (categoria === "Todas") return j.activo === true;
    if (categoria === "Bajas") return j.activo === false;
    return j.categoria === categoria && j.activo === true;
  });

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
  }, [openModal]);

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
        } catch {
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
        } catch {
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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#A50343]">
          Gestión de Jugadores
        </h1>

        <a
          href="/admin/jugadores/nuevo"
          className="mt-4 md:mt-0 px-5 py-3 bg-[#A50343] hover:bg-[#8A0336]
          text-white rounded-lg font-medium text-sm shadow-sm transition"
        >
          + Agregar Jugador
        </a>
      </div>

      {/* FILTRO */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por categoría
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full md:w-60 px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-[#A50343] bg-white"
        >
          {filtros.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* TABLA DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">DNI</th>
                    <th className="px-4 py-3 text-left">Teléfono</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {jugadoresFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No hay jugadores en esta categoría.
                      </td>
                    </tr>
                  ) : (
                    jugadoresFiltrados.map((j) => (
                      <tr key={j._id} className="border-b last:border-none">
                        <td className="px-4 py-3">
                          {j.userId.apellido}, {j.userId.nombre}
                        </td>

                        <td className="px-4 py-3">{j.userId.dni}</td>
                        <td className="px-4 py-3">{j.userId.telefono}</td>
                        <td className="px-4 py-3">{j.categoria}</td>

                        <td className="px-4 py-3 flex gap-3 flex-wrap items-center">
                          {/* EDITAR */}
                          <a
                            href={`/admin/jugadores/editar/${j._id}`}
                            className="px-3 py-2 bg-[#8AC2EB] hover:bg-[#7AB3D9]
                            text-white rounded-lg text-xs font-medium"
                          >
                            Editar
                          </a>

                          {/* BAJA / ALTA */}
                          <button
                            onClick={() => toggleEstado(j)}
                            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600
                            text-white rounded-lg text-xs font-medium"
                          >
                            {j.activo ? "Dar de baja" : "Dar de alta"}
                          </button>

                          {/* ELIMINAR */}
                          <button
                            onClick={() => eliminarJugador(j)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700
                            text-white rounded-lg text-xs font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* LISTA MOBILE */}
            <div className="md:hidden divide-y divide-gray-200">
              {jugadoresFiltrados.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  No hay jugadores en esta categoría.
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
                      {/* Editar */}
                      <a
                        href={`/admin/jugadores/editar/${j._id}`}
                        className="px-3 py-2 bg-[#8AC2EB] hover:bg-[#7AB3D9]
                        text-white rounded-lg text-xs font-medium"
                      >
                        Editar
                      </a>

                      {/* Baja / Alta */}
                      <button
                        onClick={() => toggleEstado(j)}
                        className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600
                        text-white rounded-lg text-xs font-medium"
                      >
                        {j.activo ? "Dar de baja" : "Dar de alta"}
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => eliminarJugador(j)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700
                        text-white rounded-lg text-xs font-medium"
                      >
                        Eliminar
                      </button>
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
