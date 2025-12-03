"use client"

import type { ReactNode } from "react"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"

type AdminLayoutProps = {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar Dinámico */}
            <Sidebar role="admin" className="h-screen" />
            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col">
                {/* Header Dinámico */}
                <Header title="Administrador" />

                {/* Contenido */}
                <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
