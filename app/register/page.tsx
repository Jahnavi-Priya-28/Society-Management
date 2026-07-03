import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <AuthForm mode="register" />
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-teal-700 dark:text-teal-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
