import { Suspense } from "react";
import PartidosClient from "./PartidosClient";

export default function JugadorPartidosPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 flex justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
        </div>
      }
    >
      <PartidosClient />
    </Suspense>
  );
}
