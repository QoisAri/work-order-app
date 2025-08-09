'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { ActionButtons } from "./ActionButtons";

type WorkOrder = {
  id: string;
  wo_number: string | null;
  status: string;
  details: any;
  profiles: { full_name: string | null } | null;
  equipments: { nama_equipment: string | null } | null;
  job_types: { nama_pekerjaan: string | null } | null;
};

export default function WorkOrderDetail({ id }: { id: string }) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      const supabase = createClient();
      setLoading(true);
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('*, profiles(*), equipments(*), job_types(*)')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setWorkOrder(data);
      }
      setLoading(false);
    };

    fetchWorkOrder();
  }, [id]);

  if (loading) {
    return <div className="p-4">Memuat detail work order...</div>;
  }

  if (error || !workOrder) {
    return <div className="p-4 text-red-500">Error: {error || 'Work order tidak ditemukan.'}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">
        Detail Work Order: {workOrder.wo_number || workOrder.id}
      </h1>
      <pre className="bg-gray-100 p-4 rounded mt-4 text-sm overflow-x-auto">
        {JSON.stringify(workOrder, null, 2)}
      </pre>
      
      <ActionButtons workOrderId={workOrder.id} status={workOrder.status} />
    </div>
  );
}