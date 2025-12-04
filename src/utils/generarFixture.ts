// src/utils/generarFixture.ts
import { Types } from "mongoose";

export interface PlayerForFixture {
  _id: Types.ObjectId | string;
}

export interface PartidoFixture {
  categoria: string;
  fechaNumero: number;
  jugador1: Types.ObjectId;
  jugador2: Types.ObjectId;
  estado: "sin_cargar";
}

export default function generarFixture(
  jugadores: PlayerForFixture[],
  categoria: string
): PartidoFixture[] {
  const ids = jugadores.map((j) =>
    typeof j._id === "string" ? new Types.ObjectId(j._id) : j._id
  );

  const fixture: PartidoFixture[] = [];
  const n = ids.length;
  const esImpar = n % 2 === 1;

  // 👇 importante: array tipado con posible null
  const players: (Types.ObjectId | null)[] = esImpar ? [...ids, null] : [...ids];
  const total = players.length;

  const rondas = total - 1;
  const mitad = total / 2;

  for (let ronda = 0; ronda < rondas; ronda++) {
    // emparejamientos de la ronda actual
    for (let i = 0; i < mitad; i++) {
      const p1 = players[i];
      const p2 = players[total - 1 - i];

      // si hay bye (null) se omite ese partido
      if (p1 && p2) {
        fixture.push({
          categoria,
          fechaNumero: ronda + 1,
          jugador1: p1,
          jugador2: p2,
          estado: "sin_cargar",
        });
      }
    }

    // 🔧 ROTACIÓN CORREGIDA: mantiene el mismo length siempre
    const fijo = players[0];
    const resto = players.slice(1); // copia de los demás

    // rota a la derecha los elementos del resto
    resto.unshift(resto.pop() as Types.ObjectId | null);

    // sobrescribe solo la parte [1..fin] sin cambiar el tamaño del array
    players.splice(1, resto.length, ...resto);
    players[0] = fijo;
  }

  return fixture;
}
