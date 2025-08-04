'use client';

import { FormEvent, useState } from 'react';

export default function StorageForm({ equipmentId }: { equipmentId: string }) {
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
    const jenisMaintenance = formData.getAll('jenis_maintenance');

    const details = {
      storageNo: formData.get('storage_no'),
      jenisMaintenance: jenisMaintenance,
      deskripsi: formData.get('deskripsi'),
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

  // --- PERUBAHAN DI SINI ---
  const storageNoOptions = [
    "107 (20 ft)", "108 (20 ft)",
    "109 (20 ft)", "110 (20 ft)", "111 (20 ft)", "112 (20 ft)", "113 (20 ft)", "115 (20 ft)", "118 (20 ft)",
    "119 (20 ft)", "201 (20 ft)", "203 (20 ft)", "303 (20 ft)", "304 (20 ft)", "305 (20 ft)", "306 (20 ft)",
    "307 (20 ft)", "308 (20 ft)", "501 (20 ft)", "502 (20 ft)", "503 (20 ft)", "504 (20 ft)", "505 (20 ft)",
    "506 (20 ft)", "507 (20 ft)", "508 (20 ft)", "509 (20 ft)", "510 (20 ft)", "511 (20 ft)", "512 (20 ft)",
    "1001 (10 ft)", "1002 (10 ft)", "1004 (10 ft)", "1005 (10 ft)", "1007 (10 ft)", "1008 (10 ft)", "1010 (10 ft)",
    "1011 (10 ft)", "1012 (10 ft)", "1013 (10 ft)", "1014 (10 ft)", "1015 (10 ft)", "1016 (10 ft)", "1017 (10 ft)",
    "1018 (10 ft)", "1019 (10 ft)", "1020 (10 ft)", "1021 (10 ft)", "2001 (10 ft)", "2002 (10 ft)", "2003 (10 ft)",
    "2004 (10 ft)", "3001 (10 ft)", "3002 (10 ft)", "3003 (10 ft)", "3004 (10 ft)", "6001 (10 ft)", "6002 (10 ft)",
    "6003 (10 ft)", "6004 (10 ft)", "EK01 (40 ft)", "EK02 (40 ft)", "EK03 (40 ft)", "EK04 (40 ft)",
    "MX01 (20 ft)", "MX02 (20 ft)", "KR01 (20 ft)"
  ];
  // --- AKHIR PERUBAHAN ---
  
  const maintenanceOptions = [
    "Cover", "Cylinder", "Tubing and Fitting", "Ballvalve", "Pressure Gauge",
    "Frame", "Drain (Condensate)", "PSV (Pressure Safety Valve)",
    "PRD (Pressure Relief Device)", "Receptacle", "Logo/Safety Sign",
    "Painting", "Fabrication"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">02. Storage</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label htmlFor="storage_no" className="block text-base font-semibold text-gray-800">Storage No. *</label>
          <select name="storage_no" id="storage_no" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
            <option value="" disabled>--Pilih--</option>
            {storageNoOptions.map(no => <option key={no} value={no}>{no}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-base font-semibold text-gray-800 mb-4">Jenis Maintenance Storage *</label>
          <div className="space-y-3">
            {maintenanceOptions.map(item => (
              <div key={item} className="flex items-center">
                <input id={`maintenance-${item}`} name="jenis_maintenance" type="checkbox" value={item} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`maintenance-${item}`} className="ml-3 block text-sm text-gray-900">{item}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
          <div>
            <label htmlFor="deskripsi" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance Storage *</label>
            <textarea name="deskripsi" id="deskripsi" rows={4} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" placeholder="Deskripsi berisikan tipe kerusakan, dll..."></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label htmlFor="estimasi_pengerjaan" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Pengerjaan</label>
              <input type="date" name="estimasi_pengerjaan" id="estimasi_pengerjaan" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
            </div>
            <div>
              <label htmlFor="estimasi_selesai" className="block text-base font-semibold text-gray-800">Estimasi Tanggal Selesai</label>
              <input type="date" name="estimasi_selesai" id="estimasi_selesai" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400">
            {isLoading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}
    </div>
  );
}