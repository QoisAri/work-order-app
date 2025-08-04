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

async function generateWoNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const { count } = await supabaseAdmin.from('work_orders').select('id', { count: 'exact' }).like('wo_number', `${year}/${month}/%`);
    const newSequence = ((count ?? 0) + 1).toString().padStart(3, '0');
    return `${year}/${month}/${newSequence}`;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id || !action) {
        return new NextResponse('Parameter tidak lengkap.', { status: 400 });
    }

    const { data: wo, error: fetchError } = await supabaseAdmin
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !wo) {
        return new NextResponse('Work Order tidak ditemukan.', { status: 404 });
    }

    if (action === 'approve') {
        if (wo.status === 'approved') return NextResponse.redirect(new URL('/approval-success?message=WO ini sudah pernah disetujui.', request.url));
        
        const newWoNumber = await generateWoNumber();
        const { error: updateError } = await supabaseAdmin
            .from('work_orders')
            .update({ status: 'approved', wo_number: newWoNumber, approved_at: new Date() })
            .eq('id', id);

        if (updateError) return new NextResponse(`Gagal update database: ${updateError.message}`, { status: 500 });

        try {
            await transporter.sendMail({
                from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
                to: wo.email_pemohon,
                subject: `Work Order Disetujui: ${newWoNumber}`,
                html: `<h1>Work Order Anda Telah Disetujui!</h1><p>Halo ${wo.nama_pemohon},</p><p>Work order Anda telah disetujui dengan <strong>Nomor Work Order: ${newWoNumber}</strong></p><p>Silakan unduh dokumen PDF melalui tautan di bawah ini:</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/api/generate-pdf?id=${id}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Unduh PDF</a>`
            });
        } catch (emailError) {
            console.error("Gagal kirim email persetujuan:", emailError);
        }
        
        return NextResponse.redirect(new URL('/approval-success', request.url));
    } 
    else if (action === 'reject') {
        if (wo.status !== 'pending') return NextResponse.redirect(new URL('/approval-rejected?message=WO ini sudah pernah diproses.', request.url));

        const { error: updateError } = await supabaseAdmin.from('work_orders').update({ status: 'rejected' }).eq('id', id);
            
        if (updateError) return new NextResponse(`Gagal update database: ${updateError.message}`, { status: 500 });

        try {
            await transporter.sendMail({
                from: `"Sistem Work Order" <${process.env.GMAIL_EMAIL}>`,
                to: wo.email_pemohon,
                subject: `Work Order Anda Ditolak`,
                html: `<h1>Work Order Anda Ditolak</h1><p>Halo ${wo.nama_pemohon},</p><p>Mohon maaf, work order yang Anda ajukan telah ditolak. Silakan hubungi admin untuk informasi lebih lanjut.</p>`
            });
        } catch (emailError) {
            console.error("Gagal kirim email penolakan:", emailError);
        }
        
        return NextResponse.redirect(new URL('/approval-rejected', request.url));
    }

    return new NextResponse('Aksi tidak valid.', { status: 400 });
}