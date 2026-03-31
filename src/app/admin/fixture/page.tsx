"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal } from "@/app/context/ModalContext";
import { CalendarIcon, RefreshCcw, EyeIcon } from "lucide-react";

type Categoria = "Top ten" | "A" | "B" | "C" | "D";

export default function FixtureAdminPage() {
  const { openModal } = useModal();

  const [categoria, setCategoria] = useState<Categoria>("Top ten");
  const [fixtureExiste, setFixtureExiste] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  /* ===========================================================
      CHECK SI LA CATEGORÍA YA TIENE FIXTURE
  ============================================================ */
  const verificarFixture = useCallback(async () => {
    try {
      const res = await fetch(`/api/fixture/existe?categoria=${categoria}`);
      const data = await res.json();
      setFixtureExiste(Boolean(data.existe));
    } catch (error) {
      console.error("Error verificando fixture:", error);
    }
  }, [categoria]);

  useEffect(() => {
    verificarFixture();
  }, [verificarFixture]);

  /* ===========================================================
      GENERAR FIXTURE
  ============================================================ */
  async function generar() {
    setLoading(true);
    try {
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria }),
      });

      if (!res.ok) throw new Error("Error generando fixture");

      openModal({
        title: "Fixture generado",
        message: `El fixture de la categoría ${categoria} fue creado correctamente.`,
        confirmText: "Aceptar",
        onConfirm: verificarFixture,
      });
    } catch (error) {
      console.error("Error generando fixture:", error);

      openModal({
        title: "Error",
        message: "No se pudo generar el fixture.",
        confirmText: "Cerrar",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ===========================================================
     HANDLER PARA CONFIRMAR GENERACIÓN / REGENERACIÓN
  ============================================================ */
  function confirmarGeneracion() {
    openModal({
      title: fixtureExiste ? "Regenerar Fixture" : "Generar Fixture",
      message: fixtureExiste
        ? `Ya existe un fixture para la categoría ${categoria}. ¿Querés regenerarlo? Esto eliminará los partidos actuales.`
        : `¿Confirmás generar el fixture para la categoría ${categoria}?`,
      confirmText: fixtureExiste ? "Regenerar" : "Generar",
      cancelText: "Cancelar",
      onConfirm: generar,
    });
  }

  /* ===========================================================
      VER FIXTURE (SERÁ OTRA PAGE)
  ============================================================ */
  function verFixture() {
    window.location.href = `/admin/fixture/${encodeURIComponent(categoria)}`;
  }

  /* ===========================================================
      UI
  ============================================================ */
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-10">
        Administrar Fixture
      </h1>

      {/* SELECT CATEGORÍA */}
      <div className="mb-8">
        <label className="block mb-2 text-gray-700 font-medium">
          Seleccionar categoría
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Categoria)}
          className="px-4 py-3 border rounded-lg w-full md:w-64 bg-white focus:ring-2 focus:ring-[#A50343]"
        >
          <option value="Top ten">Top Ten</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>

      {/* TARJETAS */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* GENERAR / REGENERAR (misma acción, cambia texto del modal) */}
        <button
          disabled={loading}
          onClick={confirmarGeneracion}
          className="bg-[#A50343] text-white rounded-xl p-8 shadow hover:bg-[#8A0336] transition flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CalendarIcon className="w-10 h-10 mb-3" />
          <span className="text-lg font-semibold">
            {fixtureExiste ? "Regenerar Fixture" : "Generar Fixture"}
          </span>
        </button>

        {/* REGENERAR explícito (si querés mantenerlo diferenciado visualmente) */}
        <button
          disabled={loading || !fixtureExiste}
          onClick={confirmarGeneracion}
          className={`rounded-xl p-8 shadow flex flex-col items-center justify-center transition 
            ${
              fixtureExiste
                ? "bg-[#8AC2EB] hover:bg-[#7AB3D9] text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          <RefreshCcw className="w-10 h-10 mb-3" />
          <span className="text-lg font-semibold">Regenerar Fixture</span>
        </button>

        {/* VER FIXTURE */}
        <button
          disabled={!fixtureExiste}
          onClick={verFixture}
          className={`rounded-xl p-8 shadow flex flex-col items-center justify-center transition
            ${
              fixtureExiste
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          <EyeIcon className="w-10 h-10 mb-3" />
          <span className="text-lg font-semibold">Ver Fixture</span>
        </button>
      </div>

      {/* Loader opcional */}
      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
