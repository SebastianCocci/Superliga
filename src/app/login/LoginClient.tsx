"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm, type LoginFormData } from "@/components/login-form";

type Role = "admin" | "jugador";

type LoginResponse =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
        role: Role;
        nombre: string;
        apellido: string;
      };
    }
  | { error: string };

function safeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams]
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(data: LoginFormData) {
    setErrorMsg(null);

    if (!data.email || !data.password) {
      setErrorMsg("Completá email y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as LoginResponse;

      if (!res.ok) {
        setErrorMsg("error" in json ? json.error : "No se pudo iniciar sesión.");
        return;
      }

      if (!("ok" in json) || json.ok !== true) {
        setErrorMsg("No se pudo iniciar sesión.");
        return;
      }

      if (nextParam) {
        router.replace(nextParam);
        return;
      }

      if (json.user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/jugadores");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Hubo un problema de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-10 bg-gray-50">
      <LoginForm onSubmit={handleLogin} loading={loading} errorMsg={errorMsg} />
    </div>
  );
}
