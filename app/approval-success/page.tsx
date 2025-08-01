import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

// Fungsi GET untuk menangani persetujuan (tetap sama)
export async function GET(request: NextRequest) {
  // ... (kode GET dari jawaban sebelumnya tidak berubah sama sekali) ...
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
        const emailHtml = `...`; // Isi email persetujuan
        await resend.emails.send({
          from: 'Sistem Work Order <onboarding@resend.dev>',
          to: [workOrder.email_pemohon],
          subject: `[DISETUJUI] Work Order Anda (ID: ${workOrder.id})`,
          html: emailHtml,
        });
    }
    return NextResponse.redirect(`${appUrl}/approval-success`);
  } catch (error) {
    // ... handling error ...
  }
}

// --- FUNGSI BARU UNTUK MENANGANI PENOLAKAN ---
export async function POST(request: NextRequest) {
  try {
    const { id, action, reason } = await request.json();

    if (!id || action !== 'rejected' || !reason) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    // 1. Update status dan simpan alasan penolakan di database
    const { error: updateError } = await supabaseAdmin
      .from('work_orders')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Gagal update status penolakan: ${updateError.message}`);
    }

    // 2. Ambil detail WO untuk dikirim di email
    const { data: workOrder } = await supabaseAdmin
      .from('work_orders')
      .select('email_pemohon, nama_pemohon')
      .eq('id', id)
      .single();

    if (!workOrder) {
        // Jika WO tidak ditemukan, tetap kembalikan sukses agar admin tidak bingung
        return NextResponse.json({ message: 'Work Order berhasil ditolak, namun email notifikasi gagal dikirim (data tidak ditemukan).' });
    }

    // 3. Kirim email notifikasi penolakan ke pemohon
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; ...">
        <h1 style="color: #dc3545;">Work Order Anda Ditolak</h1>
        <p>Halo <strong>${workOrder.nama_pemohon}</strong>,</p>
        <p>Mohon maaf, permintaan Work Order Anda dengan ID <strong>${id}</strong> telah ditolak dengan alasan sebagai berikut:</p>
        <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin-top: 15px;">
          <p style="margin: 0;"><em>${reason}</em></p>
        </div>
        <p style="margin-top: 20px;">Silakan hubungi administrator jika Anda memiliki pertanyaan.</p>
      </div>
    `;

    await resend.emails.send({
      from: 'Sistem Work Order <onboarding@resend.dev>',
      to: [workOrder.email_pemohon],
      subject: `[DITOLAK] Work Order Anda (ID: ${id})`,
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Work Order telah berhasil ditolak dan notifikasi telah dikirim ke pemohon.' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error("Error di handle-approval (POST):", errorMessage);
    return NextResponse.json({ message: `Gagal memproses penolakan: ${errorMessage}` }, { status: 500 });
  }
}