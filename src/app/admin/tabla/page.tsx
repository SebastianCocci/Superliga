"use client";

import { useEffect, useState } from "react";
import TablaPosiciones, {
  type Categoria,
  type TablaItem,
} from "@/components/TablaPosiciones";

type CategoriaConfig = {
  categoria: Categoria;
  ascensos: number;
  descensos: number;
};

export default function TablaAdminPage() {
  const [categoria, setCategoria] = useState<Categoria>("D");
  const [tabla, setTabla] = useState<TablaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [ascensos, setAscensos] = useState<number>(0);
  const [descensos, setDescensos] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [tablaRes, configRes] = await Promise.all([
          fetch(`/api/tabla?categoria=${encodeURIComponent(categoria)}`),
          fetch(`/api/config/categorias?categoria=${encodeURIComponent(categoria)}`),
        ]);

        if (!tablaRes.ok) {
          throw new Error("No se pudo obtener la tabla de posiciones");
        }

        const tablaData: TablaItem[] = await tablaRes.json();
        setTabla(tablaData);

        // Config no debería bloquear la tabla: si falla, dejamos 0/0
        if (configRes.ok) {
          const cfg: CategoriaConfig = await configRes.json();
          setAscensos(Number.isFinite(cfg.ascensos) ? cfg.ascensos : 0);
          setDescensos(Number.isFinite(cfg.descensos) ? cfg.descensos : 0);
        } else {
          setAscensos(0);
          setDescensos(0);
        }
      } catch (error) {
        console.error("Error cargando tabla/config:", error);
        setErrorMsg("Hubo un problema al cargar la tabla de posiciones.");
        setTabla([]);
        setAscensos(0);
        setDescensos(0);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoria]);

  return (
    <TablaPosiciones
      title="Tabla de Posiciones"
      categoria={categoria}
      onCategoriaChange={setCategoria}
      tabla={tabla}
      loading={loading}
      errorMsg={errorMsg}
      emptyText="No hay resultados aprobados para esta categoría."
      ascensos={ascensos}
      descensos={descensos}
      showLegend
    />
  );
}
