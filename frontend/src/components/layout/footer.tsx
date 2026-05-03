import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200/80 pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-16">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 outline-none">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                <Briefcase className="text-white w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight text-xl text-gray-900">
                kariyer<span className="text-indigo-600 font-medium tracking-normal">rotası</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
              Modern yetenekleri, Türkiye'nin önde gelen dev şirketleriyle buluşturan akıllı, verimli platform.
            </p>
          </div>
          
          <div className="md:col-span-2 md:col-start-6">
            <h3 className="font-bold text-gray-900 mb-5 text-[13px] uppercase tracking-wider">Adaylar</h3>
            <ul className="space-y-3.5">
              <li><Link href="/jobs" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">İş İlanları</Link></li>
              <li><Link href="/companies" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Şirketler</Link></li>
              <li><Link href="/guide" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Kariyer Rehberi</Link></li>
              <li><Link href="/cv" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Özgeçmiş Hazırlama</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-bold text-gray-900 mb-5 text-[13px] uppercase tracking-wider">İşverenler</h3>
            <ul className="space-y-3.5">
              <li><Link href="/employer" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">İlan Verin</Link></li>
              <li><Link href="/pricing" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Paket Fiyatları</Link></li>
              <li><Link href="/ats" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Aday Takip Sistemi</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 tracking-wide">
            <h3 className="font-bold text-gray-900 mb-5 text-[13px] uppercase tracking-wider">Kurumsal</h3>
            <ul className="space-y-3.5">
              <li><Link href="/about" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/contact" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">İletişim</Link></li>
              <li><Link href="/terms" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Kullanım Şartları</Link></li>
              <li><Link href="/privacy" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Gizlilik İlkeleri</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400">
            © {new Date().getFullYear()} KariyerRotası. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 hover:text-indigo-600 cursor-pointer transition-colors">in</div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 hover:text-indigo-600 cursor-pointer transition-colors">tw</div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 hover:text-indigo-600 cursor-pointer transition-colors">ig</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

