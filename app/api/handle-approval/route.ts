import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

// Fungsi GET untuk menangani persetujuan
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action');

  if (!id || action !== 'approved') {
    return NextResponse.json({ message: 'Parameter tidak valid.' }, { status: 400 });
  }

  try {
    await supabaseAdmin.from('work_orders').update({ status: 'approved' }).eq('id', id);
    const { data: workOrder } = await supabaseAdmin.from('work_orders').select('*, equipments(nama_equipment)').eq('id', id).single();
    
    if (workOrder) {
        const emailHtml = `...`; // Isi email persetujuan seperti sebelumnya

        // --- PERBAIKAN DI SINI: Tangkap balasan dari Resend ---
        const { data, error: emailError } = await resend.emails.send({
          from: 'Sistem Work Order <onboarding@resend.dev>',
          to: [workOrder.email_pemohon],
          subject: `[DISETUJUI] Work Order Anda (ID: ${workOrder.id})`,
          html: emailHtml,
        });

        // Jika ada error dari Resend, catat di log Vercel
        if (emailError) {
          console.error(`Resend API Error (Approval):`, emailError);
        }
    }
    return NextResponse.redirect(`${appUrl}/approval-success`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error("Catch Block Error (GET):", errorMessage);
    return new NextResponse(`Terjadi kesalahan: ${errorMessage}`, { status: 500 });
  }
}

// Fungsi POST untuk menangani penolakan
export async function POST(request: NextRequest) {
  try {
    const { id, action, reason } = await request.json();
    if (!id || action !== 'rejected' || !reason) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }
    await supabaseAdmin.from('work_orders').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
    const { data: workOrder } = await supabaseAdmin.from('work_orders').select('email_pemohon, nama_pemohon').eq('id', id).single();

    if (workOrder) {
        const emailHtml = `...`; // Isi email penolakan seperti sebelumnya

        // --- PERBAIKAN DI SINI: Tangkap balasan dari Resend ---
        const { data, error: emailError } = await resend.emails.send({
          from: 'Sistem Work Order <onboarding@resend.dev>',
          to: [workOrder.email_pemohon],
          subject: `[DITOLAK] Work Order Anda (ID: ${id})`,
          html: emailHtml,
        });
        
        // Jika ada error dari Resend, catat di log Vercel
        if (emailError) {
          console.error(`Resend API Error (Rejection):`, emailError);
        }
    }
    return NextResponse.json({ message: 'Work Order telah berhasil ditolak dan notifikasi telah dikirim ke pemohon.' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error("Catch Block Error (POST):", errorMessage);
    return NextResponse.json({ message: `Gagal memproses penolakan: ${errorMessage}` }, { status: 500 });
  }
}