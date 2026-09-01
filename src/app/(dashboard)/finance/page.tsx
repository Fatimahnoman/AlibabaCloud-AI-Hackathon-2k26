'use client';

import Link from 'next/link';

const financeTools = [
  {
    title: 'Finance AI',
    description: 'Chat with FinanceAdvisor AI for investment, banking, tax, and Islamic finance guidance',
    href: '/finance/ai',
    icon: '🤖',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'PSX & Stocks',
    description: 'Pakistan Stock Exchange insights and investment analysis',
    href: '/finance/ai',
    icon: '📈',
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Islamic Banking',
    description: 'Shariah-compliant banking options and profit rates',
    href: '/finance/ai',
    icon: '🏦',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    title: 'Tax & FBR',
    description: 'Tax filing guidance and FBR regulations',
    href: '/finance/ai',
    icon: '📋',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Remittance',
    description: 'International money transfer options and rates',
    href: '/finance/ai',
    icon: '💸',
    color: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Financial Planning',
    description: 'Retirement, insurance, and wealth management guidance',
    href: '/finance/ai',
    icon: '🎯',
    color: 'from-orange-500 to-amber-600',
  },
];

export default function FinancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Finance & Investment</h1>
        <p className="text-gray-500 mt-1">Expert guidance on banking, investment, tax, and Islamic finance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {financeTools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="card-hover p-6 group"
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h2 className="text-lg font-semibold text-gray-100 group-hover:text-emerald-600 transition-colors">{tool.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
