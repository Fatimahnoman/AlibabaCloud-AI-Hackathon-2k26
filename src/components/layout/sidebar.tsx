'use client';

interface SidebarProps {
  isOpen?: boolean;
}

const navItems = [
  { label: 'Chat', href: '/chat', icon: '💬' },
  { label: 'Education', href: '/education', icon: '🎓' },
  { label: 'Finance', href: '/finance', icon: '📈' },
  { label: 'Fraud Detection', href: '/fraud', icon: '🛡️' },
  { label: 'Budget', href: '/budget', icon: '💰' },
  { label: 'Documents', href: '/documents', icon: '📄' },
  { label: 'Study Planner', href: '/study-planner', icon: '📚' },
];

export default function Sidebar({ isOpen = true }: SidebarProps) {
  return (
    <aside className={`w-64 bg-[#0f172a] border-r border-[#1e293b] p-4 ${isOpen ? 'block' : 'hidden'} md:block`}>
      <h2 className="text-lg font-bold text-blue-800 mb-6">EduGuard AI</h2>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-8 pt-4 border-t border-[#1e293b]">
        <p className="text-xs text-gray-400">EduGuard AI v0.1.0</p>
        <p className="text-xs text-gray-400">Phase 1: Foundation</p>
      </div>
    </aside>
  );
}
