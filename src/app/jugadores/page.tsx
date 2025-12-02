import { HeroSection } from "@/app/components/hero-section"
import { ActionCard } from "@/app/components/action-card"
import { LeagueInfoSection } from "@/app/components/league-info-section"

export default function AdminHomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">

      <HeroSection />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard title="Ver Resultados" backgroundColor="#A50343" icon="trophy" />
        <ActionCard title="Cargar Resultado" backgroundColor="#8AC2EB" icon="plus" />
        <ActionCard
          title="Tabla de Posiciones"
          backgroundColor="#A50343"
          icon="list"
          className="md:col-span-2 lg:col-span-1"
        />
      </section>

      <LeagueInfoSection role={"jugador"} />
    </div>
  )
}
