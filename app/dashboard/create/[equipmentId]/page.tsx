'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Impor semua komponen form spesifik Anda
import MrsForm from '../../components/MrsForm';
import LandBuildingForm from '../../components/LandBuildingForm';
import CompressorForm from '../../components/CompressorForm';
import StorageForm from '../../components/StorageForm';
import SafetyEquipmentForm from '../../components/SafetyEquipmentForm';
import UtilityForm from '../../components/UtilityForm';
import SurveyForm from '../../components/SurveyForm';
import OtherForm from '../../components/OtherForm';

type Equipment = {
  id: string;
  nama_equipment: string;
} | null;

const equipmentFormMap: { [key: string]: React.ComponentType<any> } = {
  'MRS': MrsForm,
  'Land and Building': LandBuildingForm,
  'Compressor': CompressorForm,
  'Storage': StorageForm,
  'Safety Equipment': SafetyEquipmentForm,
  'Utility (genset, LVMDP, Trafo)': UtilityForm,
  'Survey': SurveyForm,
  'Other': OtherForm,
};

export default function CreateWorkOrderPageById() {
  const params = useParams();
  const equipmentId = params.equipmentId as string;
  
  const [equipment, setEquipment] = useState<Equipment>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!equipmentId) {
      setLoading(false);
      setError("Equipment ID tidak ditemukan di URL.");
      return;
    }

    const getEquipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from('equipments')
          .select('id, nama_equipment')
          .eq('id', equipmentId)
          .single();

        if (dbError || !data) {
          throw new Error(`Gagal menemukan data untuk equipment ID: "${equipmentId}"`);
        }
        setEquipment(data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getEquipment();
  }, [equipmentId]);

  // --- TAMPILAN LOADING YANG LEBIH BAIK ---
  if (loading) {
    return (
        <div className="flex justify-center items-center w-full h-96">
            <p className="text-lg text-gray-500">Memuat formulir...</p>
        </div>
    );
  }

  // --- TAMPILAN ERROR YANG LEBIH BAIK ---
  if (error || !equipment) {
    return (
      <div className="p-8">
        <div role="alert" className="rounded-xl border border-gray-200 bg-white p-6 max-w-lg mx-auto shadow-md">
          <strong className="block font-medium text-red-700">Terjadi Kesalahan</strong>
          <p className="mt-2 text-sm text-gray-600">{error || "Equipment tidak ditemukan."}</p>
        </div>
      </div>
    );
  }
  
  const FormComponent = equipmentFormMap[equipment.nama_equipment];

  if (!FormComponent) {
    return (
        <div className="p-8">
            <h1 className="text-xl font-bold">Form untuk &quot;{equipment.nama_equipment}&quot; belum dibuat.</h1>
        </div>
    );
  }

  // --- TAMPILAN UTAMA YANG LEBIH RAPI ---
  return (
    <div className="w-full">
        {/* Header Halaman */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Formulir Work Order
          </h1>
          <p className="mt-2 text-md text-gray-600">
            Silakan lengkapi detail untuk equipment <span className="font-semibold text-indigo-600">{equipment.nama_equipment}</span>.
          </p>
        </div>
        
        {/* Komponen Form dirender di sini */}
        <FormComponent />
    </div>
  );
}
