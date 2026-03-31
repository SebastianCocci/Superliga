import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar role="admin" className="h-screen" />

      <div className="flex-1 flex flex-col">
        <Header title="Administrador" />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
