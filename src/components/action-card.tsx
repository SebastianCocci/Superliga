"use client"

type IconType = "trophy" | "plus" | "list" | "user"

type ActionCardProps = {
  title: string
  backgroundColor: string
  icon: IconType
  onClick?: () => void
  className?: string
}

export function ActionCard({ title, backgroundColor, icon, onClick, className = "" }: ActionCardProps) {

  const renderIcon = () => {
    switch (icon) {
      case "trophy": return <TrophyIcon />
      case "plus": return <PlusIcon />
      case "list": return <ListIcon />
      case "user": return <UserIcon />
      default: return null
    }
  }

  return (
    <button
      className={`group p-8 rounded-2xl transition-all hover:scale-105 hover:shadow-lg ${className}`}
      style={{ backgroundColor }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon Container */}
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          {renderIcon()}
        </div>

        <span className="text-xl font-semibold text-white">{title}</span>
      </div>
    </button>
  )
}

// Icon Components
export function TrophyIcon() {
  return (
    <div className="relative">
      <div className="w-8 h-10 border-4 border-white rounded-b-lg"></div>
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 border-4 border-white border-b-0 rounded-t-full"></div>
    </div>
  )
}

export function PlusIcon() {
  return (
    <div className="relative">
      <div className="w-8 h-1 bg-white"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white"></div>
    </div>
  )
}

export function ListIcon() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="w-8 h-1 bg-white rounded"></div>
      <div className="w-8 h-1 bg-white rounded"></div>
      <div className="w-8 h-1 bg-white rounded"></div>
    </div>
  )
}

export function UserIcon() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-6 h-6 rounded-full border-4 border-white"></div>
      <div className="mt-1 w-10 h-6 border-4 border-white border-t-0 rounded-b-full"></div>
    </div>
  )
}
