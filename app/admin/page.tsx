import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminPage() {
    const supabase = createClient();

    const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`id, created_at, nama_pemohon, sub_depart, equipments ( nama_equipment )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
    
    // ... (kode JSX untuk tabel dari jawaban sebelumnya, tidak berubah) ...
    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {/* ... tabel ... */}
        </div>
    );
}