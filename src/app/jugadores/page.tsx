"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/hero-section";
import { ActionCard } from "@/components/action-card";
import { LeagueInfoSection } from "@/components/league-info-section";

type LeagueInfo = {
  category: string;
  position: string;
  points?: string;
  nextMatch?: string;
};

type ResumenJugadorResponse = {
  categoryLabel: string;
  positionLabel: string;
  pointsLabel: string;
  nextMatchLabel: string;
};

export default function JugadorHomePage() {
  const router = useRouter();

  const [info, setInfo] = useState<LeagueInfo>({
    category: "—",
    position: "—",
    points: "—",
    nextMatch: "—",
  });

  const [loadingResumen, setLoadingResumen] = useState<boolean>(true);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResumen() {
      try {
        setLoadingResumen(true);
        setErrorResumen(null);

        const res = await fetch("/api/jugadores/resumen", {
          signal: controller.signal,
          cache: "no-store",
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login?next=/jugadores");
          return;
        }

        if (res.status === 403) {
          setErrorResumen("No tenés permisos para ver esta sección.");
          return;
        }

        if (!res.ok) {
          throw new Error("No se pudo obtener el resumen del jugador.");
        }

        const data: ResumenJugadorResponse = await res.json();

        setInfo({
          category: data.categoryLabel,
          position: data.positionLabel,
          points: data.pointsLabel,
          nextMatch: data.nextMatchLabel,
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(err);
        setErrorResumen("Hubo un problema al cargar el resumen.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingResumen(false);
        }
      }
    }

    fetchResumen();

    return () => controller.abort();
  }, [router]);

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-12">
      <HeroSection />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Ver Partidos"
          backgroundColor="#A50343"
          icon="trophy"
          onClick={() => router.push("/jugadores/resultados")}
        />

        <ActionCard
          title="Cargar Resultado"
          backgroundColor="#8AC2EB"
          icon="plus"
          onClick={() => router.push("/jugadores/partidos")}
        />

        <ActionCard
          title="Tabla de Posiciones"
          backgroundColor="#A50343"
          icon="list"
          className="md:col-span-2 lg:col-span-1"
          onClick={() => router.push("/jugadores/tabla")}
        />
      </section>

      {errorResumen ? <p className="text-sm text-red-600">{errorResumen}</p> : null}

      <LeagueInfoSection role={"jugador"} info={info} />

      {loadingResumen ? (
        <div className="flex justify-center -mt-6">
          <div className="animate-spin h-6 w-6 border-2 border-[#A50343] border-t-transparent rounded-full" />
        </div>
      ) : null}
    </div>
  );
}
