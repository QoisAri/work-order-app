'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import WorkOrderList from './WorkOrderList';
import EditWorkOrderModal from './EditWorkOrderModal';
import { editWorkOrder } from '../work-orders/[id]/actions';
import * as XLSX from 'xlsx';

export type WorkOrder = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'done';
  wo_number: string | null;
  profiles: { full_name: string | null; } | null;
  equipments: { nama_equipment: string | null; } | null;
  details?: any; 
};

type TabStatus = 'pending' | 'approved' | 'rejected';

const getValidTab = (status: string | null): TabStatus => {
  if (status === 'approved' || status === 'rejected') return status;
  return 'pending';
};

function TabsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); 
  const activeTab: TabStatus = getValidTab(searchParams.get('status'));

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: 'all', equipment: 'all' });

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      let query = supabase.from('work_orders').select(`id, created_at, status, wo_number, details, profiles:user_id(full_name), equipments:equipment_id(nama_equipment)`);
      if (activeTab === 'approved') {
        query = query.in('status', ['approved', 'done']);
      } else {
        query = query.eq('status', activeTab);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching work orders:', error);
        setError('Gagal memuat data work order.');
      } else {
        setWorkOrders(data as any[] as WorkOrder[]);
      }
      setIsLoading(false);
    };
    fetchWorkOrders();
  }, [activeTab]);

  const filteredWorkOrders = useMemo(() => {
    if (activeTab !== 'approved') return workOrders;
    return workOrders.filter(wo => {
      const woDate = new Date(wo.created_at);
      if (filters.startDate && woDate < new Date(filters.startDate)) return false;
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        if (woDate >= endDate) return false;
      }
      if (filters.status !== 'all' && wo.status !== filters.status) return false;
      if (filters.equipment !== 'all' && wo.equipments?.nama_equipment !== filters.equipment) return false;
      return true;
    });
  }, [workOrders, activeTab, filters]);

  const equipmentList = useMemo(() => {
    const equipmentNames = workOrders
      .map(wo => wo.equipments?.nama_equipment)
      .filter((name): name is string => typeof name === 'string' && name.length > 0);
    return Array.from(new Set(equipmentNames));
  }, [workOrders]);
  
  const handleExportToExcel = () => {
    const dataToExport = filteredWorkOrders.map(wo => ({
      'Nomor WO': wo.wo_number,
      'Status': wo.status === 'done' ? 'Selesai' : 'Disetujui',
      'Pemohon': wo.profiles?.full_name,
      'Equipment': wo.equipments?.nama_equipment,
      'Tanggal Dibuat': new Date(wo.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      'Estimasi Pengerjaan': wo.details?.estimasi_pengerjaan ? new Date(wo.details.estimasi_pengerjaan).toLocaleDateString('id-ID') : '-',
      'Estimasi Selesai': wo.details?.estimasi_selesai ? new Date(wo.details.estimasi_selesai).toLocaleDateString('id-ID') : '-',
      'Deskripsi': wo.details?.deskripsi_pekerjaan || wo.details?.deskripsi || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFD3D3D3" } } };
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[address]) {
        worksheet[address].s = headerStyle;
      }
    }

    const objectMaxLength = dataToExport.reduce((acc, obj) => {
        Object.values(obj).forEach((value, index) => {
            const len = value ? String(value).length : 0;
            acc[index] = Math.max(acc[index] || 0, len);
        });
        Object.keys(obj).forEach((key, index) => {
            acc[index] = Math.max(acc[index] || 0, key.length);
        });
        return acc;
    }, [] as number[]);
    worksheet["!cols"] = objectMaxLength.map(w => ({ wch: w + 2 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkOrders');
    XLSX.writeFile(workbook, 'Laporan_Work_Order_Approved.xlsx');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTabClick = (tab: TabStatus) => router.push(`${pathname}?status=${tab}`);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus Work Order ini?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('work_orders').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus work order.');
    } else {
      setWorkOrders(prev => prev.filter(wo => wo.id !== id));
      alert('Work Order berhasil dihapus.');
    }
  };

  const handleOpenEditModal = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingWorkOrder(null);
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = async (id: string, updates: any) => {
    try {
      await editWorkOrder(id, updates);
      alert('Perubahan berhasil disimpan!');
      setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, ...updates, details: {...wo.details, ...updates.details} } : wo));
      handleCloseEditModal();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const renderContent = () => {
    if (isLoading) return <p className="text-center">Memuat data...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    return <WorkOrderList workOrders={filteredWorkOrders} activeTab={activeTab} onDelete={handleDelete} onEdit={handleOpenEditModal} />;
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <nav className="flex items-center justify-center bg-gray-100 p-1 rounded-lg space-x-1">
          <button
            onClick={() => handleTabClick('pending')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleTabClick('approved')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === 'approved'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleTabClick('rejected')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === 'rejected'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
        </nav>
        
        {activeTab === 'approved' && (
          <button
            onClick={handleExportToExcel}
            disabled={filteredWorkOrders.length === 0}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Unduh Excel
          </button>
        )}
      </div>

      {activeTab === 'approved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 mt-6 bg-gray-50 rounded-lg border">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
            <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
            <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              <option value="all">Semua Status</option>
              <option value="approved">Approved</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Equipment</label>
            <select id="equipment" name="equipment" value={filters.equipment} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              <option value="all">Semua Equipment</option>
              {equipmentList.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="mt-8">{renderContent()}</div>
      
      <EditWorkOrderModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        workOrder={editingWorkOrder}
        onSave={handleSaveChanges}
      />
    </div>
  );
}

export default function AdminTabs() {
  return (
    <Suspense fallback={<div>Loading tabs...</div>}>
      <TabsComponent />
    </Suspense>
  );
}