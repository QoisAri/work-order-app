// app/api/handle-approval/route.ts

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
// Impor library untuk mengirim email, contohnya Resend atau Nodemailer
// import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inisialisasi library email
// const resend = new Resend(process.env.RESEND_API_KEY);

// --- FUNGSI UNTUK MEMBUAT NOMOR WO ---
// Anda bisa kustomisasi formatnya sesuai kebutuhan.
// Contoh: [Tahun]/[Bulan]/[Nomor Urut]
async function generateWoNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // "25"
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // "08"

  // Dapatkan nomor urut terakhir di bulan ini
  const { data, error, count } = await supabaseAdmin
    .from('work_orders')
    .select('id', { count: 'exact' })
    .like('wo_number', `${year}/${month}/%`);

  if (error) {
    console.error("Error fetching WO count:", error);
    // Fallback jika terjadi error
    return `${year}/${month}/ERR`;
  }

  const newSequence = ((count ?? 0) + 1).toString().padStart(3, '0'); // "001", "002", dst.
  return `${year}/${month}/${newSequence}`; // Hasil: 25/08/001
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action'); // 'approve' atau 'reject'

  if (!id || !action) {
    return new NextResponse('Parameter tidak lengkap (membutuhkan id dan action).', { status: 400 });
  }

  // 1. Ambil data WO yang akan di-update
  const { data: wo, error: fetchError } = await supabaseAdmin
    .from('work_orders')
    .select('*, users!inner(*)') // Ambil data pemohon (users) untuk kirim email
    .eq('id', id)
    .single();

  if (fetchError || !wo) {
    return new NextResponse('Work Order tidak ditemukan.', { status: 404 });
  }

  // --- LOGIKA PERSETUJUAN ---
  if (action === 'approve') {
    // Jika sudah disetujui sebelumnya, jangan proses lagi
    if (wo.status === 'approved') {
        return NextResponse.redirect(new URL('/approval-success?message=WO ini sudah pernah disetujui.', request.url));
    }
    
    // 2. Buat Nomor WO baru
    const newWoNumber = await generateWoNumber();

    // 3. Update status dan tambahkan wo_number di database
    const { error: updateError } = await supabaseAdmin
      .from('work_orders')
      .update({ status: 'approved', wo_number: newWoNumber, approved_at: new Date() })
      .eq('id', id);

    if (updateError) {
      return new NextResponse(`Gagal update database: ${updateError.message}`, { status: 500 });
    }

    // 4. Kirim email notifikasi ke PEMOHON bahwa WO disetujui
    //    Email ini berisi wo_number dan link untuk download PDF
    try {
        /*
        await resend.emails.send({
            from: 'Sistem Notifikasi <no-reply@domain-anda.com>',
            to: wo.users.email,
            subject: `Work Order Disetujui: ${newWoNumber}`,
            html: `
                <h1>Work Order Anda Disetujui!</h1>
                <p>Halo ${wo.nama_pemohon},</p>
                <p>Work order yang Anda ajukan telah disetujui dengan detail sebagai berikut:</p>
                <p><strong>Nomor Work Order: ${newWoNumber}</strong></p>
                <p>Silakan unduh dokumen PDF melalui tautan di bawah ini:</p>
                <a href="https://domain-anda.com/api/generate-pdf?id=${id}" style="...">Unduh PDF Work Order</a>
            `
        });
        */
        console.log(`(Simulasi) Email persetujuan dikirim ke ${wo.users.email} dengan WO Number ${newWoNumber}`);

    } catch (emailError) {
        console.error("Gagal kirim email persetujuan:", emailError);
    }
    
    // 5. Redirect ke halaman sukses
    return NextResponse.redirect(new URL('/approval-success', request.url));

  } else if (action === 'reject') {
    // Jika sudah pernah diproses, jangan proses lagi
    if (wo.status === 'rejected' || wo.status === 'approved') {
         return NextResponse.redirect(new URL('/approval-rejected?message=WO ini sudah pernah diproses.', request.url));
    }

    // 2. Update status menjadi 'rejected'
    const { error: updateError } = await supabaseAdmin
      .from('work_orders')
      .update({ status: 'rejected' })
      .eq('id', id);
      
    if (updateError) {
      return new NextResponse(`Gagal update database: ${updateError.message}`, { status: 500 });
    }

    // 3. Kirim email notifikasi ke PEMOHON bahwa WO ditolak (tanpa wo_number)
    try {
        /*
        await resend.emails.send({
            from: 'Sistem Notifikasi <no-reply@domain-anda.com>',
            to: wo.users.email,
            subject: `Work Order Ditolak`,
            html: `
                <h1>Work Order Anda Ditolak</h1>
                <p>Halo ${wo.nama_pemohon},</p>
                <p>Mohon maaf, work order yang Anda ajukan telah ditolak.</p>
                <p>Silakan hubungi admin untuk informasi lebih lanjut.</p>
            `
        });
        */
        console.log(`(Simulasi) Email penolakan dikirim ke ${wo.users.email}`);

    } catch (emailError) {
        console.error("Gagal kirim email penolakan:", emailError);
    }
    
    // 4. Redirect ke halaman penolakan sukses
    return NextResponse.redirect(new URL('/approval-rejected', request.url));
  }

  return new NextResponse('Aksi tidak valid.', { status: 400 });
}