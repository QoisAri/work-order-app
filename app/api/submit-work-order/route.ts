import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const emailTujuan = 'cngworkshop25@gmail.com';
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

function formatDetailsToHtml(details: Record<string, any>) {
    let tableRows = '';
    for (const key in details) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let value = details[key];
        if (Array.isArray(value) && value.length > 0) {
            value = `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else if (!value) {
            value = 'Tidak diisi';
        }
        tableRows += `<tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; text-transform: capitalize;">${formattedKey}</td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
    }
    return `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">${tableRows}</table>`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let userId: string;

    const { data: existingUser } = await supabaseAdmin.from('users').select('id').eq('email', body.email).single();
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser } = await supabaseAdmin.from('users').insert({ nama_lengkap: body.nama, email: body.email, sub_depart: body.sub_depart, role: 'pemohon' }).select('id').single();
      if (!newUser) throw new Error('Gagal membuat user baru.');
      userId = newUser.id;
    }

    const { data: jobType, error: jobError } = await supabaseAdmin.from('job_types').select('nama_pekerjaan').eq('id', body.job_type_id).single();
    if (jobError) throw new Error(`Gagal mengambil jenis pekerjaan: ${jobError.message}`);
    const namaPekerjaan = jobType?.nama_pekerjaan || 'Tidak diketahui';

    // --- BLOK BARU: GENERATE WO NUMBER ---
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // UBAH: Mengambil 2 digit terakhir tahun (25)
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${year}/${month}`; // UBAH: Menggunakan format YY/MM

    const { data: lastWo } = await supabaseAdmin
      .from('work_orders')
      .select('wo_number')
      .like('wo_number', `${prefix}/%`) // UBAH: Mencari dengan format baru
      .order('wo_number', { ascending: false })
      .limit(1)
      .single();

    let newSequence = 1;
    if (lastWo) {
      const lastSequence = parseInt(lastWo.wo_number.split('/')[2], 10); // UBAH: Memisahkan dengan '/'
      newSequence = lastSequence + 1;
    }
    
    const newWoNumber = `${prefix}/${newSequence.toString().padStart(3, '0')}`;
    // --- AKHIR BLOK BARU ---


    const { data: woData, error: dbError } = await supabaseAdmin
      .from('work_orders')
      .insert({
        wo_number: newWoNumber, // <-- SIMPAN NOMOR WO BARU
        nama_pemohon: body.nama, email_pemohon: body.email, no_wa_pemohon: body.no_wa,
        sub_depart: body.sub_depart, job_type_id: body.job_type_id, equipment_id: body.equipment_id,
        status: 'pending', details: body.details, user_id: userId,
       })
      .select()
      .single();

    if (dbError || !woData) {
      throw new Error(`Database Error: ${dbError?.message || 'Gagal menyimpan work order'}`);
    }

    const approveUrl = `${appUrl}/api/handle-approval?id=${woData.id}&action=approved`;
    const rejectUrl = `${appUrl}/reject-form?id=${woData.id}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h1 style="color: #333;">Work Order Baru Diterima</h1>
        
        {/* --- UBAH DARI ID MENJADI NOMOR WO --- */}
        <p><strong>Nomor Work Order:</strong> ${newWoNumber}</p>
        
        <hr style="border: none; border-top: 1px solid #eee;">
        <h3 style="color: #333;">Detail Pemohon:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Nama:</strong> ${body.nama}</li>
          <li><strong>Email:</strong> ${body.email}</li>
          <li><strong>Departemen:</strong> ${body.sub_depart}</li>
          <li><strong>Jenis Pekerjaan:</strong> ${namaPekerjaan}</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #eee;">
        <h3 style="color: #333;">Detail Pekerjaan:</h3>
        ${formatDetailsToHtml(body.details)}
        <hr style="border: none; border-top: 1px solid #eee;">
        <h3 style="color: #333;">Tindakan:</h3>
        <p>Silakan setujui atau tolak permintaan Work Order ini dengan mengklik salah satu tombol di bawah ini.</p>
        <div style="margin-top: 20px;">
          <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 10px; font-weight: bold;">Setujui</a>
          <a href="${rejectUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Tolak</a>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
      to: emailTujuan,
      cc: body.email,
      subject: `[WORK ORDER BARU] ${newWoNumber}`,
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Work Order berhasil dibuat dan notifikasi persetujuan telah dikirim.' }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
    console.error(error);
    return NextResponse.json({ message: `Gagal membuat Work Order: ${errorMessage}` }, { status: 500 });
  }
}