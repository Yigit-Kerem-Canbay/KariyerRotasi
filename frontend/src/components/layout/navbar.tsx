"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { User, LogOut, ChevronDown, Briefcase } from "lucide-react";

export function Navbar() {
  const { token, user, clear } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="mx-auto max-w-[1200px] h-[70px] flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group outline-none shrink-0 border-r border-gray-200 pr-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Briefcase className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight text-[22px] text-gray-900">
            kariyer<span className="text-indigo-600 font-medium">rotası</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 mr-auto ml-6">
          <Link href="/jobs" className="text-[14px] font-semibold text-gray-600 hover:text-indigo-600 transition-colors">İş İlanları</Link>
          <Link href="/companies" className="text-[14px] font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Platformdaki Şirketler</Link>
          <Link href="/career" className="text-[14px] font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Kariyer Planlaması</Link>
          <Link href="/guide" className="text-[14px] font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Kariyer Rehberi</Link>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <Link href="/employer" className="hidden sm:block">
            <Button variant="ghost" className="text-[14px] font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 h-10 px-4 rounded-xl transition-colors">
              İşveren Çözümleri
            </Button>
          </Link>

          {token ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" className="h-10 px-4 gap-2 font-semibold text-gray-700 hover:bg-slate-50 border-gray-200 rounded-xl transition-colors">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>{user?.name?.split(" ")[0]}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => clear()}
                className="h-10 px-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" className="h-10 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-[14px] px-5 rounded-xl transition-all">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[14px] px-6 rounded-xl shadow-md shadow-indigo-600/20 transition-all">
                  Üye Ol
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
