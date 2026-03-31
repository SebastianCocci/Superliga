"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type HeaderProps = {
  title: string;
};

type MeResponse = {
  nombre: string;
  apellido: string;
  role: "admin" | "jugador";
  email: string;
};

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === "string" ? data.error : "Error en la petición";
  } catch {
    return "Error en la petición";
  }
}

// Cache en memoria (vive mientras dura la sesión en el navegador)
let cachedJugadorTitle: string | null = null;

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const [userTitle, setUserTitle] = useState<string | null>(() => cachedJugadorTitle);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      if (title !== "Jugador") return;

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) return;

        if (!res.ok) {
          console.warn(
            "No se pudo obtener /api/auth/me:",
            await parseErrorMessage(res)
          );
          return;
        }

        const data = (await res.json()) as MeResponse;
        const displayName = `${data?.nombre ?? ""} ${data?.apellido ?? ""}`.trim();

        if (!cancelled && displayName) {
          cachedJugadorTitle = displayName;
          setUserTitle(displayName);
        }
      } catch (err) {
        console.warn("Error llamando /api/auth/me:", err);
      }
    }

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [title]);

  async function handleLogout() {
    if (loading) return;

    try {
      setLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      cachedJugadorTitle = null;
      setUserTitle(null);
      router.replace("/login");
      setLoading(false);
    }
  }

  // Si title es "Jugador", dejamos vacío hasta que cargue el nombre.
  const headerTitle =
    title === "Jugador"
      ? userTitle ?? "" // <-- antes decía "Jugador"
      : title;

  return (
    <header className="py-4 px-4 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <div className="w-12 lg:w-0" />

        <h1 className="text-2xl font-bold text-center flex-1 text-[#A50343]">
          {headerTitle || "\u00A0"}
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="shrink-0 inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-2 shadow-sm transition
            bg-gray-200 hover:bg-gray-300 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A50343]
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saliendo..." : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
}
