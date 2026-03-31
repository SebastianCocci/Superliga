"use client";

import { useState } from "react";
import { playerService } from "@/app/api/jugadores/services/playerService";
import { useModal } from "@/app/context/ModalContext";
import { ActionButton, ActionLink } from "@/components/ActionButtons";

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

  function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
  }

  const updateValue = (field: keyof PlayerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[#A50343]">Nuevo Jugador</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <FormInput
            label="Nombre"
            value={formData.nombre}
            placeholder="Ingresa el nombre"
            onChange={(v) => updateValue("nombre", v)}
            autoComplete="given-name"
            enterKeyHint="next"
          />

          <FormInput
            label="Apellido"
            value={formData.apellido}
            placeholder="Ingresa el apellido"
            onChange={(v) => updateValue("apellido", v)}
            autoComplete="family-name"
            enterKeyHint="next"
          />

          <FormInput
            label="DNI"
            value={formData.dni}
            placeholder="Ingresa el DNI"
            onChange={(v) => updateValue("dni", v)}
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="next"
          />

          <FormInput
            label="Email"
            value={formData.email}
            type="email"
            placeholder="ejemplo@correo.com"
            onChange={(v) => updateValue("email", v)}
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
          />

          <FormInput
            label="Teléfono"
            value={formData.telefono}
            type="tel"
            placeholder="+54 9 11 1234-5678"
            onChange={(v) => updateValue("telefono", v)}
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
          />

          <FormSelect
            label="Categoría"
            value={formData.categoria}
            onChange={(v) => updateValue("categoria", v)}
            options={["Top ten", "A", "B", "C", "D"]}
          />

          <FormSelect
            label="Rol"
            value={formData.role}
            onChange={(v) => updateValue("role", v as "admin" | "jugador")}
            options={["jugador", "admin"]}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end flex-wrap">
          <ActionLink variant="edit" href="/admin/jugadores" className="px-6 py-3">
            Cancelar
          </ActionLink>

          <ActionButton
            variant="primary"
            type="submit"
            onClick={() => {}}
            className="px-6 py-3"
          >
            Guardar
          </ActionButton>
        </div>
      </form>
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  onChange: (v: string) => void;

  // Mejoras UX móvil / form
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
  autoCapitalize?: React.HTMLAttributes<HTMLInputElement>["autoCapitalize"];
  autoCorrect?: string;
  spellCheck?: boolean;
};

function FormInput({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
  inputMode,
  autoComplete,
  enterKeyHint,
  autoCapitalize,
  autoCorrect,
  spellCheck,
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
        inputMode={inputMode}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
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
