'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateWorkOrderStatus(workOrderId: string, status: 'approved' | 'rejected', reason?: string) {
  const supabase = createClient();
  try {
    let updateData: any = { status: status };
    if (status === 'approved') {
      const { data: newWoNumber, error: rpcError } = await supabase.rpc('generate_new_wo_number');
      if (rpcError) throw rpcError;
      updateData.wo_number = newWoNumber;
      updateData.approved_at = new Date();
    }
    if (status === 'rejected' && reason) {
      updateData.rejection_reason = reason;
    }
    const { error } = await supabase.from('work_orders').update(updateData).eq('id', workOrderId);
    if (error) throw error;
    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/work-orders/${workOrderId}`);
  } catch (error: any) {
    console.error("Server Action Error (updateWorkOrderStatus):", error.message);
    return { error: error.message };
  }
  redirect(`/admin/dashboard?status=${status}`);
}

export async function markAsDone(workOrderId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('work_orders').update({ status: 'done' }).eq('id', workOrderId);
  if (error) {
    console.error('Error updating work order status to done:', error);
    throw new Error('Gagal menandai pekerjaan sebagai selesai.');
  }
  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/work-orders/${workOrderId}`);
}

export async function editWorkOrder(workOrderId: string, updates: { status: string; details: any }) {
  const supabase = createClient();

  const { data: currentWorkOrder, error: fetchError } = await supabase
    .from('work_orders')
    .select('details')
    .eq('id', workOrderId)
    .single();

  if (fetchError) {
    console.error('Error fetching current details:', fetchError);
    throw new Error('Gagal mengambil data untuk diedit.');
  }

  const newDetails = { ...(currentWorkOrder.details || {}), ...updates.details };

  const { error: updateError } = await supabase
    .from('work_orders')
    .update({
      status: updates.status,
      details: newDetails,
    })
    .eq('id', workOrderId);

  if (updateError) {
    console.error('Error editing work order:', updateError);
    throw new Error('Gagal menyimpan perubahan.');
  }

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/work-orders/${workOrderId}`);
}