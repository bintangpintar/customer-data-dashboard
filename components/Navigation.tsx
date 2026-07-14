'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-900 dark:bg-black border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'text-white border-b-2 border-blue-500 pb-4' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Pelanggan
          </Link>
          <Link 
            href="/leads-tracker" 
            className={`text-sm font-medium transition-colors ${
              isActive('/leads-tracker') 
                ? 'text-white border-b-2 border-blue-500 pb-4' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Leads Tracker
          </Link>
        </div>
      </div>
    </nav>
  );
}
