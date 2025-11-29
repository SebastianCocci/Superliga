import { InfoRow } from "./info-row"

type LeagueInfo = {
  category: string
  position: string
}

type LeagueInfoSectionProps = {
  info?: LeagueInfo
}

export function LeagueInfoSection({
  info = {
    category: "Categoría A",
    position: "3°",
  },
}: LeagueInfoSectionProps) {
  return (
    <section className="bg-gray-50 rounded-2xl p-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Mi Liga</h3>
      <div className="space-y-4">
        <InfoRow label="Categoría" value={info.category} />
        <InfoRow label="Posición Actual" value={info.position} isHighlight noBorder />
      </div>
    </section>
  )
}
