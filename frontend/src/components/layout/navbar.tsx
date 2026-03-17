"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "text-sm transition-colors",
        active ? "text-slate-900" : "text-slate-600 hover:text-slate-900",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { token, clear } = useAuthStore();

  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight text-slate-900">
          Kariyer Rotası
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink href="/jobs" label="İlanlar" />
          {token ? (
            <>
              <NavLink href="/profile" label="Profil" />
              <button
                onClick={() => clear()}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" label="Giriş" />
              <Link
                href="/register"
                className="text-sm rounded-md bg-slate-900 text-white px-3 py-1.5 hover:opacity-90 transition-opacity"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

