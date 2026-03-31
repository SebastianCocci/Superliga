"use client";

import Link from "next/link";
import React from "react";

type ActionVariant = "edit" | "warning" | "danger" | "primary" | "neutral";

function variantClasses(variant: ActionVariant): string {
  switch (variant) {
    case "edit":
      return "bg-[#8AC2EB] hover:bg-[#7AB3D9] text-white";
    case "warning":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "danger":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "primary":
      return "bg-[#A50343] hover:bg-[#8A0336] text-white";
    case "neutral":
    default:
      return "bg-gray-300 hover:bg-gray-400 text-gray-900";
  }
}

const baseClasses =
  "inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-2 shadow-sm transition " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A50343] " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

type CommonActionProps = {
  variant: ActionVariant;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  /**
   * Si es true, el botón/link ocupa todo el ancho del contenedor.
   * Útil para mobile (targets táctiles más grandes).
   */
  fullWidth?: boolean;
};

export type ActionButtonProps = CommonActionProps & {
  onClick: () => void;
  type?: "button" | "submit";
};

export function ActionButton({
  variant,
  children,
  onClick,
  disabled,
  className,
  type = "button",
  fullWidth = false,
}: ActionButtonProps) {
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${widthClass} ${variantClasses(variant)} ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

export type ActionLinkProps = CommonActionProps & {
  href: string;
};

export function ActionLink({
  variant,
  children,
  href,
  className,
  fullWidth = false,
}: ActionLinkProps) {
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${widthClass} ${variantClasses(variant)} ${
        className ?? ""
      }`}
    >
      {children}
    </Link>
  );
}
