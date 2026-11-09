const encoder = new TextEncoder()
const headers = ['Order ID', 'Order items', 'Date', 'Time', 'Total', 'Additional charges', 'Net total', 'Service charges', 'Status']
const number = (value) => Number(Number(value || 0).toFixed(2))
const filename = (format) => `foodie-business-report-${new Date().toISOString().slice(0, 10)}.${format}`
const xmlEscape = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
function download(bytes, name, type) {
  const url = URL.createObjectURL(new Blob([bytes], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function reportRows(report) {
  return report.rows.map((row) => [row.id, row.items, row.date, row.time, number(row.total), number(row.additional), number(row.net), number(row.fee), row.status])
}
function crc32(bytes) {
  let crc = -1
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ -1) >>> 0
}
function zip(files) {
  const localParts = []
  const centralParts = []
  let offset = 0
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name)
    const data = encoder.encode(content)
    const crc = crc32(data)
    const local = new Uint8Array(30 + nameBytes.length + data.length)
    const localView = new DataView(local.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true)
    localView.setUint16(6, 0x0800, true)
    localView.setUint32(14, crc, true)
    localView.setUint32(18, data.length, true)
    localView.setUint32(22, data.length, true)
    localView.setUint16(26, nameBytes.length, true)
    local.set(nameBytes, 30)
    local.set(data, 30 + nameBytes.length)
    localParts.push(local)
    const central = new Uint8Array(46 + nameBytes.length)
    const centralView = new DataView(central.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true)
    centralView.setUint16(6, 20, true)
    centralView.setUint16(8, 0x0800, true)
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, data.length, true)
    centralView.setUint32(24, data.length, true)
    centralView.setUint16(28, nameBytes.length, true)
    centralView.setUint32(42, offset, true)
    central.set(nameBytes, 46)
    centralParts.push(central)
    offset += local.length
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const view = new DataView(end.buffer)
  view.setUint32(0, 0x06054b50, true)
  view.setUint16(8, centralParts.length, true)
  view.setUint16(10, centralParts.length, true)
  view.setUint32(12, centralSize, true)
  view.setUint32(16, offset, true)
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' })
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function wordParagraph(text, style = '') {
  return `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}</w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`
}
function wordCell(value, bold = false) {
  return `<w:tc><w:tcPr><w:tcW w:w="1400" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="4" w:color="E8E1D8"/></w:tcBorders></w:tcPr><w:p><w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${xmlEscape(value)}</w:t></w:r></w:p></w:tc>`
}
function wordTableRow(values, bold = false) { return `<w:tr>${values.map((value) => wordCell(value, bold)).join('')}</w:tr>` }

export function downloadWord(report) {
  const allRows = reportRows(report)
  const rows = [headers, ...allRows.map((row) => row.map(String)), ['Totals', '', '', '', number(report.totals.total), number(report.totals.additional), number(report.totals.net), number(report.totals.fee), `${allRows.length} orders`]]
  const table = `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="6" w:color="D7CEC2"/><w:left w:val="single" w:sz="4" w:color="E8E1D8"/><w:bottom w:val="single" w:sz="6" w:color="D7CEC2"/><w:right w:val="single" w:sz="4" w:color="E8E1D8"/><w:insideH w:val="single" w:sz="4" w:color="E8E1D8"/><w:insideV w:val="single" w:sz="4" w:color="E8E1D8"/></w:tblBorders></w:tblPr>${rows.map((row, index) => wordTableRow(row, index === 0 || index === rows.length - 1)).join('')}</w:tbl>`
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${wordParagraph(report.title, 'Title')}${wordParagraph(`Period: ${report.period} · Status: ${report.status}`)}${wordParagraph(`Generated: ${report.generatedAt.toLocaleString()}`)}${wordParagraph(`Orders: ${allRows.length} · Total: ${number(report.totals.total)} · Additional charges: ${number(report.totals.additional)} · Net total: ${number(report.totals.net)} · Service charges: ${number(report.totals.fee)}`)}${table}<w:sectPr><w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr></w:body></w:document>`
  const blob = zip({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': documentXml,
    'word/styles.xml': '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="18"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="292724"/></w:rPr></w:style></w:styles>',
    'word/_rels/document.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  })
  downloadBlob(blob, filename('docx'))
}
function excelCell(value, row, column) {
  const ref = `${String.fromCharCode(65 + column)}${row}`
  if (typeof value === 'number') return `<c r="${ref}"><v>${value}</v></c>`
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`
}
export function downloadExcel(report) {
  const dataRows = reportRows(report)
  const sheetRows = [
    ['Foodie Merchant Business Report'],
    [`Period: ${report.period}`, `Status: ${report.status}`],
    [`Generated: ${report.generatedAt.toLocaleString()}`],
    [],
    headers,
    ...dataRows,
    ['Totals', '', '', '', number(report.totals.total), number(report.totals.additional), number(report.totals.net), number(report.totals.fee), `${dataRows.length} orders`],
  ]
  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="5" topLeftCell="A6" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><sheetData>${sheetRows.map((row, ri) => `<row r="${ri + 1}">${row.map((value, ci) => excelCell(value ?? '', ri + 1, ci)).join('')}</row>`).join('')}</sheetData><autoFilter ref="A5:I${5 + dataRows.length}"/></worksheet>`
  const blob = zip({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Business Report" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheetXml,
  })
  downloadBlob(blob, filename('xlsx'))
}
const pdfText = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1')
const pdfMoney = (value) => `LKR ${number(value).toFixed(2)}`
export function downloadPdf(report) {
  const pageWidth = 842
  const pageHeight = 595
  const left = 28
  const widths = [44, 145, 65, 42, 72, 76, 68, 76, 62]
  const starts = widths.map((_, index) => left + widths.slice(0, index).reduce((a, b) => a + b, 0))
  const headersPdf = ['Order ID', 'Order items', 'Date', 'Time', 'Total', 'Additional', 'Net total', 'Service fee', 'Status']
  const allRows = report.rows.map((row) => [row.id, row.items, row.date, row.time, pdfMoney(row.total), pdfMoney(row.additional), pdfMoney(row.net), pdfMoney(row.fee), row.status])
  const chunks = []
  for (let index = 0; index < allRows.length; index += 22) chunks.push(allRows.slice(index, index + 22))
  if (!chunks.length) chunks.push([])
  const pages = chunks.map((pageRows, pageIndex) => {
    const commands = []
    const text = (x, y, value, size = 8, bold = false) => commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`)
    const line = (x1, y1, x2, y2) => commands.push(`${x1} ${y1} m ${x2} ${y2} l S`)
    text(left, 558, report.title, 18, true)
    text(left, 540, `Period: ${report.period}   Status: ${report.status}   Generated: ${report.generatedAt.toLocaleString()}`, 8)
    text(left, 521, `Orders: ${report.rows.length}   Total: ${pdfMoney(report.totals.total)}   Additional: ${pdfMoney(report.totals.additional)}   Net: ${pdfMoney(report.totals.net)}   Service: ${pdfMoney(report.totals.fee)}`, 8)
    line(left, 510, pageWidth - left, 510)
    let y = 493
    headersPdf.forEach((header, column) => text(starts[column], y, header, 7, true))
    line(left, y - 5, pageWidth - left, y - 5)
    y -= 20
    pageRows.forEach((row) => {
      row.forEach((value, column) => {
        const maxLength = Math.max(8, Math.floor((widths[column] - 5) / 4.3))
        const rendered = String(value)
        text(starts[column], y, rendered.length > maxLength ? `${rendered.slice(0, maxLength - 1)}...` : rendered, 7)
      })
      line(left, y - 6, pageWidth - left, y - 6)
      y -= 19
    })
    if (pageIndex === chunks.length - 1) {
      y -= 3
      text(left, y, 'TOTALS', 8, true)
      text(starts[4], y, pdfMoney(report.totals.total), 7, true)
      text(starts[5], y, pdfMoney(report.totals.additional), 7, true)
      text(starts[6], y, pdfMoney(report.totals.net), 7, true)
      text(starts[7], y, pdfMoney(report.totals.fee), 7, true)
    }
    text(pageWidth - 74, 20, `Page ${pageIndex + 1} of ${chunks.length}`, 7)
    return commands.join('\n')
  })
  const objects = []
  const add = (body) => { objects.push(body); return objects.length }
  const catalogId = add('')
  const pagesId = add('')
  const regularFontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  const boldFontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  const pageIds = []
  pages.forEach((content) => {
    const contentId = add(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`)
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`)
    pageIds.push(pageId)
  })
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = encoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
  const bytes = Uint8Array.from(pdf, (character) => character.charCodeAt(0))
  download(bytes, filename('pdf'), 'application/pdf')
}
