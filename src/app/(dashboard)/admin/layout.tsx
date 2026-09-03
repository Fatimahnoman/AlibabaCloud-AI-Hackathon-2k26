'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', gradient: 'from-indigo-500 to-teal-400', icon: '📊' },
  { href: '/admin/users', label: 'Users', gradient: 'from-emerald-500 to-teal-400', icon: '👥' },
  { href: '/admin/security', label: 'Security', gradient: 'from-emerald-500 to-teal-500', icon: '🛡️' },
  { href: '/admin/health', label: 'Health', gradient: 'from-violet-500 to-purple-500', icon: '💓' },
  { href: '/admin/ai-monitor', label: 'AI Monitor', gradient: 'from-amber-500 to-orange-500', icon: '🤖' },
  { href: '/admin/data', label: 'Data', gradient: 'from-rose-500 to-pink-500', icon: '🗄️' },
  { href: '/admin/audit', label: 'Audit', gradient: 'from-teal-500 to-emerald-500', icon: '📋' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Admin header bar */}
      <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <h1 className="text-lg font-bold gradient-text animate-color-cycle">Admin Panel</h1>
          </div>
          <Link href="/education" className="text-xs font-medium bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-teal-300 transition-all">
            ← Back to App
          </Link>
        </div>

        {/* Horizontal tab navigation */}
        <div className="relative">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-full px-4 py-2.5 text-left text-sm font-semibold flex items-center justify-between">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {navItems.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          <nav className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-1 p-2 overflow-x-auto`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive ? 'text-white' : 'text-emerald-400 hover:text-emerald-300 hover:bg-white/5'}`}>
                  {isActive && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-20`} />
                  )}
                  <span className="relative">{item.icon}</span>
                  <span className={`relative bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>{item.label}</span>
                  {isActive && <div className={`relative w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.gradient}`} />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
