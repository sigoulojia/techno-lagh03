import { DELIVERY_METHODS, STORE_INFO } from '../data/products';
import { formatDzd, type SavedOrder } from './storeLogic';

/**
 * Generates an elegant, printable, self-contained HTML invoice/receipt
 */
export function generateReceiptHtml(order: SavedOrder, includePrintBar = true): string {
  const delivery =
    DELIVERY_METHODS.find((m) => m.id === order.customer.deliveryMethod)?.title ??
    order.customer.deliveryMethod;

  const orderDate = new Date(order.createdAtIso).toLocaleString('ar-DZ', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const itemsRows = order.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E4E4E7; text-align: center; color: #71717A;">${idx + 1}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E4E4E7; font-weight: 600; color: #18181B;">
          ${item.name}
          <div style="font-size: 11px; font-weight: normal; color: #71717A; margin-top: 3px;">
            ${item.variantLabel ? `القياس: ${item.variantLabel}` : `الخيار: ${item.colorName}`} · رقم المنتج: <span style="font-family: monospace;">${item.sku}</span>
          </div>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E4E4E7; text-align: center; font-weight: 600; color: #18181B;">${item.quantity}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E4E4E7; text-align: left; color: #52525B; font-family: monospace;">${formatDzd(item.unitPriceDzd)}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #E4E4E7; text-align: left; font-weight: bold; color: #18181B; font-family: monospace;">${formatDzd(item.lineTotalDzd)}</td>
      </tr>
    `,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>وصل طلب رسمي — ${order.orderId} — متجر تكنو الأغواط</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'IBM Plex Sans Arabic', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F4F4F5;
      color: #18181B;
      padding: ${includePrintBar ? '30px 15px' : '0'};
      line-height: 1.6;
      direction: rtl;
    }
    .receipt-card {
      max-width: 760px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 36px 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #E4E4E7;
      position: relative;
    }
    .print-bar {
      max-width: 760px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      border: none;
    }
    .btn-primary { background: #E30613; color: #FFF; }
    .btn-primary:hover { background: #C4000F; }
    .btn-secondary { background: #FFF; color: #18181B; border: 1px solid #D4D4D8; }
    .btn-secondary:hover { background: #F4F4F5; }
    .header-table { width: 100%; margin-bottom: 25px; border-bottom: 2px solid #F4F4F5; padding-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #18181B; }
    .brand-sub { font-size: 12px; color: #71717A; margin-top: 3px; }
    .order-badge {
      display: inline-block;
      background: #FFF1F2;
      color: #E30613;
      border: 1px solid #FECDD3;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #FAF9F6;
      border: 1px solid #E4E4E7;
      border-radius: 12px;
      padding: 18px 22px;
      margin-bottom: 25px;
      font-size: 13px;
    }
    .info-item p { margin-top: 3px; font-weight: 600; color: #18181B; }
    .info-item span { color: #71717A; font-size: 12px; }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 13px;
    }
    table.items-table th {
      background: #F4F4F5;
      padding: 12px 14px;
      text-align: right;
      font-weight: 700;
      color: #52525B;
      font-size: 12px;
    }
    .totals-box {
      width: 320px;
      margin-right: auto;
      background: #FAF9F6;
      border-radius: 12px;
      border: 1px solid #E4E4E7;
      padding: 16px 20px;
      font-size: 13px;
      margin-bottom: 30px;
    }
    .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #52525B; }
    .totals-row.total {
      border-top: 2px dashed #D4D4D8;
      padding-top: 10px;
      margin-top: 10px;
      margin-bottom: 0;
      font-size: 16px;
      font-weight: 800;
      color: #E30613;
    }
    .footer-stamp {
      border-top: 1px solid #E4E4E7;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #71717A;
    }
    .stamp-badge {
      border: 2px solid #10B981;
      color: #047857;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    @media print {
      body { background: #FFF; padding: 0; }
      .print-bar { display: none; }
      .receipt-card { box-shadow: none; border: none; padding: 15px; }
    }
  </style>
</head>
<body>
  ${
    includePrintBar
      ? `<div class="print-bar">
    <span style="font-size: 13px; color: #71717A;">وصل استلام رسمي (PDF) — متجر تكنو الأغواط</span>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn btn-primary">طباعة أو حفظ كـ PDF</button>
      <button onclick="window.close()" class="btn btn-secondary">إغلاق</button>
    </div>
  </div>`
      : ''
  }

  <div class="receipt-card">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <h1 class="brand-title">${STORE_INFO.branchName}</h1>
          <p class="brand-sub">${STORE_INFO.fullTitle}</p>
          <p class="brand-sub">${STORE_INFO.address}</p>
          <p class="brand-sub">الهاتف: <span dir="ltr" style="font-family: monospace; font-weight: bold;">${STORE_INFO.phoneDisplay}</span></p>
        </td>
        <td style="text-align: left; vertical-align: top;">
          <div class="order-badge">طلب شراء رسمي</div>
          <div style="font-size: 20px; font-weight: 800; font-family: monospace; color: #E30613; margin-top: 8px;">
            ${order.orderId}
          </div>
          <div style="font-size: 11px; color: #71717A; margin-top: 4px;">
            ${orderDate}
          </div>
        </td>
      </tr>
    </table>

    <div class="info-grid">
      <div class="info-item">
        <span>بيانات العميل:</span>
        <p>${order.customer.fullName}</p>
        <p dir="ltr" style="font-family: monospace; font-size: 12px; margin-top: 2px; text-align: right;">${order.customer.phone}</p>
      </div>
      <div class="info-item">
        <span>طريقة الاستلام والتوصيل:</span>
        <p>${delivery}</p>
        ${
          order.customer.deliveryMethod !== 'pickup'
            ? `<p style="font-size: 12px; color: #52525B;">${order.customer.wilaya} — ${order.customer.address}</p>`
            : '<p style="font-size: 12px; color: #52525B;">استلام مباشر من فرع تكنو الأغواط</p>'
        }
      </div>
      ${
        order.customer.notes
          ? `<div class="info-item" style="grid-column: 1 / -1; border-top: 1px dashed #E4E4E7; padding-top: 8px;">
              <span>ملاحظات الطلب:</span>
              <p style="font-size: 12px; font-weight: normal; color: #52525B;">${order.customer.notes}</p>
            </div>`
          : ''
      }
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>المنتج والمواصفات</th>
          <th style="width: 70px; text-align: center;">الكمية</th>
          <th style="width: 110px; text-align: left;">سعر الوحدة</th>
          <th style="width: 120px; text-align: left;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-box">
      <div class="totals-row">
        <span>المجموع الفرعي (${order.totals.itemCount} قطع):</span>
        <span style="font-family: monospace;">${formatDzd(order.totals.subtotalDzd)}</span>
      </div>
      <div class="totals-row">
        <span>رسوم التوصيل:</span>
        <span style="font-family: monospace;">
          ${order.totals.shippingFeeDzd === 0 ? 'مجاني' : formatDzd(order.totals.shippingFeeDzd)}
        </span>
      </div>
      <div class="totals-row total">
        <span>المبلغ عند الاستلام:</span>
        <span style="font-family: monospace;">${formatDzd(order.totals.totalDzd)}</span>
      </div>
    </div>

    <div class="footer-stamp">
      <div>
        <p style="font-weight: 600; color: #18181B;">شكراً لتسوقكم من تكنو الأغواط</p>
        <p style="margin-top: 2px;">سيتصل بكم فريق المتجر هاتفياً قبل التسليم للتأكيد.</p>
      </div>
      <div class="stamp-badge">
        تم تأكيد الطلب بنجاح
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers instant download of the order receipt exclusively as a PDF file
 */
export async function downloadOrderReceipt(order: SavedOrder): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    const { jsPDF } = await import('jspdf');
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default || html2canvasModule;

    // Create an offscreen staging container for crisp rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // 210mm at 96 DPI
    container.style.background = '#FFFFFF';
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.zIndex = '-9999';
    container.style.direction = 'rtl';
    container.setAttribute('dir', 'rtl');

    const receiptHtml = generateReceiptHtml(order, false);
    container.innerHTML = receiptHtml;
    document.body.appendChild(container);

    // Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    const targetElement = (container.querySelector('.receipt-card') as HTMLElement) || container;

    const canvas = await html2canvas(targetElement, {
      scale: 2, // High resolution (retina 2x) for razor sharp text
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const marginMm = 8;
    const usableWidthMm = pageWidthMm - marginMm * 2;
    const imgHeightMm = (canvas.height * usableWidthMm) / canvas.width;

    if (imgHeightMm <= pageHeightMm - marginMm * 2) {
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, usableWidthMm, imgHeightMm);
    } else {
      let position = marginMm;
      let remainingHeight = imgHeightMm;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'JPEG', marginMm, position, usableWidthMm, imgHeightMm);
        remainingHeight -= pageHeightMm;
        position -= pageHeightMm;
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(`وصل-طلب-${order.orderId}-تكنو-الأغواط.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF canvas, falling back to printOrderReceipt:', err);
    printOrderReceipt(order);
  }
}

/**
 * Opens a print-ready window with the receipt (allowing instant Save as PDF or Print)
 */
export function printOrderReceipt(order: SavedOrder): void {
  try {
    const htmlContent = generateReceiptHtml(order, true);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } else {
      downloadOrderReceipt(order);
    }
  } catch {
    downloadOrderReceipt(order);
  }
}
