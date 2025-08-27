// app/dashboard/other/page.tsx
import OtherForm from '@/app/dashboard/components/OtherForm';

export default async function OtherWorkOrderPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Other
        </h1>
        <OtherForm />
      </div>
    </div>
  );
}
