// app/admin/components/AdminTabs.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import WorkOrderList from './WorkOrderList';

// Definisikan tipe data untuk work order agar lebih rapi
export type WorkOrder = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  // PERBAIKAN: Mengubah tipe menjadi array of objects
  profiles: {
    nama_lengkap: string | null;
  }[] | null;
  equipments: {
    nama_equipment: string | null;
  }[] | null;
};

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
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
        .select(`
          id,
          created_at,
          status,
          profiles ( nama_lengkap ),
          equipments ( nama_equipment )
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders:', error);
        setError('Gagal memuat data work order.');
      } else {
        setWorkOrders(data as WorkOrder[]);
      }
      setIsLoading(false);
    };

    fetchWorkOrders();
  }, [activeTab]);

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-500">Memuat data...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    return <WorkOrderList workOrders={workOrders} />;
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`${
              activeTab === 'approved'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`${
              activeTab === 'rejected'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
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
