import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

type JugadorLayoutProps = {
  children: ReactNode;
};

export default function JugadorLayout({ children }: JugadorLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="jugador" className="h-screen" />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Jugador" />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
