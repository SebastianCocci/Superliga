"use client";

import { useModal } from "@/app/context/ModalContext";

export default function GlobalModal() {
  const { isOpen, modalOptions, closeModal } = useModal();

  if (!isOpen || !modalOptions) return null;

  const {
    title = "Confirmación",
    message = "¿Estás seguro?",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    onConfirm,
  } = modalOptions;

  function handleConfirm() {
    onConfirm?.();
    closeModal();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-[#A50343]">{title}</h2>
        <p className="mt-3 text-gray-700">{message}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#A50343] hover:bg-[#8A0336] text-white rounded-lg text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
