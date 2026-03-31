"use client";

import {
  CalendarIcon,
  HomeIcon,
  TableIcon,
  TrophyIcon,
  UsersIcon,
  HistoryIcon,
} from "lucide-react";
import { useState } from "react";

/* ---------------- ICONO FALTANTE: StatsIcon ---------------- */
function StatsIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
      <div
        className={`w-full h-0.5 bg-white transition-transform ${
          isOpen ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <div
        className={`w-full h-0.5 bg-white transition-opacity ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <div
        className={`w-full h-0.5 bg-white transition-transform ${
          isOpen ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
    </div>
  );
}

type SidebarProps = {
  className?: string;
  role: "admin" | "jugador";
};

export function Sidebar({ className = "", role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menu = role === "admin" ? adminMenu : jugadorMenu;

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-lg transition-colors"
        style={{ backgroundColor: "#A50343" }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static w-67 lg:w-64",
          className,
        ].join(" ")}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold" style={{ color: "#A50343" }}>
              {role === "admin" ? "Panel Admin" : "Superliga Plaza"}
            </h2>
          </div>

          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-1">
              {menu.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                />
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
};

function SidebarItem({ icon, label, href }: SidebarItemProps) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm text-gray-700 hover:bg-gray-50"
      >
        <div className="text-gray-500">{icon}</div>
        <span>{label}</span>
      </a>
    </li>
  );
}

/* ------------------ MENÚS ------------------ */

const jugadorMenu = [
  { label: "Inicio", href: "/jugadores", icon: <HomeIcon /> },
  { label: "Resultados", href: "/jugadores/resultados", icon: <TrophyIcon /> },
  { label: "Tabla", href: "/jugadores/tabla", icon: <TableIcon /> },
  { label: "Jugadores", href: "/jugadores/lista", icon: <UsersIcon /> },
  {
    label: "Calendario",
    href: "/jugadores/partidos?from=calendario",
    icon: <CalendarIcon />,
  },
];

const adminMenu = [
  { label: "Inicio", href: "/admin", icon: <HomeIcon /> },
  { label: "Gestionar Jugadores", href: "/admin/jugadores", icon: <UsersIcon /> },
  { label: "Resultados Pendientes", href: "/admin/resultados/pendientes", icon: <TrophyIcon /> },
  { label: "Resultados Anteriores", href: "/admin/resultados/aprobados", icon: <HistoryIcon /> },
  { label: "Tabla de Posiciones", href: "/admin/tabla", icon: <TableIcon /> },
  { label: "Generar Fixture", href: "/admin/fixture", icon: <CalendarIcon /> },
  { label: "Configuración", href: "/admin/configuracion", icon: <StatsIcon /> },
];
