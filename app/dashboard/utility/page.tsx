// app/dashboard/utility/page.tsx
import UtilityForm from '@/app/dashboard/components/UtilityForm';

export default async function UtilityWorkOrderPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Utility
        </h1>
        <UtilityForm />
      </div>
    </div>
  );
}
