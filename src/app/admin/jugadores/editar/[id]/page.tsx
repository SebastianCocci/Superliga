"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";
import {
  playerService,
  PlayerUpdateData,
} from "@/app/api/jugadores/services/playerService";
import { ActionButton, ActionLink } from "@/components/ActionButtons";

type JugadorData = {
  _id: string;
  userId: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    email: string;
  };
  categoria: string;
  puntos: number;
};

export default function EditarJugadorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { openModal } = useModal();

  const [jugador, setJugador] = useState<JugadorData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===========================================================
     CARGAR JUGADOR
  ============================================================ */
  useEffect(() => {
    async function fetchJugador() {
      try {
        const res = await fetch(`/api/jugadores/${id}`);
        const data = await res.json();
        setJugador(data);
      } catch (error) {
        console.error("Error obteniendo jugador:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJugador();
  }, [id]);

  /* ===========================================================
      SPINNERS Y VALIDACIONES
  ============================================================ */
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!jugador) {
    return (
      <p className="text-center py-10 text-gray-500">Jugador no encontrado</p>
    );
  }

  if (!jugador.userId) {
    return (
      <p className="text-center py-10 text-gray-500">
        Datos del usuario no disponibles
      </p>
    );
  }

  /* ===========================================================
      GUARDAR CAMBIOS
  ============================================================ */
  async function guardarCambios() {
    if (!jugador) return;

    const updatePayload: PlayerUpdateData = {
      nombre: jugador.userId.nombre,
      apellido: jugador.userId.apellido,
      dni: jugador.userId.dni,
      telefono: jugador.userId.telefono,
      categoria: jugador.categoria,
    };

    try {
      await playerService.update(id as string, updatePayload);

      openModal({
        title: "Cambios guardados",
        message: "El jugador se actualizó correctamente.",
        confirmText: "Aceptar",
        onConfirm: () => router.push("/admin/jugadores"),
      });
    } catch (error) {
      console.error(error);

      openModal({
        title: "Error",
        message: "No se pudieron guardar los cambios.",
        confirmText: "Cerrar",
      });
    }
  }

  /* ===========================================================
      UI
  ============================================================ */
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-8">Editar Jugador</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {/* DATOS SUPERIORES */}
        <p className="text-gray-700">
          <strong>Nombre:</strong> {jugador.userId.nombre}{" "}
          {jugador.userId.apellido}
        </p>

        <p className="text-gray-700">
          <strong>DNI:</strong> {jugador.userId.dni}
        </p>
        <p className="text-gray-700">
          <strong>Teléfono:</strong> {jugador.userId.telefono}
        </p>
        <p className="text-gray-700">
          <strong>Categoría actual:</strong> {jugador.categoria}
        </p>

        {/* FORMULARIO */}
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();

            openModal({
              title: "Guardar cambios",
              message: "¿Confirmás actualizar los datos del jugador?",
              confirmText: "Guardar",
              cancelText: "Cancelar",
              onConfirm: guardarCambios,
            });
          }}
        >
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={jugador.userId.nombre}
              onChange={(e) =>
                setJugador({
                  ...jugador,
                  userId: { ...jugador.userId, nombre: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              required
              autoComplete="given-name"
              enterKeyHint="next"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={jugador.userId.apellido}
              onChange={(e) =>
                setJugador({
                  ...jugador,
                  userId: { ...jugador.userId, apellido: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              required
              autoComplete="family-name"
              enterKeyHint="next"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={jugador.userId.telefono}
              onChange={(e) =>
                setJugador({
                  ...jugador,
                  userId: { ...jugador.userId, telefono: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              required
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
            />
          </div>

          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DNI
            </label>
            <input
              type="text"
              value={jugador.userId.dni}
              onChange={(e) =>
                setJugador({
                  ...jugador,
                  userId: { ...jugador.userId, dni: e.target.value },
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              required
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="next"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={jugador.categoria}
              onChange={(e) =>
                setJugador({ ...jugador, categoria: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343] bg-white"
            >
              <option value="Top ten">Top ten</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4 flex-wrap">
            <ActionLink
              variant="neutral"
              href="/admin/jugadores"
              className="px-6 py-3"
            >
              Cancelar
            </ActionLink>

            <ActionButton
              variant="primary"
              type="submit"
              onClick={() => {}}
              className="px-6 py-3"
            >
              Guardar Cambios
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
