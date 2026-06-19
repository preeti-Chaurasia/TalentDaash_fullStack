'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Ye function check karega ki current page kaunsa hai aur usko highlight karega
  const isActive = (path: string) => 
    pathname?.startsWith(path) ? 'text-[#FF5A5F] border-b-2 border-[#FF5A5F]' : 'text-[#484848] hover:text-[#FF5A5F]';

  return (
    <header className="bg-white border-b border-[#EBEBEB] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/salaries" className="text-[#FF5A5F] text-xl font-black tracking-tight hover:opacity-90 transition">
            Talent_Dash<span className="text-[#222222] font-normal"></span>
          </Link>
          
          <nav className="flex items-center gap-6 text-sm font-semibold h-full pt-1">
            <Link href="/salaries" className={`pb-1 transition-colors ${isActive('/salaries')}`}>
              Salaries
            </Link>
            <Link href="/companies" className={`pb-1 transition-colors ${isActive('/companies')}`}>
              Companies
            </Link>
            <Link href="/compare" className={`pb-1 transition-colors ${isActive('/compare')}`}>
              Compare Offers
            </Link>
          </nav>
        </div>
        <div className="text-xs text-[#717171] font-mono hidden sm:block">
          Status: <span className="text-[#008A05] font-bold">● Active Matrix</span>
        </div>
      </div>
    </header>
  );
}