import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
    try {
        const { id, reason } = await request.json();
        if (!id || !reason) return NextResponse.json({ message: 'ID dan alasan penolakan wajib diisi.' }, { status: 400 });
        
        const { data: existingWo, error: fetchError } = await supabaseAdmin.from('work_orders').select('details, nama_pemohon, email_pemohon').eq('id', id).single();
        if (fetchError || !existingWo) throw new Error('Work Order tidak ditemukan.');

        const { error: updateError } = await supabaseAdmin
            .from('work_orders')
            .update({ status: 'rejected', details: { ...existingWo.details, rejectionReason: reason } })
            .eq('id', id);

        if (updateError) throw new Error(`Database Error: ${updateError.message}`);

        await transporter.sendMail({
            from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
            to: existingWo.email_pemohon,
            subject: 'Work Order Anda Ditolak',
            html: `<h1>Work Order Anda Ditolak</h1><p>Halo ${existingWo.nama_pemohon},</p><p>Mohon maaf, work order yang Anda ajukan telah ditolak dengan alasan:</p><blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic;">${reason}</blockquote>`,
        });

        return NextResponse.json({ message: 'Work Order berhasil ditolak.' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
        console.error(error);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}