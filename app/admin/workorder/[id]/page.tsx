import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ActionButtons } from "./ActionButtons";

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: wo } = await supabase
        .from('work_orders')
        .select('*, profiles(*), equipments(*), job_types(*)')
        .eq('id', params.id)
        .single();
    
    if (!wo) notFound();

    return (
        <div>
            {/* Tampilkan semua detail WO di sini */}
            <h1 className="text-2xl font-bold">Detail Work Order: {wo.wo_number || wo.id}</h1>
            <pre className="bg-gray-100 p-4 rounded mt-4">{JSON.stringify(wo, null, 2)}</pre>
            
            {/* Komponen untuk tombol Setuju/Tolak */}
            <ActionButtons workOrderId={wo.id} status={wo.status} />
        </div>
    );
}