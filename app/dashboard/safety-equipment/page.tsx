// app/dashboard/safety-equipment/page.tsx
import SafetyEquipmentForm from '@/app/dashboard/components/SafetyEquipmentForm';

export default async function SafetyEquipmentWorkOrderPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Work Order - Safety Equipment
        </h1>
        <SafetyEquipmentForm />
      </div>
    </div>
  );
}
