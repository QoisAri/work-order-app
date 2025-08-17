// app/admin/components/AdminNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin', label: 'Work Orders' },
    { href: '/admin/dashboard', label: 'Dashboard' },
  ];

  return (
    <div className="flex space-x-4 border-b">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`py-2 px-3 font-medium text-sm rounded-t-lg ${
              isActive
                ? 'bg-white border border-b-0 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
