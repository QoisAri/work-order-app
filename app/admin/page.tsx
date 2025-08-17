// app/admin/page.tsx
import AdminTabs from './components/AdminTabs';
import { LogoutButton } from '../components/LogoutButton'; // Impor LogoutButton

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <AdminTabs />
    </div>
  );
}
