'use client';

import { FormEvent, useState } from 'react';

export default function LandBuildingForm({ equipmentId }: { equipmentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const userInfo = JSON.parse(sessionStorage.getItem('workOrderUserInfo') || '{}');
    if (!userInfo.email) {
      setMessage('Error: Sesi tidak ditemukan. Silakan mulai dari awal.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const equipmentMaintenance = formData.getAll('equipment_maintenance');
    const maintenanceLainValue = formData.get('maintenance_lain');

    if (maintenanceLainValue) {
        equipmentMaintenance.push(`Yang lain: ${maintenanceLainValue}`);
    }

    const details = {
      lokasiPerbaikan: formData.get('lokasi_perbaikan'),
      equipmentMaintenance: equipmentMaintenance,
      deskripsiMaintenance: formData.get('deskripsi_maintenance'),
      estimasiPengerjaan: formData.get('estimasi_pengerjaan'),
      estimasiSelesai: formData.get('estimasi_selesai'),
    };

    const finalData = {
      ...userInfo,
      equipment_id: equipmentId,
      details: details,
    };
    
    const response = await fetch('/api/submit-work-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });
    const result = await response.json();
    setMessage(result.message);
    setIsLoading(false);
    if (response.ok) {
        sessionStorage.removeItem('workOrderUserInfo');
    }
  };

  const lokasiOptions = ["Ms. Cikampek", "Ms. Cikande", "Ms. PSJ", "Head Office"];
  const maintenanceOptions = [
    "Pintu", "Ruangan", "Drainase", "Atap", "AC", "Jendela",
    "Meja/Kursi", "Lantai", "Plafon", "Penerangan"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">05. Land Of Building</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label htmlFor="lokasi_perbaikan" className="block text-base font-semibold text-gray-800">Lokasi Perbaikan Land of Building *</label>
          <select name="lokasi_perbaikan" id="lokasi_perbaikan" required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="" disabled selected>--Pilih--</option>
            {lokasiOptions.map(lokasi => <option key={lokasi} value={lokasi}>{lokasi}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-base font-semibold text-gray-800 mb-4">Equipment Maintenance Land of Building *</label>
          <div className="space-y-3">
            {maintenanceOptions.map(item => (
              <div key={item} className="flex items-center">
                <input id={`maintenance-${item}`} name="equipment_maintenance" type="radio" value={item} required className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`maintenance-${item}`} className="ml-3 block text-sm text-gray-900">{item}</label>
              </div>
            ))}
            <div className="flex items-center">
              <input id="maintenance-lain-cb" name="equipment_maintenance" type="radio" value="Yang lain" className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="maintenance-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
              <input type="text" name="maintenance_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
            <div>
                <label htmlFor="deskripsi_maintenance" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance Land of Building *</label>
                <textarea name="deskripsi_maintenance" id="deskripsi_maintenance" rows={5} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="estimasi_pengerjaan" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Pengerjaan</label>
                    <input type="date" name="estimasi_pengerjaan" id="estimasi_pengerjaan" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="estimasi_selesai" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Selesai</label>
                    <input type="date" name="estimasi_selesai" id="estimasi_selesai" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400">
            {isLoading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}
    </div>
  );
}