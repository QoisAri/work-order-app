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
  
  // --- PERBAIKAN #1: Nama parameter harus cocok persis dengan nama folder -> [equipmentId] ---
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

  if (loading) {
    return <div className="p-8">Memuat form...</div>;
  }

  if (error || !equipment) {
    return (
      <div className="p-8">
        <div role="alert" className="rounded border-s-4 border-red-500 bg-red-50 p-4">
          <strong className="block font-medium text-red-800">{error || "Equipment tidak ditemukan."}</strong>
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

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* --- PERBAIKAN #2: Hapus semua props dari sini --- */}
      <FormComponent />
    </div>
  );
}
