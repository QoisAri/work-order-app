import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Inisialisasi Supabase Admin Client (menggunakan service role key untuk akses penuh)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inisialisasi Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Fungsi ini akan diekspor sebagai handler untuk metode POST
export async function POST(request: NextRequest) {
    try {
        const { workOrderId } = await request.json();

        if (!workOrderId) {
            return NextResponse.json({ message: 'Work Order ID is required.' }, { status: 400 });
        }

        // 1. Ambil data lengkap work order yang baru dibuat, termasuk relasi ke tabel lain
        const { data: wo, error: fetchError } = await supabaseAdmin
            .from('work_orders')
            .select(`
                id,
                created_at,
                status,
                details,
                profiles ( full_name ),
                equipments ( nama_equipment )
            `)
            .eq('id', workOrderId)
            .single();

        if (fetchError || !wo) {
            throw new Error(`Work Order dengan ID ${workOrderId} tidak ditemukan.`);
        }

        // PERBAIKAN: Akses elemen pertama [0] dari array relasi
        const pemohon = wo.profiles?.[0]?.full_name || 'Tidak diketahui';
        const equipment = wo.equipments?.[0]?.nama_equipment || 'Tidak diketahui';
        const tanggalDibuat = new Date(wo.created_at).toLocaleString('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short'
        });

        // Kirim email notifikasi ke admin
        await transporter.sendMail({
            from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
            to: process.env.ADMIN_EMAIL, // Pastikan ADMIN_EMAIL ada di file .env
            subject: `Work Order Baru Masuk: ${equipment}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h1 style="color: #007bff;">Notifikasi Work Order Baru</h1>
                    <p>Halo Admin,</p>
                    <p>Sebuah work order baru telah masuk dan menunggu persetujuan Anda. Berikut adalah ringkasannya:</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px; font-weight: bold;">Pemohon:</td><td style="padding: 8px;">${pemohon}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Equipment:</td><td style="padding: 8px;">${equipment}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Tanggal Dibuat:</td><td style="padding: 8px;">${tanggalDibuat}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Status:</td><td style="padding: 8px; text-transform: capitalize;">${wo.status}</td></tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p>Silakan masuk ke dashboard admin untuk meninjau detail lengkap dan melakukan persetujuan.</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/work-orders/${wo.id}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Lihat Detail WO</a>
                    </div>
                </div>
            `
        });

        return NextResponse.json({ message: 'Notifikasi admin berhasil dikirim.' }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi error tidak diketahui';
        console.error("Gagal mengirim notifikasi admin:", error);
        return NextResponse.json({ message: `Error: ${errorMessage}` }, { status: 500 });
    }
}
