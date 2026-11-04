const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const COLUMNS = [
  { header: 'Claim #', key: 'claimNumber', width: 14 },
  { header: 'Patient Name', key: 'patientName', width: 20 },
  { header: 'DOB', key: 'dob', width: 12 },
  { header: 'Member ID', key: 'memberId', width: 16 },
  { header: 'DOS', key: 'dos', width: 12 },
  { header: 'Payer', key: 'payer', width: 18 },
  { header: 'Billed Amount', key: 'billedAmount', width: 14 },
  { header: 'Paid Amount', key: 'paidAmount', width: 14 },
  { header: 'Claim Status', key: 'status', width: 13 },
  { header: 'Action Code', key: 'actionCode', width: 26 },
];

const usDate = (iso) => (iso ? `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}` : '');
const money = (n) => Number(n).toFixed(2);
const displayValue = (row, key) => {
  if (key === 'dob' || key === 'dos') return usDate(row[key]);
  if (key === 'billedAmount' || key === 'paidAmount') return money(row[key]);
  return row[key];
};

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function toCsv(rows) {
  const lines = [COLUMNS.map((c) => c.header).join(',')];
  rows.forEach((r) => lines.push(COLUMNS.map((c) => csvCell(displayValue(r, c.key))).join(',')));
  return { buffer: Buffer.from(lines.join('\n'), 'utf8'), type: 'text/csv', ext: 'csv' };
}

async function toXlsx(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Claims');
  ws.columns = COLUMNS;
  ws.getRow(1).font = { bold: true };
  rows.forEach((r) => ws.addRow({ ...r, dob: usDate(r.dob), dos: usDate(r.dos) }));
  ['billedAmount', 'paidAmount'].forEach((k) => {
    ws.getColumn(k).numFmt = '$#,##0.00';
  });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  return {
    buffer,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ext: 'xlsx',
  };
}

function toPdf(rows) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), type: 'application/pdf', ext: 'pdf' }));
    doc.on('error', reject);

    const widths = [62, 85, 55, 80, 55, 85, 55, 55, 55, 110];
    const drawRow = (values, bold) => {
      const y = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5);
      let x = 30;
      values.forEach((v, i) => {
        doc.text(String(v ?? ''), x, y, { width: widths[i] - 4, height: 10, ellipsis: true, lineBreak: false });
        x += widths[i];
      });
      doc.y = y + 14;
    };

    doc.font('Helvetica-Bold').fontSize(14).text('Claims Details', 30, 30);
    doc.font('Helvetica').fontSize(8).text(`Generated ${new Date().toLocaleString('en-US')} - ${rows.length} claims`);
    doc.moveDown(0.8);
    drawRow(COLUMNS.map((c) => c.header), true);
    rows.forEach((r) => {
      if (doc.y > doc.page.height - 50) {
        doc.addPage();
        drawRow(COLUMNS.map((c) => c.header), true);
      }
      drawRow(COLUMNS.map((c) => displayValue(r, c.key)), false);
    });
    doc.end();
  });
}

const BUILDERS = { csv: async (r) => toCsv(r), xlsx: toXlsx, pdf: toPdf };
const build = (format, rows) => BUILDERS[format](rows);

module.exports = { build };
