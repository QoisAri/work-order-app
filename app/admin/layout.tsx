// app/admin/layout.tsx
import { LogoutButton } from '@/app/components/LogoutButton';
import AdminNav from './components/AdminNav'; // Komponen navigasi baru

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Area</h1>
        <LogoutButton />
      </div>
      <AdminNav />
      <main className="mt-6">
        {children}
      </main>
    </div>
  );
}
