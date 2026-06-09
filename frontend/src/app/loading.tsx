export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]/60 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute"></div>
        </div>
        <div className="text-indigo-900 font-bold text-sm">Yükleniyor...</div>
      </div>
    </div>
  );
}
