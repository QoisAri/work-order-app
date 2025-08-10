import CreateWorkOrderForm from '@/app/components/CreateWorkOrderForm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Fungsi untuk mengambil data dari Supabase
async function getFormData() {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );

    // Pastikan kedua nama tabel ini sudah benar
    const { data: jobTypes, error: jobTypesError } = await supabase.from('job_types').select('*');
    const { data: departments, error: departmentsError } = await supabase.from('sub_departments').select('*'); // PERBAIKAN DI SINI

    if (jobTypesError || departmentsError) {
        console.error('Gagal mengambil data form:', jobTypesError || departmentsError);
        return { jobTypes: [], departments: [] };
    }

    return { jobTypes: jobTypes || [], departments: departments || [] };
}

export default async function SubmitWorkOrderPage() {
    const { jobTypes, departments } = await getFormData();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <CreateWorkOrderForm jobTypes={jobTypes} departments={departments} />
        </div>
    );
}