"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/app/context/ModalContext";

type PartidoPendiente = {
  _id: string;
  fechaNumero: number;
  jugador1: { userId: { nombre: string; apellido: string } };
  jugador2: { userId: { nombre: string; apellido: string } };
  sets?: string;
  tipoResultado?: string;
  estado: "pendiente";
};

export default function ResultadosPendientesPage() {
  const [partidos, setPartidos] = useState<PartidoPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    async function fetchPendientes() {
      try {
        const res = await fetch("/api/resultados/pendientes");
        const data = await res.json();
        setPartidos(data);
      } catch {
        console.error("Error cargando pendientes");
      } finally {
        setLoading(false);
      }
    }

    fetchPendientes();
  }, []);

  async function aprobarResultado(id: string) {
    try {
      const res = await fetch(`/api/resultados/${id}/aprobar`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("No se pudo aprobar el resultado");

      // Quitar de la lista local
      setPartidos((prev) => prev.filter((p) => p._id !== id));

      openModal({
        title: "Aprobado",
        message: "El resultado fue aprobado correctamente.",
        confirmText: "Aceptar",
      });
    } catch {
      openModal({
        title: "Error",
        message: "No se pudo aprobar el resultado.",
        confirmText: "Cerrar",
      });
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
      <h1 className="text-3xl font-bold text-[#A50343] mb-8">
        Resultados Pendientes
      </h1>

      {partidos.length === 0 && (
        <p className="text-gray-600 text-center">
          No hay resultados pendientes de aprobación.
        </p>
      )}

      <div className="bg-white border rounded-xl shadow-sm divide-y">
        {partidos.map((p) => (
          <div
            key={p._id}
            className="p-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="text-sm text-gray-700">
              <strong>
                {p.jugador1.userId.apellido}, {p.jugador1.userId.nombre}
              </strong>{" "}
              vs{" "}
              <strong>
                {p.jugador2.userId.apellido}, {p.jugador2.userId.nombre}
              </strong>
            </div>

            <div className="text-xs text-gray-500 mt-1 md:mt-0">
              Fecha: {p.fechaNumero}
            </div>

            <div className="flex gap-3 mt-3 md:mt-0">
              <a
                href={`/admin/resultados/${p._id}`}
                className="px-3 py-2 bg-[#8AC2EB] hover:bg-[#7AB3D9] text-white rounded-lg text-xs"
              >
                Editar
              </a>

              <button
                onClick={() =>
                  openModal({
                    title: "Aprobar resultado",
                    message: "¿Confirmás que este resultado es correcto?",
                    confirmText: "Aprobar",
                    cancelText: "Cancelar",
                    onConfirm: () => aprobarResultado(p._id),
                  })
                }
                className="px-3 py-2 bg-[#A50343] hover:bg-[#8A0336] text-white rounded-lg text-xs"
              >
                Aprobar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
