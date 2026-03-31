type InfoRowProps = {
  label: string
  value: string
  isHighlight?: boolean
  noBorder?: boolean
}

export function InfoRow({
  label,
  value,
  isHighlight = false,
  noBorder = false,
}: InfoRowProps) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-3 py-3",
        !noBorder ? "border-b border-gray-200" : "",
      ].join(" ")}
    >
      <span className="text-sm sm:text-base text-gray-600 shrink-0">
        {label}
      </span>

      {isHighlight ? (
        <span className="text-xl sm:text-2xl font-bold px-3 sm:px-4 py-1 rounded-lg text-white bg-[#A50343] text-right whitespace-nowrap">
          {value}
        </span>
      ) : (
        <span className="text-sm sm:text-base font-semibold text-gray-900 text-right break-words">
          {value}
        </span>
      )}
    </div>
  )
}
