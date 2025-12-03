"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ModalOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

type ModalContextType = {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  modalOptions: ModalOptions | null;
  isOpen: boolean;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openModal(options: ModalOptions) {
    setModalOptions(options);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalOptions, isOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal debe usarse dentro de <ModalProvider>");
  }
  return ctx;
}
