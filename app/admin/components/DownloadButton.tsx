'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, AlignmentType, ImageRun } from 'docx';

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  // --- PERBAIKAN TYPO DI SINI ---
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// Tipe data untuk props komponen
type DownloadButtonProps = {
  workOrderId: string;
  workOrderNumber: string | null;
};

// --- PERBAIKAN TYPESCRIPT #1: Definisikan tipe data yang diharapkan ---
type WorkOrderData = {
  id: string;
  created_at: string;
  wo_number: string | null;
  details: any;
  profiles: {
    full_name: string;
    sub_depart: string;
    no_wa: string;
  } | null;
  job_types: {
    nama_pekerjaan: string;
  } | null;
  equipments: {
    nama_equipment: string;
  } | null;
};


export default function DownloadButton({ workOrderId, workOrderNumber }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // --- Ambil gambar logo ---
      const logoUrl = 'https://pqegehztshxylgqvztjo.supabase.co/storage/v1/object/public/public_assets/WhatsApp%20Image%202025-08-26%20at%2010.31.45_a58434a7.jpg'; 
      const logoResponse = await fetch(logoUrl);
      if (!logoResponse.ok) {
        throw new Error('Gagal mengunduh gambar logo.');
      }
      const logoBuffer = await logoResponse.arrayBuffer();
      // -----------------------------------------

      // 1. Ambil data dari Supabase
      const supabase = createClient();
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          profiles ( full_name, sub_depart, no_wa ),
          job_types ( nama_pekerjaan ),
          equipments ( nama_equipment )
        `)
        .eq('id', workOrderId)
        .single<WorkOrderData>(); // Beritahu Supabase tipe data yang diharapkan

      if (error || !workOrder) {
        throw new Error(`Gagal mengambil data Work Order: ${error?.message || 'Tidak ditemukan'}`);
      }

      // 2. Siapkan data untuk template
      const details = workOrder.details || {};
      const data = {
        no: 'FR.IV.ENG.001',
        tgl: formatDate(workOrder.created_at),
        rev: 'Rev-04',
        hal: 'Halaman 1 dari 1',
        request_by: workOrder.profiles?.full_name || 'N/A',
        no_wa: workOrder.profiles?.no_wa || 'N/A',
        date: formatDate(workOrder.created_at),
        wo_number: workOrder.wo_number || 'N/A',
        division: workOrder.profiles?.sub_depart || 'N/A',
        work: workOrder.equipments?.nama_equipment || 'N/A',
        type_work: workOrder.job_types?.nama_pekerjaan || 'Tidak Ditentukan',
        estimate_time_executed: formatDate(details.estimasi_pengerjaan),
        estimate_time_finished: formatDate(details.estimasi_selesai),
        tambahan: details.deskripsi_pekerjaan || details.deskripsi || 'Tidak ada deskripsi tambahan.'
      };
      
      const FONT_SIZE = 24; // Ukuran font 12pt
      const createText = (text: string, bold?: boolean) => new TextRun({ text, size: FONT_SIZE, bold: bold || false });

      // 3. Buat dokumen Word dengan layout yang lebih rapi
      const doc = new Document({
        sections: [{
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({
                        children: [
                          new ImageRun({
                            // --- PERBAIKAN TYPESCRIPT #2: Ganti tipe gambar ---
                            type: 'jpg', // Gunakan 'jpg' bukan 'image/jpeg'
                            data: logoBuffer,
                            transformation: {
                              width: 150,
                              height: 50,
                            },
                          }),
                        ],
                      })], 
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.CENTER,
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ children: [createText("WORK ORDER", true)], alignment: AlignmentType.CENTER }), 
                        new Paragraph({ children: [createText("MAINTENANCE & ENGINEERING")], alignment: AlignmentType.CENTER })
                      ], 
                      width: { size: 45, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.CENTER,
                    }),
                    new TableCell({ 
                      children: [
                        new Paragraph({ children: [createText(`No: ${data.no}`)] }),
                        new Paragraph({ children: [createText(`Tgl: ${data.tgl}`)] }),
                        new Paragraph({ children: [createText(`Rev: ${data.rev}`)] }),
                        new Paragraph({ children: [createText(`Hal: ${data.hal}`)] }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE } 
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            
            new Paragraph({
                children: [
                    createText(`Request by.: ${data.request_by} (${data.no_wa})`),
                    new TextRun({ text: `\t\t\t\tDate: ${data.date}` }),
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `\t\t\t\t\t${data.wo_number}` }),
                ]
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({ children: [createText(`Division: ${data.division}`)] }),
            new Paragraph({ children: [createText(`Work: ${data.work}`)] }),
            new Paragraph({ children: [createText(`Type Work: ${data.type_work}`)] }),
            new Paragraph({ children: [createText(`Estimate Time Executed: ${data.estimate_time_executed}`)] }),
            new Paragraph({ children: [createText(`Estimate Time Finished: ${data.estimate_time_finished}`)] }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            new Paragraph({ children: [createText(data.tambahan)] }),
          ],
        }],
      });

      // 4. Generate file dan picu unduhan di browser
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WO_${workOrderNumber || workOrderId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
    >
      {isDownloading ? 'Memproses...' : 'Unduh Word'}
    </button>
  );
}
