import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 bg-[#f8fafc]">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[520px]">
        <div className="bg-white rounded-[32px] border border-slate-200/60 p-10 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}
