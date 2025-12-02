type InfoRowProps = {
  label: string
  value: string
  isHighlight?: boolean
  noBorder?: boolean
}

export function InfoRow({ label, value, isHighlight = false, noBorder = false }: InfoRowProps) {
  return (
    <div className={`flex justify-between items-center py-3 ${!noBorder ? "border-b border-gray-200" : ""}`}>
      <span className="text-gray-600">{label}</span>

      {isHighlight ? (
        <span className="text-2xl font-bold px-4 py-1 rounded-lg text-white bg-[#A50343]">
          {value}
        </span>
      ) : (
        <span className="font-semibold text-gray-900">{value}</span>
      )}
    </div>
  )
}

