import { ModalProvider } from "@/app/context/ModalContext";
import GlobalModal from "@/components/GlobalModal";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Superliga Plaza - Gestiona tu Liga de Tenis",
  description: "Aplicación web para jugadores de tenis. Gestiona tus partidos y seguí tu progreso.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <ModalProvider>
          {children}
          <GlobalModal />
          <Analytics />
        </ModalProvider>
      </body>
    </html>
  );
}
