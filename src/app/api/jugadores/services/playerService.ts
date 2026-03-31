import { authFetch } from "@/lib/authFetch";
import { PlayerFormData } from "@/types/PlayerType";

export type PlayerUpdateData = {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  categoria: string;
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === "string" ? data.error : "Error en la petición";
  } catch {
    return "Error en la petición";
  }
}

async function ensureOk(res: Response) {
  if (res.ok) return;

  if (res.status === 401) throw new HttpError(401, "No autorizado");
  if (res.status === 403) throw new HttpError(403, "Acceso denegado");

  throw new HttpError(res.status, await parseErrorMessage(res));
}

export const playerService = {
  create: async (data: PlayerFormData) => {
    // Nota: authFetch hoy usa localStorage token. Si ya migraste todo a cookie,
    // más adelante conviene unificar y dejar de usar authFetch acá.
    return authFetch("/api/jugadores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAll: async (categoria?: string) => {
    const url = categoria
      ? `/api/jugadores?categoria=${encodeURIComponent(categoria)}`
      : `/api/jugadores`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    await ensureOk(res);
    return res.json();
  },

  getMyCategory: async () => {
    const res = await fetch("/api/jugadores/mi-categoria", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    await ensureOk(res);
    return res.json() as Promise<{ categoria: string; jugadores: unknown[] }>;
  },


  async delete(id: string) {
    const res = await fetch(`/api/jugadores/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await ensureOk(res);
    return res.json();
  },

  async toggleActivo(id: string, activo: boolean) {
    const res = await fetch(`/api/jugadores/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    });

    await ensureOk(res);
    return res.json();
  },

  async update(id: string, data: PlayerUpdateData) {
    const res = await fetch(`/api/jugadores/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    await ensureOk(res);
    return res.json();
  },
};
