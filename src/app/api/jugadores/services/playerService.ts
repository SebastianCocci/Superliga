import { authFetch } from "@/lib/authFetch";
import { PlayerFormData } from "@/types/PlayerType";

export type PlayerUpdateData = {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  categoria: string;
};

export const playerService = {
  create: async (data: PlayerFormData) => {
    return authFetch("/api/jugadores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAll: async (categoria?: string) => {
    const url = categoria
      ? `/api/jugadores?categoria=${encodeURIComponent(categoria)}`
      : `/api/jugadores`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("Error obteniendo jugadores");
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(`/api/jugadores/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando jugador");
    return res.json();
  },

  async toggleActivo(id: string, activo: boolean) {
    const res = await fetch(`/api/jugadores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    });
    if (!res.ok) throw new Error("Error actualizando estado del jugador");
    return res.json();
  },

  async update(id: string, data: PlayerUpdateData) {
    const res = await fetch(`/api/jugadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error actualizando jugador");
    return res.json();
  },
};
