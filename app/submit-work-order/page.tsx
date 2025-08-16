import CreateWorkOrderForm from '@/app/components/CreateWorkOrderForm';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';

async function getData() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } as CookieOptions }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: jobTypes } = await supabase.from('job_types').select('*');
  const { data: departments } = await supabase.from('sub_departments').select('*');

  const { data: profile } = user 
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null };
  
  const initialData = {
      ...profile,
      email: user?.email || '',
  };

  return { 
      jobTypes: jobTypes || [], 
      departments: departments || [],
      initialData: initialData
  };
}

export default async function SubmitWorkOrderPage() {
    const { jobTypes, departments, initialData } = await getData();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <CreateWorkOrderForm 
              jobTypes={jobTypes} 
              departments={departments}
              initialData={initialData}
            />
        </div>
    );
}