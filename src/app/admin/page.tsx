"use client";

import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/hero-section";
import { ActionCard } from "@/components/action-card";
import { LeagueInfoSection } from "@/components/league-info-section";

export default function AdminHomePage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-12">
      <HeroSection />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Ver Fechas"
          backgroundColor="#A50343"
          icon="trophy"
          onClick={() => router.push("/admin/fixture")}
        />

        <ActionCard
          title="Aprobar Resultado"
          backgroundColor="#8AC2EB"
          icon="plus"
          onClick={() => router.push("/admin/resultados/pendientes")}
        />

        <ActionCard
          title="Tabla de Posiciones"
          backgroundColor="#A50343"
          icon="list"
          className="md:col-span-2 lg:col-span-1"
          onClick={() => router.push("/admin/tabla")}
        />
      </section>

      <LeagueInfoSection role={"admin"} />
    </div>
  );
}
