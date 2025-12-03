"use client";

import { useState } from "react";
import { playerService } from "@/app/api/jugadores/services/playerService";
import { useModal } from "@/app/context/ModalContext";

type PlayerFormData = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  role: "admin" | "jugador";
  categoria: "Top ten" | "A" | "B" | "C" | "D";
};

export default function NuevoJugadorPage() {
  const { openModal } = useModal();

  const [formData, setFormData] = useState<PlayerFormData>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    role: "jugador",
    categoria: "Top ten",
  });

  /* ===========================================================
      UTILIDAD CENTRAL DE TIPADO SEGURO
  ============================================================ */
  function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  }

  /* ===========================================================
      HANDLERS
  ============================================================ */

  const updateValue = (field: keyof PlayerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Función que realmente crea el jugador
  const crearJugador = async () => {
    try {
      await playerService.create(formData);

      openModal({
        title: "Jugador creado",
        message: "El jugador fue creado correctamente.",
        confirmText: "Aceptar",
        onConfirm: () => {
          setFormData({
            nombre: "",
            apellido: "",
            dni: "",
            email: "",
            telefono: "",
            role: "jugador",
            categoria: "Top ten",
          });
        },
      });

    } catch (error) {
      openModal({
        title: "Error",
        message: getErrorMessage(error),
        confirmText: "Cerrar",
      });
    }
  };

  // Confirmación antes de crear
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    openModal({
      title: "Confirmar creación",
      message: `¿Crear al jugador ${formData.nombre} ${formData.apellido}?`,
      confirmText: "Crear",
      cancelText: "Cancelar",
      onConfirm: crearJugador,
    });
  };

  // Cancelación del formulario
  const handleCancel = () => {
    openModal({
      title: "Cancelar",
      message: "¿Deseas limpiar el formulario?",
      confirmText: "Sí, limpiar",
      cancelText: "Volver",
      onConfirm: () =>
        setFormData({
          nombre: "",
          apellido: "",
          dni: "",
          email: "",
          telefono: "",
          role: "jugador",
          categoria: "Top ten",
        }),
    });
  };

  /* ===========================================================
      UI
  ============================================================ */

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-[#A50343]">
        Nuevo Jugador
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Nombre */}
          <FormInput
            label="Nombre"
            value={formData.nombre}
            placeholder="Ingresa el nombre"
            onChange={(v) => updateValue("nombre", v)}
          />

          {/* Apellido */}
          <FormInput
            label="Apellido"
            value={formData.apellido}
            placeholder="Ingresa el apellido"
            onChange={(v) => updateValue("apellido", v)}
          />

          {/* DNI */}
          <FormInput
            label="DNI"
            value={formData.dni}
            placeholder="Ingresa el DNI"
            onChange={(v) => updateValue("dni", v)}
          />

          {/* Email */}
          <FormInput
            label="Email"
            value={formData.email}
            type="email"
            placeholder="ejemplo@correo.com"
            onChange={(v) => updateValue("email", v)}
          />

          {/* Teléfono */}
          <FormInput
            label="Teléfono"
            value={formData.telefono}
            type="tel"
            placeholder="+54 9 11 1234-5678"
            onChange={(v) => updateValue("telefono", v)}
          />

          {/* Categoría */}
          <FormSelect
            label="Categoría"
            value={formData.categoria}
            onChange={(v) => updateValue("categoria", v)}
            options={["Top ten", "A", "B", "C", "D"]}
          />

          {/* Rol */}
          <FormSelect
            label="Rol"
            value={formData.role}
            onChange={(v) => updateValue("role", v as "admin" | "jugador")}
            options={["jugador", "admin"]}
          />

        </div>

        {/* Botones */}
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
  );
}

/* ===========================================================
   COMPONENTES REUTILIZABLES
=========================================================== */

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (v: string) => void;
};

function FormInput({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
        required
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

function FormSelect({ label, value, options, onChange }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A50343]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
