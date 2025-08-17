// app/admin/page.tsx
import AdminTabs from './components/AdminTabs';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <AdminTabs />
    </div>
  );
}
