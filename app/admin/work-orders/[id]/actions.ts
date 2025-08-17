// app/admin/work-orders/[id]/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateWorkOrderStatus(workOrderId: string, status: 'approved' | 'rejected', reason?: string) {
  const supabase = createClient();

  try {
    let updateData: any = {
      status: status,
    };

    if (status === 'approved') {
      const { data: newWoNumber, error: rpcError } = await supabase.rpc('generate_new_wo_number');
      if (rpcError) throw rpcError;
      updateData.wo_number = newWoNumber;
      updateData.approved_at = new Date();
    }

    if (status === 'rejected' && reason) {
      updateData.rejection_reason = reason;
    }

    const { error } = await supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', workOrderId);

    if (error) {
      throw error;
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/work-orders/${workOrderId}`);
    
  } catch (error: any) {
    // Jika ada error, kembalikan pesan agar bisa ditampilkan
    console.error("Server Action Error:", error.message);
    return { error: error.message };
  }

  // PERBAIKAN: Redirect hanya terjadi jika tidak ada error
  redirect('/admin');
}
