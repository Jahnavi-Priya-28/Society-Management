import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="hidden lg:block">
          <span className="section-kicker">Production SaaS assignment</span>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-normal">A society maintenance product that feels ready for real residents.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted)]">
            Role-based access, complaint lifecycle, smart suggestions, email hooks, and operational dashboards in one polished workspace.
          </p>
          <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
            {["Protected routes", "Timeline history", "Admin analytics"].map((item) => (
              <div key={item} className="rounded-lg border border-[var(--border)] bg-white/70 p-4 text-sm font-medium shadow-sm dark:bg-white/10">
                {item}
              </div>
            ))}
          </div>
        </section>
        <div className="w-full">
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          New resident?{" "}
          <Link href="/register" className="font-medium text-teal-700 dark:text-teal-300">
            Create an account
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
}
