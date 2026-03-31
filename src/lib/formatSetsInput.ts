export function formatSetsInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10); // hasta 5 sets (10 dígitos)
  let out = "";

  for (let i = 0; i < digits.length; i++) {
    out += digits[i];

    // Entre los 2 dígitos del set agregamos "/" si hay segundo dígito
    if (i % 2 === 0 && i < digits.length - 1) {
      out += "/";
    }

    // Después de cada 2 dígitos (un set) agregamos "-" si hay más
    if (i % 2 === 1 && i < digits.length - 1) {
      out += "-";
    }
  }

  return out;
}
