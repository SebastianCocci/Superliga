import Link from "next/link";

export default function EditarJugadorPage({ params }: { params: { id: string } }) {
  const jugador = {
    nombre: "Jugador Ejemplo",
    categoria: "A",
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#A50343" }}>
          Editar Jugador #{params.id}
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            defaultValue={jugador.nombre}
            className="w-full border rounded-lg px-4 py-2"
          />

          <select
            defaultValue={jugador.categoria}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="A">Categoría A</option>
            <option value="B">Categoría B</option>
            <option value="C">Categoría C</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 mt-4 text-white font-bold rounded-lg"
            style={{ backgroundColor: "#A50343" }}
          >
            Guardar Cambios
          </button>
        </form>

        <Link href="/admin/jugadores" className="block mt-4 text-gray-500">
          ← Volver
        </Link>
      </div>
    </div>
  );
}
