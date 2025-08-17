// app/admin/components/AdminTabs.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import WorkOrderList from './WorkOrderList';

export type WorkOrder = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  wo_number: string | null;
  // PERBAIKAN: Relasi one-to-one menghasilkan objek, bukan array
  profiles: { full_name: string | null; } | null;
  equipments: { nama_equipment: string | null; } | null;
};


// Tipe data untuk status tab
type TabStatus = 'pending' | 'approved' | 'rejected';

// Fungsi helper untuk memvalidasi status dari URL
const getValidTab = (status: string | null): TabStatus => {
  if (status === 'approved' || status === 'rejected') {
    return status;
  }
  return 'pending';
};

// Komponen utama yang berisi logika
function TabsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTab = (searchParams.get('status') === 'approved' || searchParams.get('status') === 'rejected') 
                    ? searchParams.get('status') as 'approved' | 'rejected' 
                    : 'pending';

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`id, created_at, status, wo_number, profiles(full_name), equipments(nama_equipment)`)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders:', error);
        setError('Gagal memuat data work order.');
      } else {
        setWorkOrders(data as any as WorkOrder[]);
      }
      setIsLoading(false);
    };

    fetchWorkOrders();
  }, [activeTab]);

  const handleTabClick = (tab: 'pending' | 'approved' | 'rejected') => {
    router.push(`/admin?status=${tab}`);
  };

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-500">Memuat data...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    return <WorkOrderList workOrders={workOrders} activeTab={activeTab} />;
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabClick('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleTabClick('approved')}
            className={`${
              activeTab === 'approved'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleTabClick('rejected')}
            className={`${
              activeTab === 'rejected'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rejected
          </button>
        </nav>
      </div>
      <div className="mt-8">
        {renderContent()}
      </div>
    </div>
  );
}

// Komponen wrapper untuk menggunakan Suspense
export default function AdminTabs() {
  return (
    <Suspense fallback={<div>Loading tabs...</div>}>
      <TabsComponent />
    </Suspense>
  );
}
