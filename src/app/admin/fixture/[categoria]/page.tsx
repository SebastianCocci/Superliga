"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Partido = {
  _id: string;
  jugador1: {
    userId: {
      nombre: string;
      apellido: string;
    };
  };
  jugador2: {
    userId: {
      nombre: string;
      apellido: string;
    };
  };
  estado: "sin_cargar" | "pendiente" | "aprobado" | "rechazado";
};

type FechaFixture = {
  fechaNumero: number;
  partidos: Partido[];
};

export default function FixtureCategoriaPage() {
  const { categoria } = useParams();
  const [fixture, setFixture] = useState<FechaFixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFixture() {
      try {
        const res = await fetch(`/api/fixture/${categoria}`);
        const data = await res.json();

        // Si la API devuelve un objeto → lo convertimos a array
        if (!Array.isArray(data)) {
          const arrayFixture = Object.entries(data).map(
            ([fechaNumero, partidos]) => ({
              fechaNumero: Number(fechaNumero),
              partidos: partidos as Partido[],
            })
          );

          setFixture(arrayFixture);
        } else {
          setFixture(data);
        }
      } catch (error) {
        console.error("Error obteniendo fixture:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFixture();
  }, [categoria]);

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#A50343] mb-8">
        Fixture – Categoría {categoria}
      </h1>

      {fixture.length === 0 && (
        <p className="text-gray-600 text-center">
          No hay fixture generado para esta categoría.
        </p>
      )}

      <div className="space-y-8">
        {fixture.map((fecha) => (
          <div key={fecha.fechaNumero} className="border rounded-xl bg-white shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-100 rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-800">
                Fecha {fecha.fechaNumero}
              </h2>
            </div>

            <ul className="divide-y">
              {fecha.partidos.map((p) => (
                <li
                  key={p._id}
                  className="p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="text-gray-700 text-sm">
                    <strong>
                      {p.jugador1.userId.apellido}, {p.jugador1.userId.nombre}
                    </strong>{" "}
                    vs{" "}
                    <strong>
                      {p.jugador2.userId.apellido}, {p.jugador2.userId.nombre}
                    </strong>
                  </div>

                  <span
                    className={`mt-2 md:mt-0 px-3 py-1 rounded-lg text-xs font-semibold
                      ${p.estado === "sin_cargar" ? "bg-gray-300 text-gray-700" : ""}
                      ${p.estado === "pendiente" ? "bg-yellow-300 text-yellow-900" : ""}
                      ${p.estado === "aprobado" ? "bg-green-300 text-green-900" : ""}
                      ${p.estado === "rechazado" ? "bg-red-300 text-red-900" : ""}
                    `}
                  >
                    {p.estado === "sin_cargar" && "Sin cargar"}
                    {p.estado === "pendiente" && "Pendiente de aprobación"}
                    {p.estado === "aprobado" && "Aprobado"}
                    {p.estado === "rechazado" && "Rechazado"}
                  </span>

                  <a
                    href={`/admin/resultados/${p._id}`}
                    className="mt-3 md:mt-0 bg-[#A50343] hover:bg-[#8A0336] text-white text-xs px-4 py-2 rounded-lg"
                  >
                    Ver / Editar
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
