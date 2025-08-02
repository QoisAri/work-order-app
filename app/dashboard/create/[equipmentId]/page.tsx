import { supabase } from "@/lib/supabaseClient";
import CompressorForm from "../../components/CompressorForm";
import StorageForm from "../../components/StorageForm";
import MrsForm from "../../components/MrsForm";
import SafetyEquipmentForm from "../../components/SafetyEquipmentForm";
import UtilityForm from "../../components/UtilityForm";
import LandBuildingForm from "../../components/LandBuildingForm";
import SurveyForm from "../../components/SurveyForm";
import OtherForm from "../../components/OtherForm";
import { notFound } from "next/navigation";

async function getEquipment(id: string) {
  const { data, error } = await supabase
    .from('equipments')
    .select('nama_equipment')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export default async function CreateWorkOrderPage({ params }: { params: { equipmentId: string } }) {
  const equipment = await getEquipment(params.equipmentId);

  if (!equipment) {
    notFound();
  }
  
  const renderForm = () => {
    switch (equipment.nama_equipment) {
      case 'Compressor':
        return <CompressorForm equipmentId={params.equipmentId} />;
      case 'Storage':
        return <StorageForm equipmentId={params.equipmentId} />;
      case 'MRS':
        return <MrsForm equipmentId={params.equipmentId} />;
      case 'Safety Equipment':
        return <SafetyEquipmentForm equipmentId={params.equipmentId} />;
      case 'Utility (genset, LVMDP, Trafo)':
        return <UtilityForm equipmentId={params.equipmentId} />;
      case 'Land and Building':
        return <LandBuildingForm equipmentId={params.equipmentId} />;
      case 'Survey':
        return <SurveyForm equipmentId={params.equipmentId} />;
      case 'Other':
        return <OtherForm equipmentId={params.equipmentId} />;
      default:
        return (
          <div className="bg-white p-8 rounded-lg shadow-md">
            {/* PERBAIKAN DI SINI: Mengganti " dengan &quot; */}
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
