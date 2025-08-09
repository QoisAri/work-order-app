import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('ID tidak ditemukan', { status: 400 });
  }

  const { data: wo, error } = await supabase
    .from('work_orders')
    .select('*, equipments!inner(*), job_types!inner(*)')
    .eq('id', id)
    .single();

  if (error || !wo) {
    return new NextResponse(`Work Order tidak ditemukan: ${error?.message}`, { status: 404 });
  }
  
  if (wo.status !== 'approved' || !wo.wo_number) {
    return new NextResponse('Dokumen ini belum disetujui atau belum memiliki nomor WO.', { status: 403 });
  }

  const htmlContent = `
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border: 1px solid black; padding: 10px; }
        .header-left { font-weight: bold; color: green; font-size: 16px; }
        .header-center { text-align: center; }
        .header-right { border: 1px solid black; font-size: 11px; }
        .header-right table { border-collapse: collapse; }
        .header-right td { padding: 2px 5px; border: 1px solid black; }
        .details { margin-top: 30px; width: 100%;}
        .details table { width: 100%; }
        .details td { padding: 4px 0; }
    </style>
    <body>
        <div class="header">
            <div class="header-left">Cipta Niaga Gas</div>
            <div class="header-center"><strong>WORK ORDER</strong><br>MAINTENANCE & ENGINEERING</div>
            <div class="header-right">
                <table>
                    <tr><td>No</td><td>: FR.IV.ENG.001</td></tr>
                    <tr><td>Tgl</td><td>: ${new Date().toLocaleDateString('id-ID')}</td></tr>
                    <tr><td>Rev</td><td>: Rev-04</td></tr>
                    <tr><td>Hal</td><td>: Halaman 1 dari 1</td></tr>
                </table>
            </div>
        </div>
        <div class="details">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 25%;">Request by.</td><td style="width: 45%;">: ${wo.nama_pemohon || ''} (${wo.no_wa_pemohon || ''})</td>
                    <td style="width: 10%;">Date</td><td style="width: 20%;">: ${new Date(wo.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
                <tr>
                    <td>Division</td><td>: ${wo.sub_depart || ''}</td>
                    <td colspan="2" style="font-weight: bold; font-size: 14px; text-align:right;">${wo.wo_number}</td>
                </tr>
                <tr><td>Work</td><td>: ${wo.equipments.nama_equipment || ''}</td></tr>
                <tr><td>Type Work</td><td>: ${wo.job_types.nama_pekerjaan || ''}</td></tr>
                <tr><td>Estimate Time Executed</td><td>: ${wo.details.estimasiPengerjaan ? new Date(wo.details.estimasiPengerjaan).toLocaleDateString('id-ID') : '-'}</td></tr>
                <tr><td>Estimate Time Finished</td><td>: ${wo.details.estimasiSelesai ? new Date(wo.details.estimasiSelesai).toLocaleDateString('id-ID') : '-'}</td></tr>
            </table>
        </div>
    </body>
  `;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' } });

    const headers = new Headers();
    headers.append('Content-Type', 'application/pdf');
    headers.append('Content-Disposition', `attachment; filename="WO-${wo.wo_number}.pdf"`);

    // PERBAIKAN: Secara eksplisit membuat Buffer dari hasil pdf
    return new NextResponse(Buffer.from(pdfBuffer), { status: 200, headers: headers });

  } catch (pdfError: any) {
    console.error("PDF Generation Error (Puppeteer):", pdfError);
    return new NextResponse(`Gagal membuat PDF: ${pdfError.message}`, { status: 500 });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}