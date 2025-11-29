import Link from "next/link";

export default function NuevoJugadorPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#A50343" }}>
          Agregar Jugador
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del jugador"
            className="w-full border rounded-lg px-4 py-2"
          />

          <select className="w-full border rounded-lg px-4 py-2">
            <option value="">Seleccionar categoría</option>
            <option value="A">Categoría A</option>
            <option value="B">Categoría B</option>
            <option value="C">Categoría C</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 mt-4 text-white font-bold rounded-lg"
            style={{ backgroundColor: "#A50343" }}
          >
            Guardar
          </button>
        </form>

        <Link href="/admin/jugadores" className="block mt-4 text-gray-500">
          ← Volver
        </Link>
      </div>
    </div>
  );
}
