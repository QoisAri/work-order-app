import CreateWorkOrderForm from '@/app/components/CreateWorkOrderForm';
// 1. Impor createServerClient dari paket yang benar
import { createServerClient } from '@supabase/ssr'; 
import { cookies } from 'next/headers';

// Tipe data ini bisa tetap di sini
type JobType = { id: string; nama_pekerjaan: string };
type Department = { id: string; nama_depart: string };

// Fungsi untuk mengambil data dari Supabase
async function getFormData() {
    // 2. Pindahkan inisialisasi Supabase ke dalam fungsi ini
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            // 3. Berikan implementasi cookies yang lengkap
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                // set dan remove juga bisa ditambahkan jika diperlukan, 
                // tapi untuk membaca data (select), 'get' sudah cukup.
            },
        }
    );

    const { data: jobTypes, error: jobTypesError } = await supabase.from('job_types').select('*');
    const { data: departments, error: departmentsError } = await supabase.from('departments').select('*');

    if (jobTypesError || departmentsError) {
        console.error('Gagal mengambil data form:', jobTypesError || departmentsError);
        return { jobTypes: [], departments: [] };
    }

    return { jobTypes: jobTypes || [], departments: departments || [] };
}

export default async function SubmitWorkOrderPage() {
    // Ambil data saat server merender halaman
    const { jobTypes, departments } = await getFormData();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <CreateWorkOrderForm jobTypes={jobTypes} departments={departments} />
        </div>
    );
}