"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";
import Link from "next/link";

/* ===========================================================
   TIPOS
=========================================================== */
type PlayerInfo = {
  _id: string;
  userId: {
    nombre: string;
    apellido: string;
  };
};

type Partido = {
  _id: string;
  fechaNumero: number;
  jugador1: PlayerInfo;
  jugador2: PlayerInfo;
  estado: "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
  tipoResultado?: "normal" | "wo" | "doble_wo";
  sets?: string;
  ganador?: string | null;
};

export default function ResultadoPartidoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { openModal } = useModal();

  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);

  // FORM FIELDS
  const [ganador, setGanador] = useState<string | null>(null);
  const [tipoResultado, setTipoResultado] = useState<
    "normal" | "wo" | "doble_wo"
  >("normal");
  const [sets, setSets] = useState("");

  /* ===========================================================
     FETCH PARTIDO
  ============================================================ */
  useEffect(() => {
    async function fetchPartido() {
      try {
        const res = await fetch(`/api/resultados/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el partido");

        const data: Partido = await res.json();
        setPartido(data);

        // Precargar valores si existen
        setTipoResultado(data.tipoResultado ?? "normal");
        setGanador(data.ganador ?? null);
        setSets(data.sets ?? "");
      } catch (error) {
        console.error("Error cargando partido:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPartido();
  }, [id]);

  /* ===========================================================
      REGLAS AL CAMBIAR TIPO DE RESULTADO
  ============================================================ */
  useEffect(() => {
    if (tipoResultado === "doble_wo") {
      setGanador(null);
      setSets("");
    }
    if (tipoResultado === "wo") {
      setSets("");
    }
  }, [tipoResultado]);

  /* ===========================================================
      HANDLER GUARDAR
  ============================================================ */
  async function guardarCambios() {
    if (!partido) return;

    // Validación: Partido normal necesita sets y ganador
    if (tipoResultado === "normal" && (!sets.trim() || !ganador)) {
      return openModal({
        title: "Error",
        message: "Debe ingresar sets y seleccionar un ganador.",
        confirmText: "Cerrar",
      });
    }

    // Validación: WO necesita ganador
    if (tipoResultado === "wo" && !ganador) {
      return openModal({
        title: "Error",
        message: "Debe seleccionar quién gana por WO.",
        confirmText: "Cerrar",
      });
    }

    try {
      const res = await fetch(`/api/resultados/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoResultado,
          ganador: tipoResultado === "doble_wo" ? null : ganador,
          sets: tipoResultado === "normal" ? sets : undefined,
        }),
      });

      if (!res.ok) throw new Error("No se pudo guardar");

      openModal({
        title: "Guardado",
        message: "El resultado fue actualizado correctamente.",
        confirmText: "Aceptar",
        onConfirm: () => router.push("/admin/resultados/pendientes"),
      });
    } catch {
      openModal({
        title: "Error",
        message: "Hubo un problema al guardar los cambios.",
        confirmText: "Cerrar",
      });
    }

}

/* ===========================================================
    UI
============================================================ */

if (loading) {
  return (
    <div className="py-10 flex justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
    </div>
  );
}

if (!partido) {
  return <p className="text-center py-10">Partido no encontrado.</p>;
}

const { jugador1, jugador2 } = partido;

return (
  <div className="max-w-3xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold text-[#A50343] mb-8">
      Editar Resultado
    </h1>

    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-8">
      {/* Jugadores */}
      <div className="space-y-2">
        <p className="text-gray-700">
          <strong>Jugador 1:</strong> {jugador1.userId.apellido},{" "}
          {jugador1.userId.nombre}
        </p>
        <p className="text-gray-700">
          <strong>Jugador 2:</strong> {jugador2.userId.apellido},{" "}
          {jugador2.userId.nombre}
        </p>
      </div>

      {/* Ganador */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ganador
        </label>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ganador"
              value={jugador1._id}
              disabled={tipoResultado === "doble_wo"}
              checked={ganador === jugador1._id}
              onChange={() => setGanador(jugador1._id)}
            />
            {jugador1.userId.apellido}, {jugador1.userId.nombre}
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ganador"
              value={jugador2._id}
              disabled={tipoResultado === "doble_wo"}
              checked={ganador === jugador2._id}
              onChange={() => setGanador(jugador2._id)}
            />
            {jugador2.userId.apellido}, {jugador2.userId.nombre}
          </label>
        </div>
      </div>

      {/* Tipo de Resultado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Resultado
        </label>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="normal"
              checked={tipoResultado === "normal"}
              onChange={() => setTipoResultado("normal")}
            />
            Partido
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="wo"
              checked={tipoResultado === "wo"}
              onChange={() => setTipoResultado("wo")}
            />
            WO (Walkover)
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="doble_wo"
              checked={tipoResultado === "doble_wo"}
              onChange={() => setTipoResultado("doble_wo")}
            />
            Doble WO
          </label>
        </div>
      </div>

      {/* Sets */}
      {tipoResultado === "normal" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sets (ej: 6/3-2/6-6/4)
          </label>
          <input
            type="text"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="6/3-2/6-6/4"
          />
        </div>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href="/admin/resultados/pendientes"
          className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium"
        >
          Cancelar
        </Link>

        <button
          onClick={guardarCambios}
          className="px-6 py-3 bg-[#A50343] text-white rounded-lg font-medium hover:bg-[#8A0336]"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
);
}
