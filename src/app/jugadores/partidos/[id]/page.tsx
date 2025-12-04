"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";

type PlayerInfo = {
  _id: string;
  userId: {
    nombre: string;
    apellido: string;
  };
};

type EstadoResultado = "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
type TipoResultado = "normal" | "wo" | "doble_wo";

type Partido = {
  _id: string;
  fechaNumero: number;
  categoria: "Top ten" | "A" | "B" | "C" | "D";
  estado: EstadoResultado;
  tipoResultado?: TipoResultado;
  sets?: string;
  ganador?: string;
  jugador1: PlayerInfo;
  jugador2: PlayerInfo;
};

export default function CargarResultadoJugadorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openModal } = useModal();

  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);

  const [ganador, setGanador] = useState<string | null>(null);
  const [tipoResultado, setTipoResultado] = useState<TipoResultado>("normal");
  const [sets, setSets] = useState("");

  // Cargar datos del partido
  useEffect(() => {
    async function fetchPartido() {
      try {
        setLoading(true);
        const res = await fetch(`/api/resultados/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el partido");

        const data: Partido = await res.json();
        setPartido(data);

        setTipoResultado((data.tipoResultado as TipoResultado) || "normal");
        setGanador(data.ganador || null);
        setSets(data.sets || "");
      } catch (error) {
        console.error("Error cargando partido:", error);
        openModal({
          title: "Error",
          message: "No se pudo cargar la información del partido.",
          confirmText: "Volver",
          onConfirm: () => router.push("/jugadores/partidos"),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPartido();
  }, [id, openModal, router]);

  // Ajustes automáticos según tipo de resultado
  useEffect(() => {
    if (tipoResultado === "doble_wo") {
      setGanador(null);
      setSets("");
    }
    if (tipoResultado === "wo") {
      setSets("");
    }
  }, [tipoResultado]);

  async function guardar() {
    if (!partido) return;

    // Validaciones mínimas
    if (tipoResultado === "normal" && sets.trim().length === 0) {
      return openModal({
        title: "Falta información",
        message: "Debes ingresar los sets del partido.",
        confirmText: "Cerrar",
      });
    }

    if (tipoResultado !== "doble_wo" && !ganador) {
      return openModal({
        title: "Falta información",
        message: "Debes seleccionar un ganador.",
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
          // En el futuro se puede enviar algo como origen: "jugador"
        }),
      });

      if (!res.ok) throw new Error("No se pudo guardar el resultado");

      openModal({
        title: "Resultado enviado",
        message:
          "Tu resultado fue enviado y quedará pendiente de aprobación del administrador.",
        confirmText: "Aceptar",
        onConfirm: () => router.push("/jugadores/partidos"),
      });
    } catch (error) {
      console.error(error);
      openModal({
        title: "Error",
        message: "Hubo un problema al guardar el resultado.",
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
    return (
      <p className="text-center py-10 text-gray-500">
        Partido no encontrado.
      </p>
    );
  }

  const { jugador1, jugador2 } = partido;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-8">
        Cargar resultado
      </h1>

      <div className="bg-white border rounded-xl shadow-sm p-8 space-y-8">
        {/* Info partido */}
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Categoría:</strong> {partido.categoria}
          </p>
          <p>
            <strong>Fecha:</strong> {partido.fechaNumero}
          </p>
          <p>
            <strong>Jugador 1:</strong> {jugador1.userId.apellido},{" "}
            {jugador1.userId.nombre}
          </p>
          <p>
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

        {/* Tipo de resultado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de resultado
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

        {/* Sets solo si es partido normal */}
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

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => router.push("/jugadores/partidos")}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium"
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            className="px-6 py-3 bg-[#A50343] text-white rounded-lg font-medium hover:bg-[#8A0336]"
          >
            Enviar resultado
          </button>
        </div>
      </div>
    </div>
  );
}
