import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer'; // Impor nodemailer

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

// Konfigurasi "pengirim email" menggunakan Nodemailer dan Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

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
        const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h1 style="color: #28a745;">Work Order Anda Telah Disetujui!</h1>
                <p>Halo <strong>${workOrder.nama_pemohon}</strong>,</p>
                <p>Permintaan Work Order Anda telah disetujui dan akan segera diproses.</p>
                <p><strong>ID Work Order:</strong> ${workOrder.id}</p>
              </div>
            `;
        
        // Gunakan transporter.sendMail untuk mengirim email
        await transporter.sendMail({
          from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
          to: workOrder.email_pemohon,
          subject: `[DISETUJUI] Work Order Anda (ID: ${workOrder.id})`,
          html: emailHtml,
        });
    }
    return NextResponse.redirect(`${appUrl}/approval-success`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error("Error di handle-approval (GET):", errorMessage);
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
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h1 style="color: #dc3545;">Work Order Anda Ditolak</h1>
            <p>Halo <strong>${workOrder.nama_pemohon}</strong>,</p>
            <p>Mohon maaf, permintaan Work Order Anda dengan ID <strong>${id}</strong> telah ditolak dengan alasan:</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin-top: 15px;">
              <p style="margin: 0;"><em>${reason}</em></p>
            </div>
          </div>
        `;
        
        // Gunakan transporter.sendMail untuk mengirim email
        await transporter.sendMail({
          from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
          to: workOrder.email_pemohon,
          subject: `[DITOLAK] Work Order Anda (ID: ${id})`,
          html: emailHtml,
        });
    }
    return NextResponse.json({ message: 'Work Order telah berhasil ditolak dan notifikasi telah dikirim ke pemohon.' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error("Error di handle-approval (POST):", errorMessage);
    return NextResponse.json({ message: `Gagal memproses penolakan: ${errorMessage}` }, { status: 500 });
  }
}