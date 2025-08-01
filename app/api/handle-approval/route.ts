import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action');

  if (!id || !action || (action !== 'approved' && action !== 'rejected')) {
    return NextResponse.json({ message: 'Parameter tidak valid.' }, { status: 400 });
  }

  try {
    // 1. Update status work order di database
    const { error: updateError } = await supabaseAdmin
      .from('work_orders')
      .update({ status: action })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Gagal update status: ${updateError.message}`);
    }

    // --- PERUBAHAN UTAMA DI SINI ---
    // 2. Jika tindakan adalah 'approved', kirim email konfirmasi ke pemohon
    if (action === 'approved') {
        // Ambil detail lengkap work order dari database untuk dikirim di email
        const { data: workOrder, error: fetchError } = await supabaseAdmin
            .from('work_orders')
            .select('*, equipments(nama_equipment)') // Ambil juga nama equipment
            .eq('id', id)
            .single();

        // Jika gagal mengambil data, lewati pengiriman email agar tidak error
        if (fetchError || !workOrder) {
            console.error("Gagal mengambil detail WO untuk email konfirmasi:", fetchError?.message);
        } else {
            // Buat isi email konfirmasi
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h1 style="color: #28a745;">Work Order Anda Telah Disetujui!</h1>
                <p>Halo <strong>${workOrder.nama_pemohon}</strong>,</p>
                <p>Permintaan Work Order Anda dengan detail di bawah ini telah disetujui dan akan segera diproses.</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <h3 style="color: #333;">Detail Permintaan:</h3>
                <ul style="list-style-type: none; padding: 0;">
                  <li><strong>ID Work Order:</strong> ${workOrder.id}</li>
                  <li><strong>Equipment:</strong> ${workOrder.equipments.nama_equipment}</li>
                  <li><strong>Deskripsi:</strong> ${workOrder.details.deskripsi || workOrder.details.deskripsiMaintenance || workOrder.details.deskripsiSafetyEquipment || 'Tidak ada deskripsi'}</li>
                </ul>
                <p style="margin-top: 20px;">Terima kasih.</p>
              </div>
            `;

            // Kirim email ke pemohon
            await resend.emails.send({
              from: 'Sistem Work Order <onboarding@resend.dev>',
              to: [workOrder.email_pemohon], // Kirim ke email pemohon
              subject: `[DISETUJUI] Work Order Anda (ID: ${workOrder.id})`,
              html: emailHtml,
            });
        }
    }
    // --- AKHIR PERUBAHAN ---

    // 3. Arahkan approver ke halaman yang sesuai
    if (action === 'approved') {
        return NextResponse.redirect(`${appUrl}/approval-success`);
    } else {
        return NextResponse.redirect(`${appUrl}/approval-rejected`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error("Error di handle-approval:", errorMessage);
    // Mungkin arahkan ke halaman error umum
    return new NextResponse(`Terjadi kesalahan: ${errorMessage}`, { status: 500 });
  }
}