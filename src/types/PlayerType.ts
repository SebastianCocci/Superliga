export type PlayerFormData = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  role: "admin" | "jugador";
  categoria: "Top ten" | "A" | "B" | "C" | "D";
};