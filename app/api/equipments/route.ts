// app/api/equipments/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const jobTypeId = searchParams.get('jobTypeId');

  if (!jobTypeId) {
    return NextResponse.json({ error: 'jobTypeId diperlukan' }, { status: 400 });
  }

  // Logika untuk mengambil data equipment
  // ASUMSI: Anda punya tabel relasi antara job_types dan equipments
  // Jika tidak, sesuaikan query ini dengan struktur database Anda.
  // Contoh sederhana: Ambil semua equipment jika tidak ada relasi spesifik.
  const { data, error } = await supabase
    .from('equipments')
    .select('*'); 
    // .eq('job_type_id', jobTypeId); // Aktifkan ini jika ada kolom relasi

  if (error) {
    console.error('Error fetching equipments:', error);
    return NextResponse.json({ error: 'Gagal mengambil data equipment' }, { status: 500 });
  }

  return NextResponse.json(data);
}