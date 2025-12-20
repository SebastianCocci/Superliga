"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  pos: number;
  playerId: string;
  nombreOrden: string;
  puntos: number;
  ganados: number;
  jugados: number;
  perdidos: number;
};

type Resp = {
  categoria: "Top ten" | "A" | "B" | "C" | "D";
  rows: Row[];
};

type CategoryCfg = {
  categoria: Resp["categoria"];
  ascensos: number;
  descensos: number;
};

export default function TablaPosicionesJugadorPage() {
  const router = useRouter();

  const [data, setData] = useState<Resp | null>(null);
  const [cfg, setCfg] = useState<CategoryCfg | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingCfg, setLoadingCfg] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1) Tabla de mi categoría
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch("/api/tabla/mi-categoria", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace("/login?next=/jugadores/tabla");
          return;
        }

        if (res.status === 403) {
          setErrorMsg("No tenés permisos para ver esta sección.");
          return;
        }

        if (!res.ok) throw new Error("No se pudo cargar la tabla");

        const json: Resp = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setErrorMsg("Hubo un problema al cargar la tabla.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  // 2) Config de ascensos/descensos según la categoría real
  useEffect(() => {
    const categoria = data?.categoria;
    if (!categoria) return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoadingCfg(true);
        setCfg(null); // evita reglas viejas si cambia la categoría

        const res = await fetch(
          `/api/config/categorias?categoria=${encodeURIComponent(categoria)}`,
          {
            signal: controller.signal,
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error("No se pudo cargar la configuración");

        const json = (await res.json()) as CategoryCfg;
        setCfg(json);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        console.error("Error cargando config de categoría:", err);

        // Fallback seguro: sin ascensos/descensos
        if (!controller.signal.aborted) {
          setCfg({ categoria, ascensos: 0, descensos: 0 });
        }
      } finally {
        if (!controller.signal.aborted) setLoadingCfg(false);
      }
    })();

    return () => controller.abort();
  }, [data?.categoria]);

  const estilos = useMemo(() => {
    const ascensos = Math.max(0, cfg?.ascensos ?? 0);
    const descensos = Math.max(0, cfg?.descensos ?? 0);
    const total = data?.rows.length ?? 0;

    const ascensoHasta = ascensos; // posiciones 1..ascensos
    const descensoDesde = total - descensos + 1; // posiciones descensoDesde..total

    return { ascensos, descensos, total, ascensoHasta, descensoDesde };
  }, [cfg?.ascensos, cfg?.descensos, data?.rows.length]);

  function rowClass(pos: number) {
    if (!data || !cfg || estilos.total === 0) return "bg-white hover:bg-gray-50";

    if (estilos.ascensos > 0 && pos <= estilos.ascensoHasta) {
      return "bg-green-50 hover:bg-green-100";
    }

    if (estilos.descensos > 0 && pos >= estilos.descensoDesde) {
      return "bg-red-50 hover:bg-red-100";
    }

    return "bg-white hover:bg-gray-50";
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
      <h1 className="text-3xl font-bold text-[#A50343] mb-2">
        Tabla de Posiciones{data ? ` – Categoría ${data.categoria}` : ""}
      </h1>
      <p className="text-gray-600 mb-6">
        Posiciones calculadas con partidos aprobados.
      </p>

      {errorMsg ? <p className="mb-4 text-sm text-red-600">{errorMsg}</p> : null}

      {!data || data.rows.length === 0 ? (
        <p className="text-gray-600">No hay datos para mostrar.</p>
      ) : (
        <>
          {/* Leyenda */}
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-700">
            {cfg && cfg.ascensos > 0 ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-green-50">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                Ascenso: {cfg.ascensos}
              </span>
            ) : null}

            {cfg && cfg.descensos > 0 ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-red-50">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                Descenso: {cfg.descensos}
              </span>
            ) : null}

            {loadingCfg ? <span className="text-gray-500">Cargando reglas…</span> : null}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#A50343] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Pos.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Jugador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      PJ
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      PG
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      PP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {data.rows.map((r) => (
                    <tr
                      key={r.playerId}
                      className={`${rowClass(r.pos)} transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {r.pos}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {r.nombreOrden || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {r.jugados}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-700">
                        {r.ganados}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-700">
                        {r.perdidos}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {r.puntos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
