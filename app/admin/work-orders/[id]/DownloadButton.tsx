// app/admin/work-orders/[id]/DownloadButton.tsx
'use client';

import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// Definisikan tipe data yang diterima, dengan tambahan sub_departments dan job_types
type WorkOrderData = {
  created_at: string;
  approved_at?: string | null;
  wo_number?: string | null;
  profiles?: { 
    full_name?: string | null;
    sub_depart?: string | null; // <-- Tambahkan sub_depart
  } | null;
  equipments?: { nama_equipment?: string | null; } | null;
  // 💡 Tambahkan relasi ini
  sub_departments?: { nama_departemen?: string | null; } | null;
  job_types?: { nama_pekerjaan?: string | null; } | null; 
  details?: any;
};

const formatDateForDoc = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
};

export default function DownloadButton({ workOrder }: { workOrder: WorkOrderData }) {

  const handleDownload = async () => {
    const details = workOrder.details || {};
    
    // --- PERBAIKAN SUMBER DATA DI SINI ---
    const woData = {
      tanggal: formatDateForDoc(workOrder.approved_at || workOrder.created_at),
      woNumber: workOrder.wo_number || '-',
      requestBy: workOrder.profiles?.full_name || 'N/A',
      noWa: details.no_wa || '',
      division: workOrder.profiles?.sub_depart || 'N/A',
      equipment: workOrder.equipments?.nama_equipment || 'N/A',
      jenisPekerjaan: workOrder.job_types?.nama_pekerjaan || 'N/A',
      estimasiPengerjaan: formatDateForDoc(details.estimasi_pengerjaan),
      estimasiSelesai: formatDateForDoc(details.estimasi_selesai),
      tambahan: details.deskripsi_pekerjaan || details.deskripsi || 'Tidak ada catatan.',
    };
    // --- AKHIR PERBAIKAN ---

    const doc = new Document({
        sections: [{
          children: [
            // ... (Bagian Header tidak diubah)
            new Paragraph({ text: "WORK ORDER", style: "Header1", alignment: AlignmentType.CENTER }),
            new Paragraph({ 
                text: "MAINTENANCE & ENGINEERING", 
                style: "Header2", 
                alignment: AlignmentType.CENTER,
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            }),
            new Paragraph({ text: "" }),
            
            new Paragraph({
              alignment: AlignmentType.END,
              children: [
                new TextRun({ text: `Date\t: ${woData.tanggal}`, size: 24 }),
                new TextRun({ text: `No\t: ${woData.woNumber}`, size: 24, break: 1 }),
              ],
            }),
            new Paragraph({ text: "" }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                // --- PERBAIKAN BORDERS DI SINI ---
                borders: { 
                    top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                },
                // --- AKHIR PERBAIKAN BORDERS ---
                rows: [
                    new TableRow({ children: [
                        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Request by.", size: 24 })] })] }),
                        new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `: ${woData.requestBy} ${woData.noWa}`, size: 24 })] })] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Division", size: 24 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${woData.division}`, size: 24 })] })] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Work", size: 24 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${woData.equipment}`, size: 24 })] })] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Type Work", size: 24 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${Array.isArray(woData.jenisPekerjaan) ? woData.jenisPekerjaan.join(', ') : woData.jenisPekerjaan}`, size: 24 })] })] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estimate Time Execution", size: 24 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${woData.estimasiPengerjaan}`, size: 24 })] })] }),
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estimate Time Finished", size: 24 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${woData.estimasiSelesai}`, size: 24 })] })] }),
                    ]}),
                ],
            }),
            
            new Paragraph({ text: "" }), new Paragraph({ text: "" }),
            new Paragraph({ children: [ new TextRun({ text: String(woData.tambahan), size: 24 }) ] }),
          ],
        }],
        styles: {
          paragraphStyles: [
              { id: "Header1", name: "Header 1", run: { size: 36, bold: true, underline: {} } },
              { id: "Header2", name: "Header 2", run: { size: 28, bold: true } },
          ],
        },
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `WorkOrder-${woData.woNumber}.docx`);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Unduh Word
    </button>
  );
}