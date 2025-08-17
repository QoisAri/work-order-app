// app/admin/work-orders/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import WorkOrderDetail from './WorkOrderDetail';
import ActionButtons from './ActionButtons';

type PageProps = {
  params: { id: string };
};

export default async function WorkOrderDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data: workOrder } = await supabase
    .from('work_orders')
    .select(`
      *,
      profiles ( full_name, email ),
      equipments ( nama_equipment )
    `)
    .eq('id', params.id)
    .single();

  if (!workOrder) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detail Work Order: <span className="font-mono text-xl">{params.id.substring(0, 8)}...</span></h1>
      <WorkOrderDetail workOrder={workOrder} />
      {/* Hanya tampilkan tombol jika status masih 'pending' */}
      {workOrder.status === 'pending' && <ActionButtons workOrderId={workOrder.id} />}
    </div>
  );
}