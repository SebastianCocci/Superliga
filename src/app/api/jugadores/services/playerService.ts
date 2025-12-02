import { authFetch } from "@/lib/authFetch";
import { PlayerFormData } from "@/types/PlayerType";

export const playerService = {
  create: async (data: PlayerFormData) => {
    return authFetch("/api/jugadores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
