'use client';

import { FormEvent, useState } from 'react';

export default function CompressorForm({ equipmentId }: { equipmentId: string }) {
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
    
    const lokasiPekerjaan = formData.getAll('lokasi');
    const jenisKerusakan = formData.getAll('jenis_kerusakan');
    const lokasiLainValue = formData.get('lokasi_lain');
    const kerusakanLainValue = formData.get('kerusakan_lain');
    
    if (lokasiLainValue) lokasiPekerjaan.push(`Yang lain: ${lokasiLainValue}`);
    if (kerusakanLainValue) jenisKerusakan.push(`Yang lain: ${kerusakanLainValue}`);

    const details = {
      lokasiPekerjaan: lokasiPekerjaan,
      noCompressor: formData.get('no_compressor'),
      jenisKerusakan: jenisKerusakan,
      runningHours: formData.get('running_hours'),
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

  const lokasiOptions = ["PSJ", "Cikampek", "Cikande"];
  const noCompressorOptions = ["C-001", "C-002", "C-003"];
  const kerusakanOptions = [
    "Gas Kompressor", "Gas Engine Driven or Electric Motor Driven (Included Transmition System)", "Filter Inlet",
    "Filter Outlet", "Aktuator", "Water Pump", "Motor Gas Cooler", "Transmitter",
    "PLC", "HMI", "Power Supply", "Kontaktor", "Air Compressor", "Dispenser",
    "Flowmeter", "PSV", "Maintenance 1.000 Hr", "Maintenance 2.000 Hr",
    "Maintenance 4.000 Hr", "Maintenance 8.000 Hr", "Maintenance 16.000Hr", "Overhaul"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">01 Compressor</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-base font-semibold text-gray-800 mb-4">Lokasi Pekerjaan Kompressor *</label>
          <div className="space-y-3">
            {lokasiOptions.map(lokasi => (
              <div key={lokasi} className="flex items-center">
                <input id={`lokasi-${lokasi}`} name="lokasi" type="checkbox" value={lokasi} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`lokasi-${lokasi}`} className="ml-3 block text-sm text-gray-900">{lokasi}</label>
              </div>
            ))}
            <div className="flex items-center">
              <input id="lokasi-lain-cb" name="lokasi" type="checkbox" value="Yang lain" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="lokasi-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
              <input type="text" name="lokasi_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm text-black placeholder:text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <label htmlFor="no_compressor" className="block text-base font-semibold text-gray-800">No. Compressor *</label>
            {/* PERBAIKAN: Menambahkan defaultValue dan text-black */}
            <select name="no_compressor" id="no_compressor" required defaultValue="" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black">
                {/* PERBAIKAN: Menghapus 'selected' */}
                <option value="" disabled>--Pilih--</option>
                {noCompressorOptions.map(no => <option key={no} value={no}>{no}</option>)}
            </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <label className="block text-base font-semibold text-gray-800 mb-4">Jenis Kerusakan *</label>
            <div className="space-y-3">
                {kerusakanOptions.map(kerusakan => (
                    <div key={kerusakan} className="flex items-center">
                        <input id={`kerusakan-${kerusakan}`} name="jenis_kerusakan" type="checkbox" value={kerusakan} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor={`kerusakan-${kerusakan}`} className="ml-3 block text-sm text-gray-900">{kerusakan}</label>
                    </div>
                ))}
                <div className="flex items-center">
                    <input id="kerusakan-lain-cb" name="jenis_kerusakan" type="checkbox" value="Yang lain" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="kerusakan-lain-cb" className="ml-3 block text-sm text-gray-900">Yang lain:</label>
                    <input type="text" name="kerusakan_lain" className="ml-2 w-48 rounded-md border-gray-300 shadow-sm text-sm text-black placeholder:text-gray-500" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
            <div>
                <label htmlFor="running_hours" className="block text-base font-semibold text-gray-800">Running Hours</label>
                <input type="text" name="running_hours" id="running_hours" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" />
            </div>
            <div>
                <label htmlFor="deskripsi" className="block text-base font-semibold text-gray-800">Deskripsi Maintenance Compressor *</label>
                <textarea name="deskripsi" id="deskripsi" rows={4} required className="mt-2 block w-full rounded-md border-gray-300 shadow-sm text-black placeholder:text-gray-500" placeholder="Deskripsi berisikan tipe kerusakan, jenis part equipment, atau penyebabnya..."></textarea>
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
            {isLoading ? 'Mengirim...' : 'Submit & Kirim Email'}
          </button>
        </div>
      </form>
      {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}
    </div>
  );
}