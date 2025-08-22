// app/components/CreateWorkOrderForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Tipe data (sesuaikan jika perlu)
type JobType = { id: string; nama_pekerjaan: string };
type Department = { id:string; nama_departemen: string };
type Equipment = { id: string; nama_equipment: string };
type FormProps = {
  jobTypes: JobType[];
  departments: Department[];
  initialData: Record<string, any>;
};

export default function CreateWorkOrderForm({ jobTypes, departments, initialData }: FormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isFetchingEquipments, setIsFetchingEquipments] = useState(false);
  
  // --- PERBAIKAN: State baru untuk menyimpan equipment yang dipilih ---
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  useEffect(() => {
    if (!selectedJobType) {
      setEquipments([]);
      setSelectedEquipment(''); // Reset pilihan equipment jika jenis pekerjaan berubah
      return;
    }

    const fetchEquipments = async () => {
      setIsFetchingEquipments(true);
      setError(null); // Hapus error sebelumnya saat memulai fetch baru
      try {
        const response = await fetch(`/api/equipments?jobTypeId=${selectedJobType}`);
        if (!response.ok) {
          throw new Error('Gagal memuat data equipment.');
        }
        const data = await response.json();
        setEquipments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetchingEquipments(false);
      }
    };

    fetchEquipments();
  }, [selectedJobType]);

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setIsLoading(true);
  setError(null);

  if (selectedEquipment) {
      // PERBAIKAN: Hapus bagian dalam kurung dan spasi ekstra dari nama equipment
      const cleanName = selectedEquipment.replace(/\s*\(.*/, ''); 
      const equipmentPath = cleanName.toLowerCase().replace(/\s+/g, '-');
      
      router.push(`/dashboard/${equipmentPath}`);
  } else {
      setError("Silakan pilih equipment terlebih dahulu.");
      setIsLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Buat Work Order
      </h1>
      
      {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

      {/* Field-field form lainnya ... */}
       <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input name="full_name" id="full_name" required defaultValue={initialData.full_name || ''} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="no_wa" className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
        <input name="no_wa" id="no_wa" required defaultValue={initialData.no_wa || ''} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
        <div>
        <label htmlFor="sub_depart" className="block text-sm font-medium text-gray-700">Departemen</label>
        <select name="sub_depart" id="sub_depart" required defaultValue={initialData.sub_depart || ''} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option value="" disabled>Pilih Departemen...</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.nama_departemen}>{dept.nama_departemen}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="job_type_id" className="block text-sm font-medium text-gray-700">Jenis Pekerjaan</label>
        <select 
          name="job_type_id" 
          id="job_type_id" 
          required
          value={selectedJobType}
          onChange={(e) => setSelectedJobType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="" disabled>Pilih Pekerjaan...</option>
          {jobTypes.map(job => (
            <option key={job.id} value={job.id}>{job.nama_pekerjaan}</option>
          ))}
        </select>
      </div>

      {/* Dropdown Equipment yang muncul secara dinamis */}
      {selectedJobType && (
        <div>
          <label htmlFor="equipment_name" className="block text-sm font-medium text-gray-700">Pilih Equipment</label>
          <select 
            name="equipment_name" 
            id="equipment_name" 
            required
            disabled={isFetchingEquipments || equipments.length === 0}
            // --- PERBAIKAN: Ikat value dan onChange ke state ---
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>
              {isFetchingEquipments ? 'Memuat...' : (equipments.length === 0 ? 'Tidak ada equipment' : 'Pilih Equipment...')}
            </option>
            {equipments.map(eq => (
              <option key={eq.id} value={eq.nama_equipment}>{eq.nama_equipment}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading} 
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Memproses...' : 'Lanjutkan'}
      </button>
    </form>
  );
}
