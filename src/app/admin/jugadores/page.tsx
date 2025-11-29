import Link from "next/link";

export default function JugadoresPage() {
  const jugadores = [
    { id: 1, nombre: "Juan Pérez", categoria: "A" },
    { id: 2, nombre: "Carlos Gómez", categoria: "B" },
    { id: 3, nombre: "Sergio López", categoria: "A" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-6 px-4 border-b bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: "#A50343" }}>
            Jugadores
          </h1>

          <Link
            href="/admin/jugadores/nuevo"
            className="px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: "#A50343" }}
          >
            + Agregar Jugador
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3">Jugador</th>
                <th className="py-3">Categoría</th>
                <th className="py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.map((j) => (
                <tr key={j.id} className="border-b">
                  <td className="py-3">{j.nombre}</td>
                  <td className="py-3">{j.categoria}</td>
                  <td className="py-3 text-sm">
                    <Link
                      href={`/admin/jugadores/editar/${j.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <span className="mx-2">|</span>
                    <button className="text-red-600 hover:underline">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
