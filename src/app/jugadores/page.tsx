"use client";

import { useRouter } from "next/navigation";
import { HeroSection } from "@/app/components/hero-section";
import { ActionCard } from "@/app/components/action-card";
import { LeagueInfoSection } from "@/app/components/league-info-section";

export default function AdminHomePage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <HeroSection />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Ver Partidos"
          backgroundColor="#A50343"
          icon="trophy"
          onClick={() => router.push("/jugadores/partidos")}
        />

        <ActionCard
          title="Cargar Resultado"
          backgroundColor="#8AC2EB"
          icon="plus"
          // Más adelante: /jugadores/cargar-resultado
          onClick={() => router.push("/jugadores/partidos")}
        />

        <ActionCard
          title="Tabla de Posiciones"
          backgroundColor="#A50343"
          icon="list"
          className="md:col-span-2 lg:col-span-1"
          // Más adelante: /jugadores/tabla
          onClick={() => router.push("/jugadores/partidos")}
        />
      </section>

      <LeagueInfoSection role={"jugador"} />
    </div>
  );
}
