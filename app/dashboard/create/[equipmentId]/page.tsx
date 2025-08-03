'use client'; // 1. Tambahkan ini untuk mengubahnya menjadi Client Component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // 2. Impor hook baru
import { supabase } from "@/lib/supabaseClient";
import CompressorForm from "../../components/CompressorForm";
import StorageForm from "../../components/StorageForm";
import MrsForm from "../../components/MrsForm";
import SafetyEquipmentForm from "../../components/SafetyEquipmentForm";
import UtilityForm from "../../components/UtilityForm";
import LandBuildingForm from "../../components/LandBuildingForm";
import SurveyForm from "../../components/SurveyForm";
import OtherForm from "../../components/OtherForm";

// Definisikan tipe untuk data equipment
type Equipment = {
  nama_equipment: string;
} | null;

export default function CreateWorkOrderPage() {
  const params = useParams(); // 3. Gunakan hook untuk mendapatkan parameter URL
  const equipmentId = params.equipmentId as string;

  // 4. Gunakan state untuk loading dan data equipment
  const [equipment, setEquipment] = useState<Equipment>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 5. Gunakan useEffect untuk mengambil data setelah halaman dimuat di browser
  useEffect(() => {
    if (!equipmentId) return;

    const getEquipment = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('equipments')
        .select('nama_equipment')
        .eq('id', equipmentId)
        .single();

      if (error || !data) {
        setError("Gagal menemukan data equipment.");
      } else {
        setEquipment(data);
      }
      setLoading(false);
    };

    getEquipment();
  }, [equipmentId]); // Efek ini akan berjalan setiap kali equipmentId berubah

  // Tampilkan pesan loading saat data sedang diambil
  if (loading) {
    return <div className="bg-white p-8 rounded-lg shadow-md">Memuat form...</div>;
  }

  // Tampilkan pesan error jika data tidak ditemukan
  if (error || !equipment) {
    return <div className="bg-white p-8 rounded-lg shadow-md"><p className="text-red-500">{error || "Equipment tidak ditemukan."}</p></div>;
  }
  
  // Fungsi untuk memilih komponen form mana yang akan dirender
  const renderForm = () => {
    switch (equipment.nama_equipment) {
      case 'Compressor':
        return <CompressorForm equipmentId={equipmentId} />;
      case 'Storage':
        return <StorageForm equipmentId={equipmentId} />;
      case 'MRS':
        return <MrsForm equipmentId={equipmentId} />;
      case 'Safety Equipment':
        return <SafetyEquipmentForm equipmentId={equipmentId} />;
      case 'Utility (genset, LVMDP, Trafo)':
        return <UtilityForm equipmentId={equipmentId} />;
      case 'Land and Building':
        return <LandBuildingForm equipmentId={equipmentId} />;
      case 'Survey':
        return <SurveyForm equipmentId={equipmentId} />;
      case 'Other':
        return <OtherForm equipmentId={equipmentId} />;
      default:
        return (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-xl font-bold">Form untuk &quot;{equipment.nama_equipment}&quot; belum dibuat.</h1>
            <p className="mt-2 text-gray-600">Silakan hubungi administrator.</p>
          </div>
        );
    }
  };

  return (
    <div>
      {renderForm()}
    </div>
  );
}