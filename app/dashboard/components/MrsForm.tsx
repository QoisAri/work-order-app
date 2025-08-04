'use client';

import { FormEvent, useState } from 'react';

export default function MrsForm({ equipmentId }: { equipmentId: string }) {
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
    const kerusakanEquipment = formData.getAll('kerusakan_equipment');
    const kerusakanLainValue = formData.get('kerusakan_lain');
    
    if (kerusakanLainValue) {
      kerusakanEquipment.push(`Yang lain: ${kerusakanLainValue}`);
    }

    const details = {
      nomorMrs: formData.get('nomor_mrs'),
      lokasiMrs: formData.get('lokasi_mrs'),
      kerusakanEquipment: kerusakanEquipment,
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

  const nomorMrsOptions = ["MRS-01", "MRS-02", "MRS-03"];
  const kerusakanOptions = [
    "Scrubber", "Filter", "Aktuator", "Flow Meter", "Tubing and Instrumentation",
    "Piping line", "Regulator", "PSV", "Ball Valve", "Pressure Gauge",
    "Heater", "Heat Exchanger", "Hot Water line", "Hot Water Tank",
    "Hot Water Pump", "Panel Control", "Telemetri"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">03. MRS</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label htmlFor="nomor_mrs" className="block text-base font-semibold text-gray-800">Nomor MRS *</label>
          {/* PERBAIKAN: Menambahkan defaultValue dan text-black */}
          <select name="nomor_mrs" id="nomor_mrs" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
            {/* PERBAIKAN: Menghapus 'selected' */}
            <option value="" disabled>--Pilih--</option>
            {nomorMrsOptions.map(no => <option key={no} value={no}>{no}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label htmlFor="lokasi_mrs" className="block text-base font-semibold text-gray-800">Lokasi MRS *</label>
          <p className="text-sm text-gray-500">Berisikan Inisial Customer</p>
          <input type="text" name="lokasi_mrs" id="lokasi_mrs" required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-base font-semibold text-gray-800 mb-4">Kerusakan Equipment MRS *</label>
          <div className="space-y-3">
            {kerusakanOptions.map(item => (
              <div key={item} className="flex items-center">
                <input id={`kerusakan-${item}`} name="kerusakan_equipment" type="checkbox" value={item} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`kerusakan-${item}`} className="ml-3 block text-sm text-gray-900">{item}</label>
              </div>
            ))}
            <div className="flex items-center">
              <input id="kerusakan-lain-cb" name="kerusakan_equipment" type="checkbox" value="Yang lain" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="kerusakan-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
              <input type="text" name="kerusakan_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm text-black placeholder:text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* PERBAIKAN: Menghapus bagian yang duplikat */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
            <div>
                <label htmlFor="deskripsi_maintenance" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance *</label>
                <p className="text-sm text-gray-500">Deskripsi berisikan type kerusakan, jenis part equipment, spek equipment, atau penyebabnya,</p>
                <textarea name="deskripsi_maintenance" id="deskripsi_maintenance" rows={4} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500"></textarea>
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