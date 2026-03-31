import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-10 bg-gray-50">
          <div className="animate-spin h-10 w-10 border-4 border-[#A50343] border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
