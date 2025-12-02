"use client"

import { useState } from "react"

type PlayerFormData = {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  role: "admin" | "jugador"
  categoria: "Top ten" | "A" | "B" | "C" | "D"
}


export default function NuevoJugadorPage() {
  const [formData, setFormData] = useState<PlayerFormData>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    role: "jugador",
    categoria: "Top ten", // valor inicial por defecto
  })

  const handleChange = (field: keyof PlayerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Usuario guardado:", formData)

    alert("Usuario guardado correctamente")
  }

  const handleCancel = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      role: "jugador",
      categoria: "Top ten",
    })

  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-[#A50343]">Nuevo Usuario</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              placeholder="Ingresa el nombre"
              required
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              placeholder="Ingresa el apellido"
              required
            />
          </div>

          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DNI
            </label>
            <input
              type="text"
              value={formData.dni}
              onChange={(e) => handleChange("dni", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              placeholder="Ingresa el DNI"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
              placeholder="+54 9 11 1234-5678"
              required
            />
          </div>

          {/* Rol */}
          <div className="relative">
            <select
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value as "admin" | "jugador")}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343] appearance-none"
              required
            >
              <option value="jugador">Jugador</option>
              <option value="admin">Administrador</option>
            </select>

            {/* flecha custom */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black-500">
              ▼
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-[#8AC2EB] text-white rounded-lg font-medium hover:bg-[#7AB3D9]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-[#A50343] text-white rounded-lg font-medium hover:bg-[#8A0336]"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
