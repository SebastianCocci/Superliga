import { Types } from "mongoose";

// Categorías válidas
type Categoria = "Top ten" | "A" | "B" | "C" | "D";

// Lo mínimo que necesitamos de cada jugador para armar el fixture
type PlayerForFixture = {
  _id: Types.ObjectId;
};

// Jugador real o un hueco ("bye") para cuando la cantidad es impar
type PlayerOrBye = PlayerForFixture | { _id: null };

// Tipo de los partidos que devuelve esta función (listos para insertar)
export type PartidoFixture = {
  categoria: Categoria;
  fechaNumero: number;
  jugador1: Types.ObjectId;
  jugador2: Types.ObjectId;
  estado: "sin_cargar";
};

/**
 * Genera un fixture Round Robin (todos contra todos) para una categoría.
 * Recibe una lista de jugadores (con _id) y devuelve los partidos.
 */
export function generarFixture(
  jugadores: PlayerForFixture[],
  categoria: Categoria
): PartidoFixture[] {
  if (jugadores.length < 2) {
    throw new Error("Se necesitan al menos 2 jugadores para generar el fixture.");
  }

  // Copiamos para no mutar el array original
  const players: PlayerOrBye[] = [...jugadores];

  // Si la cantidad es impar, agregamos un "BYE"
  const isOdd = players.length % 2 !== 0;
  if (isOdd) {
    players.push({ _id: null });
  }

  const n = players.length;
  const rondas = n - 1;
  const half = n / 2;

  const partidos: PartidoFixture[] = [];

  for (let ronda = 1; ronda <= rondas; ronda++) {
    for (let i = 0; i < half; i++) {
      const j1 = players[i];
      const j2 = players[n - 1 - i];

      // Si alguno es BYE, no se genera partido
      if (j1._id === null || j2._id === null) continue;

      partidos.push({
        categoria,
        fechaNumero: ronda,
        jugador1: j1._id,
        jugador2: j2._id,
        estado: "sin_cargar",
      });
    }

    // Rotación "método del círculo" (sin tocar la posición 0)
    const last = players.pop();
    if (last) {
      players.splice(1, 0, last);
    }
  }

  return partidos;
}
