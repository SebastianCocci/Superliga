import { Header } from "../components/header"
import { HeroSection } from "../components/hero-section"
import { ActionCard } from "../components/action-card"
import { LeagueInfoSection } from "../components/league-info-section"
import { Footer } from "../components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <HeroSection />

        {/* Main Action Cards */}
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

        <LeagueInfoSection />
      </main>

      <Footer />
    </div>
  )
}
