import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
// Anda mungkin butuh Nodemailer lagi di sini jika ingin kirim email konfirmasi

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { workOrderId, action } = await request.json();

    // Lakukan update status di tabel work_orders
    const { error } = await supabase
        .from('work_orders')
        .update({ status: action })
        .eq('id', workOrderId);

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }
    
    // Di sini Anda bisa menambahkan logika untuk mengirim email konfirmasi ke pengguna

    return NextResponse.json({ success: true });
}