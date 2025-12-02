type HeaderProps = {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="py-4 px-4 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center">
        {/* Espacio para que el botón hamburguesa no tape el título en mobile */}
        <div className="w-12 lg:w-0" />

        <h1 className="text-2xl font-bold text-center flex-1 text-[#A50343]">
          {title}
        </h1>
      </div>
    </header>
  )
}

