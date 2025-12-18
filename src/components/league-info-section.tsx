import { InfoRow } from "./info-row"

type LeagueInfo = {
  category: string
  position: string
  points?: string
  nextMatch?: string
}

type LeagueInfoSectionProps = {
  role: "admin" | "jugador"
  info?: LeagueInfo
}

export function LeagueInfoSection({ role, info }: LeagueInfoSectionProps) {
  // Datos por defecto según el rol (mientras no haya login/datos reales)
  const defaultInfo: LeagueInfo =
    role === "jugador"
      ? {
          category: "Categoría A",
          position: "3°",
          points: "—",
          nextMatch: "—",
        }
      : { category: "Panel Administrador", position: "—" }

  const finalInfo = info ?? defaultInfo

  return (
    <section className="bg-gray-50 rounded-2xl p-4 sm:p-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
        {role === "admin" ? "Dashboard Liga" : "Mi Liga"}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        <InfoRow label="Categoría" value={finalInfo.category} />

        <InfoRow
          label={role === "admin" ? "Estado General" : "Posición Actual"}
          value={finalInfo.position}
          isHighlight
          noBorder={role === "admin" && !finalInfo.points && !finalInfo.nextMatch}
        />

        {role === "jugador" && (
          <>
            <InfoRow
              label="Puntos"
              value={finalInfo.points ?? "—"}
            />

            <InfoRow
              label="Próximo partido"
              value={finalInfo.nextMatch ?? "—"}
              noBorder
            />
          </>
        )}
      </div>
    </section>
  )
}
