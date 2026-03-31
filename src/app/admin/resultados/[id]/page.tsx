"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useModal } from "@/app/context/ModalContext";
import { formatSetsInput } from "@/lib/formatSetsInput";

/* ===========================================================
   TIPOS
=========================================================== */
type PlayerInfo = {
  _id: string;
  userId?: {
    nombre?: string;
    apellido?: string;
  };
};

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
type TipoResultado = "normal" | "wo" | "doble_wo";

type Partido = {
  _id: string;
  categoria: "Top ten" | "A" | "B" | "C" | "D";
  fechaNumero: number;
  jugador1?: PlayerInfo;
  jugador2?: PlayerInfo;
  estado: EstadoResultado;
  tipoResultado?: TipoResultado;
  sets?: string;
  ganador?: string | null;
};

export default function ResultadoPartidoAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openModal } = useModal();

  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);

  const [ganador, setGanador] = useState<string | null>(null);
  const [tipoResultado, setTipoResultado] = useState<TipoResultado>("normal");
  const [sets, setSets] = useState("");

  useEffect(() => {
    async function fetchPartido() {
      try {
        const res = await fetch(`/api/resultados/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el partido");

        const raw = await res.json();
        const data: Partido | null = Array.isArray(raw) ? raw[0] ?? null : raw;

        if (!data) {
          setPartido(null);
          return;
        }

        setPartido(data);
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

  useEffect(() => {
    if (tipoResultado === "doble_wo") {
      setGanador(null);
      setSets("");
    }
    if (tipoResultado === "wo") {
      setSets("");
    }
  }, [tipoResultado]);

  async function guardarCambios() {
    if (!partido) return;

    if (tipoResultado === "normal" && (!sets.trim() || !ganador)) {
      return openModal({
        title: "Error",
        message: "Debe ingresar sets y seleccionar un ganador.",
        confirmText: "Cerrar",
      });
    }

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
    } catch (error) {
      console.error(error);
      openModal({
        title: "Error",
        message: "Hubo un problema al guardar los cambios.",
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

  if (!partido) {
    return <p className="text-center py-10">Partido no encontrado.</p>;
  }

  const { categoria, fechaNumero, jugador1, jugador2 } = partido;

  const apellido1 = jugador1?.userId?.apellido ?? "(sin apellido)";
  const nombre1 = jugador1?.userId?.nombre ?? "(sin nombre)";
  const apellido2 = jugador2?.userId?.apellido ?? "(sin apellido)";
  const nombre2 = jugador2?.userId?.nombre ?? "(sin nombre)";

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-8">
        Editar Resultado
      </h1>

      <div className="bg-white border rounded-xl shadow-sm p-8 space-y-8">
        <div className="space-y-1 text-sm text-gray-700">
          <p>
            <strong>Categoría:</strong> {categoria}
          </p>
          <p>
            <strong>Fecha:</strong> {fechaNumero}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700">
            <strong>Jugador 1:</strong> {apellido1}, {nombre1}
          </p>
          <p className="text-gray-700">
            <strong>Jugador 2:</strong> {apellido2}, {nombre2}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ganador
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ganador"
                value={jugador1?._id ?? ""}
                disabled={tipoResultado === "doble_wo"}
                checked={ganador === jugador1?._id}
                onChange={() => jugador1 && setGanador(jugador1._id)}
              />
              {apellido1}, {nombre1}
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ganador"
                value={jugador2?._id ?? ""}
                disabled={tipoResultado === "doble_wo"}
                checked={ganador === jugador2?._id}
                onChange={() => jugador2 && setGanador(jugador2._id)}
              />
              {apellido2}, {nombre2}
            </label>
          </div>
        </div>

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
              Partido jugado
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="wo"
                checked={tipoResultado === "wo"}
                onChange={() => setTipoResultado("wo")}
              />
              Ganador por WO
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="doble_wo"
                checked={tipoResultado === "doble_wo"}
                onChange={() => setTipoResultado("doble_wo")}
              />
              Doble WO (ninguno se presentó)
            </label>
          </div>
        </div>

        {tipoResultado === "normal" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sets (ej: 6/3-2/6-6/4)
            </label>
            <input
              type="text"
              value={sets}
              onChange={(e) => setSets(formatSetsInput(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="6/3-2/6-6/4"
              inputMode="numeric"
              enterKeyHint="done"
              autoComplete="off"
            />
          </div>
        )}

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
