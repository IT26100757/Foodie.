import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { api, apiFetch, signIn } from './api.js'
import { platformData } from './adminApi.js'

function Icon({ name, size = 20, ...props }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    orders: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3.5h6M8 9h8M8 13h8M8 17h5" /></>,
    restaurant: <><path d="M3 10h18l-1.6-6H4.6L3 10Z" /><path d="M4 10v10h16V10M9 20v-6h6v6" /><path d="M3 10a2.3 2.3 0 0 0 4.6 0 2.3 2.3 0 0 0 4.7 0 2.3 2.3 0 0 0 4.7 0 2.3 2.3 0 0 0 4.6 0" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20v-1.1a6.5 6.5 0 0 1 13 0V20h-13ZM16 5a3.2 3.2 0 0 1 0 6.2m2 2.8a5 5 0 0 1 3.5 4.8V20H18" /></>,
    rider: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 18h5l-3-7h4l3.5 7M7 18l3.5-7H7l-2-3H3" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    zones: <><path d="M12 22s7-4.5 7-12a7 7 0 1 0-14 0c0 7.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.3" /></>,
    offer: <><path d="M20.5 13.5 13 21a2.1 2.1 0 0 1-3 0L3 14V4h10l7.5 7a1.8 1.8 0 0 1 0 2.5Z" /><circle cx="8" cy="9" r="1" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
    refund: <><path d="M4 7v5h5M20 17v-5h-5" /><path d="M5.5 12a7 7 0 0 1 12-4.5L20 10M4 14l2.5 2.5A7 7 0 0 0 18.5 12" /></>,
    support: <><path d="M4 5h16v12H9l-5 4V5Z"/><path d="M8 9h8M8 13h5"/></>,
    report: <><path d="M4 20V4h12l4 4v12H4Z" /><path d="M16 4v5h4M8 15l2-2 2 2 4-4M8 17h8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(.95)" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16.2 16.2 4.3 4.3" /></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    down: <path d="m7 10 5 5 5-5" />,
    arrowUp: <><path d="m7 14 5-5 5 5" /><path d="M12 9v10" /></>,
    wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H5a2 2 0 0 1-2-2V6.5Z" /><path d="M3 8h17M15 13h5M17 13v.01" /></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    filePdf: <><path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 15h2a1.5 1.5 0 0 0 0-3H8v6m5 0v-6h1a3 3 0 0 1 0 6h-1m5-6h3m-3 0v6"/></>,
    fileWord: <><path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 12l1.3 6 1.7-4 1.7 4 1.3-6m2 0v6"/></>,
    fileExcel: <><path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 12l4 6m0-6-4 6m7-6v6m0-3h3"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

const navGroups = [
  { label: '', links: [['Dashboard', 'grid']] },
  { label: 'MANAGE', links: [['Orders', 'orders'], ['Customers', 'users'], ['Restaurants', 'restaurant'], ['Delivery Riders', 'rider']] },
  { label: 'OPERATIONS', links: [['Coupons & Offers', 'offer'], ['Payments', 'card'], ['Refunds', 'refund'], ['Complaints', 'support']] },
]


function NotificationCenterPage({ items, readIds, onOpen, onMarkAllRead }) {
  const unreadCount = items.filter((item) => !readIds.includes(item.id) && item.unread).length
  return <section className="panel notification-center-page"><div className="notification-center-heading"><div><h2>All notifications</h2><p>{unreadCount ? `${unreadCount} unread updates` : 'You’re all caught up'}</p></div><button type="button" onClick={onMarkAllRead} disabled={!unreadCount}>Mark all read</button></div><div className="notification-center-list">{items.map((item) => { const isUnread = item.unread && !readIds.includes(item.id); return <button type="button" className={`notification-item notification-center-item ${isUnread ? 'unread' : ''}`} key={item.id} onClick={() => onOpen(item)}><span className="notification-bullet"/><span className="notification-item-copy"><strong>{item.title}</strong><span>{item.text}</span><small>{item.time}</small></span><span className="notification-destination">Open {item.destination}<Icon name="chevronRight" size={15}/></span></button> })}{items.length === 0 && <p className="empty-state">No notifications yet.</p>}</div></section>
}

function FoodieLogo() {
  return <div className="dashboard-brand"><span className="brand-badge"><span>F</span></span><span><strong>Foodie</strong><small>Food Delivery Admin</small></span></div>
}

function StatCard({ icon, label, value, growth, tint }) {
  return <article className="stat-card"><div className={`stat-icon ${tint}`}><Icon name={icon} size={23} /></div><p>{label}</p><strong>{value}</strong>{growth && <small><Icon name="arrowUp" size={13} /><b>{growth}</b> from last month</small>}</article>
}

function OrderStatus({ status }) {
  return <span className={`status status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
}

function FoodThumb({ color }) {
  const emoji = { pizza: '🍕', sushi: '🍣', burger: '🍔', taco: '🌮', pasta: '🍝', curry: '🍛', noodles: '🍜' }[color]
  return <span className={`food-thumb food-${color}`} aria-hidden="true">{emoji}</span>
}

function isoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function displayDate(value, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!value) return 'Select date'
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', options)
}

function DateRangePicker({ dateFrom, dateTo, onApply }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const initial = new Date(`${dateFrom}T12:00:00`)
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const [draftFrom, setDraftFrom] = useState(dateFrom)
  const [draftTo, setDraftTo] = useState(dateTo)
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const years = Array.from({ length: 16 }, (_, index) => 2020 + index)
  const days = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1)

  function openPicker() {
    setDraftFrom(dateFrom)
    setDraftTo(dateTo)
    const selected = new Date(`${dateFrom}T12:00:00`)
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
    setOpen(true)
  }

  function chooseDay(day) {
    const selected = isoDate(new Date(year, monthIndex, day))
    if (!draftFrom || draftTo) {
      setDraftFrom(selected)
      setDraftTo('')
    } else if (selected < draftFrom) {
      setDraftTo(draftFrom)
      setDraftFrom(selected)
    } else {
      setDraftTo(selected)
    }
  }

  return <div className="date-picker-shell">
    <button className="date-range" type="button" aria-expanded={open} onClick={open ? () => setOpen(false) : openPicker}>
      <Icon name="calendar" size={17}/><span>{displayDate(dateFrom)} <i>–</i> {displayDate(dateTo)}</span><Icon name="down" size={15}/>
    </button>
    {open && <div className="date-picker-popover">
      <div className="calendar-head"><span>Select date range</span><strong>{draftFrom ? displayDate(draftFrom, { weekday: 'short', day: 'numeric', month: 'short' }) : 'Choose start'}{draftTo ? ` – ${displayDate(draftTo, { weekday: 'short', day: 'numeric', month: 'short' })}` : draftFrom ? ' – Choose end' : ''}</strong></div>
      <div className="calendar-controls"><div className="calendar-month-select"><select aria-label="Month" value={monthIndex} onChange={(event) => setMonth(new Date(year, Number(event.target.value), 1))}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{new Date(2024, index, 1).toLocaleDateString('en-US', { month: 'long' })}</option>)}</select><select aria-label="Year" value={year} onChange={(event) => setMonth(new Date(Number(event.target.value), monthIndex, 1))}>{years.map((item) => <option key={item}>{item}</option>)}</select></div><div className="calendar-arrows"><button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><Icon name="chevronLeft" size={19}/></button><button type="button" aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><Icon name="chevronRight" size={19}/></button></div></div>
      <div className="calendar-weekdays">{'SMTWTFS'.split('').map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="calendar-days">{days.map((day, index) => {
        if (!day) return <span className="calendar-blank" key={`blank-${index}`}/>
        const value = isoDate(new Date(year, monthIndex, day))
        const selectedStart = value === draftFrom
        const selectedEnd = value === draftTo
        const between = draftFrom && draftTo && value > draftFrom && value < draftTo
        return <button type="button" key={value} className={`${selectedStart || selectedEnd ? 'selected' : ''} ${between ? 'in-range' : ''}`} onClick={() => chooseDay(day)}>{day}</button>
      })}</div>
      <div className="calendar-footer"><button type="button" className="cancel-date" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="apply-date" disabled={!draftFrom || !draftTo} onClick={() => { onApply(draftFrom, draftTo); setOpen(false) }}>Apply</button></div>
    </div>}
  </div>
}

function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function zipFiles(files) {
  const encoder = new TextEncoder()
  const crc32 = (bytes) => {
    let crc = -1
    for (const byte of bytes) {
      crc ^= byte
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
    return (crc ^ -1) >>> 0
  }
  const locals = []
  const centrals = []
  let offset = 0
  for (const [filename, value] of Object.entries(files)) {
    const name = encoder.encode(filename)
    const data = encoder.encode(value)
    const crc = crc32(data)
    const local = new Uint8Array(30 + name.length)
    const localView = new DataView(local.buffer)
    localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true); localView.setUint32(14, crc, true); localView.setUint32(18, data.length, true); localView.setUint32(22, data.length, true); localView.setUint16(26, name.length, true)
    local.set(name, 30)
    locals.push(local, data)
    const central = new Uint8Array(46 + name.length)
    const centralView = new DataView(central.buffer)
    centralView.setUint32(0, 0x02014b50, true); centralView.setUint16(4, 20, true); centralView.setUint16(6, 20, true); centralView.setUint32(16, crc, true); centralView.setUint32(20, data.length, true); centralView.setUint32(24, data.length, true); centralView.setUint16(28, name.length, true); centralView.setUint32(42, offset, true)
    central.set(name, 46)
    centrals.push(central)
    offset += local.length + data.length
  }
  const centralSize = centrals.reduce((total, part) => total + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true); endView.setUint16(8, centrals.length, true); endView.setUint16(10, centrals.length, true); endView.setUint32(12, centralSize, true); endView.setUint32(16, offset, true)
  return new Blob([...locals, ...centrals, end], { type: 'application/zip' })
}

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character])
}

function createXlsx(rows) {
  const columnName = (index) => { let value = index + 1; let name = ''; while (value) { const remainder = (value - 1) % 26; name = String.fromCharCode(65 + remainder) + name; value = Math.floor((value - 1) / 26) } return name }
  const sheetRows = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, colIndex) => `<c r="${columnName(colIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${xmlEscape(cell)}</t></is></c>`).join('')}</row>`).join('')
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Foodie Report" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`,
  })
}

function createDocx(rows) {
  const paragraphs = rows.slice(0, 3).map((row) => `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(row.join('  '))}</w:t></w:r></w:p>`).join('')
  const tableRows = rows.slice(3).map((row) => `<w:tr>${row.map((cell) => `<w:tc><w:tcPr><w:tcW w:w="1900" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>${xmlEscape(cell)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`).join('')
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="AAB7C2"/><w:left w:val="single" w:sz="4" w:color="AAB7C2"/><w:bottom w:val="single" w:sz="4" w:color="AAB7C2"/><w:right w:val="single" w:sz="4" w:color="AAB7C2"/><w:insideH w:val="single" w:sz="4" w:color="D4DCE2"/><w:insideV w:val="single" w:sz="4" w:color="D4DCE2"/></w:tblBorders></w:tblPr>${tableRows}</w:tbl><w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900"/></w:sectPr></w:body></w:document>`
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': documentXml,
  })
}

function createPdf(lines) {
  const safe = (value) => String(value).normalize('NFKD').replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, '\\$&')
  const commands = lines.map((line, index) => `BT /F1 ${index === 0 ? 18 : 10} Tf 48 ${790 - index * 20} Td (${safe(line).slice(0, 90)}) Tj ET`).join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return pdf
}

function ReportDialog({ onClose, reportTitle, reportData, dateFrom, dateTo }) {
  const headers = reportData.length ? Object.keys(reportData[0]) : []
  const tableRows = [headers, ...reportData.map((item) => headers.map((key) => item[key] ?? ''))].map((row) => row.map(String))
  function exportReport(format) {
    const rows = [[`Foodie ${reportTitle} Report`], [`Date range: ${displayDate(dateFrom)} - ${displayDate(dateTo)}`], [`Records: ${reportData.length}`], [], ...tableRows]
    const filename = `foodie-${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report`
    if (format === 'excel') {
      downloadFile(`${filename}.xlsx`, createXlsx(rows), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    } else if (format === 'word') {
      downloadFile(`${filename}.docx`, createDocx(rows), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    } else {
      const lines = [`FOODIE ${reportTitle.toUpperCase()} REPORT`, `Date range: ${displayDate(dateFrom)} - ${displayDate(dateTo)}`, `Records: ${reportData.length}`, '', ...tableRows.map((row) => row.join(' | '))]
      downloadFile(`${filename}.pdf`, createPdf(lines), 'application/pdf')
    }
    onClose()
  }

  return <div className="report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title"><button className="report-close" type="button" aria-label="Close report options" onClick={onClose}><Icon name="close" size={20}/></button><span className="report-dialog-icon"><Icon name="report" size={24}/></span><h2 id="report-title">Export {reportTitle.toLowerCase()} report</h2><p>Choose a file format for the currently filtered {reportTitle.toLowerCase()}.</p><small>{displayDate(dateFrom)} – {displayDate(dateTo)} · {reportData.length} records</small><div className="report-format-list"><button onClick={() => exportReport('pdf')}><span className="format-icon pdf-icon"><Icon name="filePdf" size={23}/></span><span><strong>PDF document</strong><small>Portable report for sharing</small></span><Icon name="chevronRight" size={18}/></button><button onClick={() => exportReport('word')}><span className="format-icon word-icon"><Icon name="fileWord" size={23}/></span><span><strong>Word document (.docx)</strong><small>Editable Microsoft Word report</small></span><Icon name="chevronRight" size={18}/></button><button onClick={() => exportReport('excel')}><span className="format-icon excel-icon"><Icon name="fileExcel" size={23}/></span><span><strong>Excel spreadsheet (.xlsx)</strong><small>Editable Microsoft Excel workbook</small></span><Icon name="chevronRight" size={18}/></button></div></section></div>
}

function ReportExport({ title, data, dateFrom, dateTo }) {
  const [open, setOpen] = useState(false)
  return <><button type="button" className="report-primary-button report-export-button" onClick={() => setOpen(true)}><Icon name="report" size={16}/>Export report</button>{open && <ReportDialog onClose={() => setOpen(false)} reportTitle={title} reportData={data} dateFrom={dateFrom} dateTo={dateTo}/>}</>
}

function OrdersPage({ orders: visibleOrders, allOrders, search, onSearch, statusFilter, onStatusFilter, dateFrom, dateTo, onDateApply }) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const liveCount = allOrders.filter((order) => ['Preparing', 'Confirmed', 'Ready', 'Picked Up'].includes(order.status)).length
  const completeCount = allOrders.filter((order) => order.status === 'Delivered').length
  const cancelledCount = allOrders.filter((order) => order.status === 'Cancelled').length
  const headings = { all: 'All Orders', live: 'Live Orders', complete: 'Complete Orders', cancelled: 'Cancelled Orders' }
  const filters = [['all', 'All Orders', allOrders.length], ['live', 'Live Orders', liveCount], ['complete', 'Complete Orders', completeCount], ['cancelled', 'Cancelled Orders', cancelledCount]]
  const searchSuggestions = allOrders
    .filter((order) => !search.trim() || `${order.id} ${order.customer} ${order.restaurant}`.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 5)
    .map((order) => {
      const query = search.trim().toLowerCase()
      const matchType = order.id.toLowerCase().includes(query) ? 'Order ID' : order.customer.toLowerCase().includes(query) ? 'Customer' : order.restaurant.toLowerCase().includes(query) ? 'Restaurant' : 'Recent order'
      const value = matchType === 'Customer' ? order.customer : matchType === 'Restaurant' ? order.restaurant : order.id
      return { ...order, matchType, value }
    })

  function chooseSuggestion(suggestion) {
    onSearch(suggestion.value)
    setSearchFocused(false)
    setActiveSuggestion(-1)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.min(current + 1, searchSuggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeSuggestion >= 0 && searchSuggestions[activeSuggestion]) {
      event.preventDefault()
      chooseSuggestion(searchSuggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      setSearchFocused(false)
      setActiveSuggestion(-1)
    }
  }

  return <section className="panel orders-page">
    <div className="orders-page-heading"><div><h2>{headings[statusFilter]}</h2><p>Review order details and fulfillment status</p></div><span>{visibleOrders.length} orders</span></div>
    <div className="orders-toolbar">
      <div className="order-filter-chips" role="tablist" aria-label="Filter orders by status">{filters.map(([key, label, count]) => <button type="button" role="tab" aria-selected={statusFilter === key} className={`order-filter-chip ${statusFilter === key ? 'active' : ''}`} key={key} onClick={() => onStatusFilter(key)}>{key === 'all' && <Icon name="filter" size={15}/>}<span>{label}</span><small>{count}</small></button>)}</div>
      <div className="orders-toolbar-tools"><div className="order-search-wrap"><label className="order-search"><Icon name="search" size={17}/><span className="sr-only">Search orders</span><input role="combobox" aria-autocomplete="list" aria-expanded={searchFocused && searchSuggestions.length > 0} aria-controls="order-search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `order-suggestion-${activeSuggestion}` : undefined} value={search} onChange={(event) => { onSearch(event.target.value); setActiveSuggestion(-1) }} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} onKeyDown={handleSearchKeyDown} placeholder="Search orders..." />{search && <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSearch(''); setActiveSuggestion(-1) }}><Icon name="close" size={15}/></button>}</label>
        {searchFocused && searchSuggestions.length > 0 && <div className="order-search-suggestions" id="order-search-suggestions" role="listbox"><div className="suggestion-heading">{search.trim() ? 'Matching orders' : 'Recent orders'}</div>{searchSuggestions.map((suggestion, index) => <button type="button" id={`order-suggestion-${index}`} role="option" aria-selected={activeSuggestion === index} className={`order-suggestion ${activeSuggestion === index ? 'active' : ''}`} key={suggestion.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(suggestion)}><span className="suggestion-order-icon"><Icon name="orders" size={16}/></span><span className="suggestion-copy"><strong>{suggestion.value}</strong><small>{suggestion.id} · {suggestion.customer} · {suggestion.restaurant}</small></span><span className="suggestion-type">{suggestion.matchType}</span></button>)}</div>}
      </div><DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={onDateApply}/><ReportExport title="Orders" data={visibleOrders.map(({ id, customer, restaurant, items, amount, placedDate, status }) => ({ 'Order ID': id, Customer: customer, Restaurant: restaurant, Items: items, Amount: amount, Date: displayDate(placedDate), Status: status }))} dateFrom={dateFrom} dateTo={dateTo}/></div>
    </div>
    <div className="table-scroll"><table><thead><tr><th>Order ID</th><th>Customer</th><th>Restaurant</th><th>Items</th><th>Amount</th><th>Placed</th><th>Status</th></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.id}><td className="order-id">#{order.id}</td><td>{order.customer}</td><td>{order.restaurant}</td><td>{order.items}</td><td className="amount">{order.amount}</td><td>{order.ago}</td><td><OrderStatus status={order.status}/></td></tr>)}</tbody></table>{visibleOrders.length === 0 && <p className="empty-state">No orders match these filters.</p>}</div>
  </section>
}

function PaymentsPage({ payments, onCancel, actionMessage }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [dateFrom, setDateFrom] = useState('2020-01-01')
  const [dateTo, setDateTo] = useState(() => isoDate(new Date()))
  const datedPayments = payments.filter((payment) => payment.paidDate >= dateFrom && payment.paidDate <= dateTo)
  const matchesFilter = (payment, key) => key === 'all'
    || key === 'completed' && payment.status === 'COMPLETED'
    || key === 'pending' && payment.status === 'PENDING'
    || key === 'cancelled' && payment.status === 'CANCELLED'
    || key === 'card' && payment.method === 'CARD'
    || key === 'cash' && payment.method === 'CASH_ON_DELIVERY'
  const filters = [['all', 'All payments'], ['completed', 'Completed'], ['pending', 'Pending'], ['cancelled', 'Cancelled'], ['card', 'Card'], ['cash', 'Cash on delivery']]
  const countFor = (key) => datedPayments.filter((payment) => matchesFilter(payment, key)).length
  const suggestions = datedPayments
    .filter((payment) => !search.trim() || `${payment.id} ${payment.orderId} ${payment.customer}`.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 5)
  const visiblePayments = datedPayments
    .filter((payment) => matchesFilter(payment, filter))
    .filter((payment) => `${payment.id} ${payment.orderId} ${payment.customer} ${payment.method} ${payment.status}`.toLowerCase().includes(search.trim().toLowerCase()))

  function chooseSuggestion(payment) {
    setSearch(payment.id)
    setFilter('all')
    setSearchFocused(false)
    setActiveSuggestion(-1)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      event.preventDefault()
      chooseSuggestion(suggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      setSearchFocused(false)
      setActiveSuggestion(-1)
    }
  }

  return <section className="panel payments-page">
    <div className="payments-heading"><div><h2>{filter === 'all' ? 'All payments' : filters.find(([key]) => key === filter)?.[1]}</h2><p>Review payment transactions by status, method, and date.</p></div><span>{visiblePayments.length} payments</span></div>
    <div className="payment-tabs" role="tablist" aria-label="Filter payments">{filters.map(([key, label]) => <button type="button" role="tab" aria-selected={filter === key} className={filter === key ? 'active' : ''} key={key} onClick={() => setFilter(key)}>{label}<small>{countFor(key)}</small></button>)}</div>
    <div className="payments-toolbar"><div className="payment-search-wrap"><label className="order-search payment-search"><Icon name="search" size={17}/><span className="sr-only">Search payments</span><input role="combobox" aria-autocomplete="list" aria-expanded={searchFocused && suggestions.length > 0} aria-controls="payment-search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `payment-suggestion-${activeSuggestion}` : undefined} value={search} onChange={(event) => { setSearch(event.target.value); setActiveSuggestion(-1) }} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} onKeyDown={handleSearchKeyDown} placeholder="Search payment, order, or customer..."/>{search && <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(''); setActiveSuggestion(-1) }}><Icon name="close" size={15}/></button>}</label>{searchFocused && suggestions.length > 0 && <div className="order-search-suggestions payment-suggestions" id="payment-search-suggestions" role="listbox"><div className="suggestion-heading">{search.trim() ? 'Matching payments' : 'Recent payments'}</div>{suggestions.map((payment, index) => <button type="button" id={`payment-suggestion-${index}`} role="option" aria-selected={activeSuggestion === index} className={`order-suggestion ${activeSuggestion === index ? 'active' : ''}`} key={payment.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(payment)}><span className="suggestion-order-icon"><Icon name={payment.method === 'CARD' ? 'card' : 'wallet'} size={16}/></span><span className="suggestion-copy"><strong>{payment.id}</strong><small>#{payment.orderId} · {payment.customer} · Rs. {payment.amount.toFixed(2)}</small></span><span className="suggestion-type">{payment.method === 'CARD' ? 'Card' : 'Cash on delivery'}</span></button>)}</div>}</div><DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={(from, to) => { setDateFrom(from); setDateTo(to) }}/><ReportExport title="Payments" data={visiblePayments.map((payment) => ({ 'Payment ID': payment.id, 'Order ID': payment.orderId, Customer: payment.customer, Date: displayDate(payment.paidDate), Method: payment.method === 'CARD' ? 'Card' : 'Cash on delivery', Amount: `Rs. ${payment.amount.toFixed(2)}`, Status: payment.status }))} dateFrom={dateFrom} dateTo={dateTo}/></div>
    {actionMessage && <p className="payment-feedback" role="status">{actionMessage}</p>}
    <div className="table-scroll"><table className="payment-table"><thead><tr><th>Payment ID</th><th>Order</th><th>Customer</th><th>Date</th><th>Method</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{visiblePayments.map((payment) => <tr key={payment.id}><td><strong>{payment.id}</strong></td><td className="payment-order-id">#{payment.orderId}</td><td>{payment.customer}</td><td>{displayDate(payment.paidDate)}</td><td><span className="payment-method"><Icon name={payment.method === 'CARD' ? 'card' : 'wallet'} size={15}/>{payment.method === 'CARD' ? 'Card' : 'Cash on delivery'}</span></td><td className="payment-amount">Rs. {payment.amount.toFixed(2)}</td><td><span className={`payment-status payment-status-${payment.status.toLowerCase()}`}>{payment.status[0] + payment.status.slice(1).toLowerCase()}</span></td><td>{payment.status === 'PENDING' && payment.orderStatus === 'NEW' ? <button type="button" className="payment-cancel-button" onClick={() => onCancel(payment)}>Cancel payment</button> : <span className="coupon-no-action">—</span>}</td></tr>)}</tbody></table>{visiblePayments.length === 0 && <p className="empty-state">No payments match these filters.</p>}</div>
  </section>
}

function RefundsPage({ refunds, onDecision, actionMessage, focusRequestId }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [dateFrom, setDateFrom] = useState('2020-01-01')
  const [dateTo, setDateTo] = useState(() => isoDate(new Date()))
  const [selectedRefund, setSelectedRefund] = useState(null)
  useEffect(() => { if (focusRequestId) { setSearch(focusRequestId); setFilter('all') } }, [focusRequestId])
  const datedRefunds = refunds.filter((refund) => refund.requestedDate >= dateFrom && refund.requestedDate <= dateTo)
  const filters = [['all', 'All requests'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Declined']]
  const matchesFilter = (refund, key) => key === 'all' || refund.status.toLowerCase() === key
  const countFor = (key) => datedRefunds.filter((refund) => matchesFilter(refund, key)).length
  const suggestions = datedRefunds
    .filter((refund) => !search.trim() || `${refund.id} ${refund.orderId} ${refund.customer} ${refund.email} ${refund.reason}`.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 5)
  const visibleRefunds = datedRefunds
    .filter((refund) => matchesFilter(refund, filter))
    .filter((refund) => `${refund.id} ${refund.orderId} ${refund.customer} ${refund.email} ${refund.phone} ${refund.reason}`.toLowerCase().includes(search.trim().toLowerCase()))

  function chooseSuggestion(refund) {
    setSearch(refund.id)
    setFilter('all')
    setSearchFocused(false)
    setActiveSuggestion(-1)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      event.preventDefault()
      chooseSuggestion(suggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      setSearchFocused(false)
      setActiveSuggestion(-1)
    }
  }

  return <>
    <section className="panel refunds-page">
      <div className="refunds-heading"><div><h2>{filter === 'all' ? 'All refund requests' : filters.find(([key]) => key === filter)?.[1]}</h2><p>Review customer requests and the order and payment details they include.</p></div><span>{visibleRefunds.length} requests</span></div>
      <div className="refund-tabs" role="tablist" aria-label="Filter refund requests">{filters.map(([key, label]) => <button type="button" role="tab" aria-selected={filter === key} className={filter === key ? 'active' : ''} key={key} onClick={() => setFilter(key)}>{label}<small>{countFor(key)}</small></button>)}</div>
      <div className="refunds-toolbar"><div className="refund-search-wrap"><label className="order-search refund-search"><Icon name="search" size={17}/><span className="sr-only">Search refund requests</span><input role="combobox" aria-autocomplete="list" aria-expanded={searchFocused && suggestions.length > 0} aria-controls="refund-search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `refund-suggestion-${activeSuggestion}` : undefined} value={search} onChange={(event) => { setSearch(event.target.value); setActiveSuggestion(-1) }} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} onKeyDown={handleSearchKeyDown} placeholder="Search request, order, or customer..."/>{search && <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(''); setActiveSuggestion(-1) }}><Icon name="close" size={15}/></button>}</label>{searchFocused && suggestions.length > 0 && <div className="order-search-suggestions refund-suggestions" id="refund-search-suggestions" role="listbox"><div className="suggestion-heading">{search.trim() ? 'Matching refund requests' : 'Recent refund requests'}</div>{suggestions.map((refund, index) => <button type="button" id={`refund-suggestion-${index}`} role="option" aria-selected={activeSuggestion === index} className={`order-suggestion ${activeSuggestion === index ? 'active' : ''}`} key={refund.id} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(refund)}><span className="suggestion-order-icon"><Icon name="refund" size={16}/></span><span className="suggestion-copy"><strong>{refund.id} · {refund.customer}</strong><small>#{refund.orderId} · {refund.reason}</small></span><span className="suggestion-type">{refund.status[0] + refund.status.slice(1).toLowerCase()}</span></button>)}</div>}</div><DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={(from, to) => { setDateFrom(from); setDateTo(to) }}/><ReportExport title="Refunds" data={visibleRefunds.map((refund) => ({ 'Request ID': refund.id, 'Order ID': refund.orderId, Customer: refund.customer, Email: refund.email, Date: displayDate(refund.requestedDate), Reason: refund.reason, Method: refund.method === 'CARD' ? 'Card' : 'Cash on delivery', Amount: `Rs. ${refund.amount.toFixed(2)}`, Status: refund.status }))} dateFrom={dateFrom} dateTo={dateTo}/></div>
      {actionMessage && <p className="refund-feedback" role="status">{actionMessage}</p>}
      <div className="table-scroll"><table className="refund-table"><thead><tr><th>Request</th><th>Order</th><th>Customer</th><th>Requested</th><th>Reason</th><th>Method</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead><tbody>{visibleRefunds.map((refund) => <tr key={refund.id}><td><strong>{refund.id}</strong></td><td className="payment-order-id">#{refund.orderId}</td><td><strong>{refund.customer}</strong><small>{refund.email}</small></td><td>{displayDate(refund.requestedDate)}</td><td className="refund-reason-cell">{refund.reason}</td><td>{refund.method === 'CARD' ? 'Card' : 'Cash on delivery'}</td><td className="payment-amount">Rs. {refund.amount.toFixed(2)}</td><td><span className={`refund-status refund-status-${refund.status.toLowerCase()}`}>{refund.status === 'REJECTED' ? 'Declined' : refund.status[0] + refund.status.slice(1).toLowerCase()}</span></td><td><button type="button" className="refund-details-button" onClick={() => setSelectedRefund(refund)}>See details</button></td></tr>)}</tbody></table>{visibleRefunds.length === 0 && <p className="empty-state">No refund requests match these filters.</p>}</div>
    </section>
    {selectedRefund && <div className="report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRefund(null) }}><section className="restaurant-detail-dialog refund-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="refund-detail-title"><button className="report-close" type="button" aria-label="Close refund details" onClick={() => setSelectedRefund(null)}><Icon name="close" size={20}/></button><span className="report-dialog-icon"><Icon name="refund" size={23}/></span><h2 id="refund-detail-title">Refund request {selectedRefund.id}</h2><p className={`refund-status-text refund-status-text-${selectedRefund.status.toLowerCase()}`}>{selectedRefund.status === 'REJECTED' ? 'Declined' : selectedRefund.status[0] + selectedRefund.status.slice(1).toLowerCase()}</p><dl><dt>Customer</dt><dd>{selectedRefund.customer}</dd><dt>Email</dt><dd>{selectedRefund.email}</dd><dt>Phone</dt><dd>{selectedRefund.phone}</dd><dt>Order</dt><dd>#{selectedRefund.orderId}</dd><dt>Requested</dt><dd>{displayDate(selectedRefund.requestedDate)}</dd><dt>Payment method</dt><dd>{selectedRefund.method === 'CARD' ? 'Card' : 'Cash on delivery'}</dd><dt>Amount</dt><dd>Rs. {selectedRefund.amount.toFixed(2)}</dd><dt>Reason</dt><dd>{selectedRefund.reason}</dd><dt>Customer message</dt><dd>{selectedRefund.message}</dd></dl>{selectedRefund.status === 'PENDING' && <div className="refund-decision-actions"><button type="button" className="restaurant-reject-button" onClick={() => { onDecision(selectedRefund, 'REJECTED'); setSelectedRefund(null) }}>Decline request</button><button type="button" className="restaurant-approve-button" onClick={() => { onDecision(selectedRefund, 'APPROVED'); setSelectedRefund(null) }}>Approve refund</button></div>}</section></div>}
  </>
}

function ComplaintsPage() {
  const [category, setCategory] = useState('ALL')
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('2020-01-01')
  const [dateTo, setDateTo] = useState(() => isoDate(new Date()))
  const [complaints,setComplaints]=useState([])
  const [users,setUsers]=useState([])
  const [selected,setSelected]=useState(null)
  const [reply,setReply]=useState('')
  const [message,setMessage]=useState('')
  async function load(){try{const [rows,accounts]=await Promise.all([api('/api/admin/complaints'),api('/api/admin/users')]);setComplaints(rows);setUsers(accounts)}catch(error){setMessage(error.message)}}
  useEffect(()=>{load();const timer=setInterval(load,4000);return()=>clearInterval(timer)},[])
  const sender=id=>users.find(user=>user.id===id)
  const rows=complaints.filter(complaint=>(category==='ALL'||sender(complaint.userId)?.role===(category==='DRIVER'?'RIDER':category))&&[complaint.subject,complaint.description,sender(complaint.userId)?.email].join(' ').toLowerCase().includes(query.toLowerCase())&&complaint.createdAt.slice(0,10)>=dateFrom&&complaint.createdAt.slice(0,10)<=dateTo)
  const tabs = [['ALL', 'All complaints'], ['MERCHANT', 'Merchants'], ['DRIVER', 'Drivers'], ['CUSTOMER', 'Customers']]
  return <section className="panel complaints-page">
    <div className="complaints-heading"><div><h2>{category === 'ALL' ? 'All complaints' : `${category[0]}${category.slice(1).toLowerCase()} complaints`}</h2><p>Review concerns from merchants, delivery riders, and customers.</p></div><span>{rows.length} complaints</span></div>
    <div className="complaint-tabs" role="tablist" aria-label="Filter complaints by sender type">{tabs.map(([key, label]) => <button type="button" role="tab" aria-selected={category === key} className={category === key ? 'active' : ''} key={key} onClick={() => setCategory(key)}>{label}<small>{complaints.filter(complaint=>key==='ALL'||sender(complaint.userId)?.role===(key==='DRIVER'?'RIDER':key)).length}</small></button>)}</div>
    <div className="complaints-toolbar"><label className="order-search complaint-search"><Icon name="search" size={17}/><span className="sr-only">Search complaints</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search complaints, people, or email..."/>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close" size={15}/></button>}</label><DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={(from, to) => { setDateFrom(from); setDateTo(to) }}/></div>
    <div className="table-scroll"><table className="complaint-table"><thead><tr><th>Complaint</th><th>From</th><th>Contact</th><th>Submitted</th><th>Status</th><th>Details</th></tr></thead><tbody>{rows.map(complaint=><tr key={complaint.id}><td>{complaint.subject}</td><td>{[sender(complaint.userId)?.firstName,sender(complaint.userId)?.lastName].filter(Boolean).join(' ')}</td><td>{sender(complaint.userId)?.email}</td><td>{displayDate(complaint.createdAt.slice(0,10))}</td><td>{complaint.status}</td><td><button className="soft-button" onClick={()=>{setSelected(complaint);setReply('')}}>Details</button></td></tr>)}</tbody></table>{!rows.length&&<p className="empty-state">No complaints match these filters.</p>}</div>
    {message&&<p className="payment-feedback" role="status">{message}</p>}
    {selected&&<div className="report-backdrop"><section className="restaurant-detail-dialog" role="dialog" aria-modal="true" aria-label="Complaint details"><button className="report-close" aria-label="Close complaint details" onClick={()=>setSelected(null)}>×</button><h2>{selected.subject}</h2><p>{selected.description}</p>{selected.response?<p>{selected.response}</p>:<form onSubmit={async event=>{event.preventDefault();try{await api('/api/admin/complaints/'+selected.id+'/reply',{method:'POST',body:{response:reply}});await load();setSelected(null);setMessage('Reply saved.')}catch(error){setMessage(error.message)}}}><label className="coupon-field">Reply<textarea value={reply} onChange={event=>setReply(event.target.value)} required maxLength={2000}/></label><button className="report-primary-button" type="submit">Send reply</button></form>}</section></div>}
  </section>
}

function couponState(coupon) {
  if (coupon.status === 'CANCELLED') return 'cancelled'
  const today = isoDate(new Date())
  if (today < coupon.startDate) return 'upcoming'
  if (today > coupon.endDate) return 'expired'
  return 'active'
}

function CouponsOffersPage() {
  const today = isoDate(new Date())
  const initialEndDate = isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 30))
  const [coupons,setCoupons]=useState([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState('PERCENTAGE')
  const [discountTypeOpen, setDiscountTypeOpen] = useState(false)
  const [discountValue, setDiscountValue] = useState('10')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadCoupons(){try{setLoading(true);const rows=await api('/api/admin/coupons');setCoupons(rows.map(coupon=>({...coupon,status:coupon.enabled?'ACTIVE':'CANCELLED'})))}catch(error){setError(error.message)}finally{setLoading(false)}}
  useEffect(()=>{loadCoupons();const timer=setInterval(loadCoupons,4000);return()=>clearInterval(timer)},[])
  const counts = {
    all: coupons.length,
    active: coupons.filter((coupon) => couponState(coupon) === 'active').length,
    upcoming: coupons.filter((coupon) => couponState(coupon) === 'upcoming').length,
    expired: coupons.filter((coupon) => couponState(coupon) === 'expired').length,
    cancelled: coupons.filter((coupon) => couponState(coupon) === 'cancelled').length,
  }
  const visibleCoupons = filter === 'all' ? coupons : coupons.filter((coupon) => couponState(coupon) === filter)
  const filters = [['all', 'All coupons'], ['active', 'Active'], ['upcoming', 'Upcoming'], ['expired', 'Expired'], ['cancelled', 'Cancelled']]

  function generateCode() {
    const value = Math.random().toString(36).slice(2, 8).toUpperCase()
    setCode(`FOODIE-${value}`)
  }

  async function handleCreate(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    const normalizedCode = code.trim().toUpperCase()
    if (coupons.some((coupon) => coupon.code.toUpperCase() === normalizedCode)) {
      setError('That coupon code already exists.')
      setBusy(false)
      return
    }
    if (startDate > endDate) {
      setError('The start date must be on or before the end date.')
      setBusy(false)
      return
    }
    if (discountType === 'PERCENTAGE' && Number(discountValue) > 100) {
      setError('Percentage discounts cannot exceed 100%.')
      setBusy(false)
      return
    }
    try {
      const result=await api('/api/offers',{method:'POST',body:{restaurantId:null,menuItemId:null,title:title.trim(),code:normalizedCode,description:title.trim(),discountType,discountValue:Number(discountValue),startDate,endDate,enabled:true,published:true}})
      setCoupons((current) => [result, ...current])
      setMessage(`Coupon ${result.code} saved.`)
      setTitle('')
      setCode('')
      setFormOpen(false)
    } catch (createError) {
      setError(createError.message || 'Could not create this coupon.')
    } finally {
      setBusy(false)
    }
  }

  async function cancelCoupon(coupon){setBusy(true);setError('');try{await api('/api/offers/'+coupon.id,{method:'DELETE'});await loadCoupons();setMessage('Coupon cancelled.')}catch(error){setError(error.message)}finally{setBusy(false)}}

  return <section className="panel coupons-page">
    <div className="coupons-heading"><div><h2>Coupons &amp; Offers</h2><p>Create redeemable codes, set when they are valid, and cancel them when needed.</p></div><button className="report-primary-button" type="button" onClick={() => { setFormOpen(!formOpen); setMessage(''); setError('') }}><span aria-hidden="true">＋</span> Add coupon</button></div>
    {formOpen && <form className="coupon-create-form" onSubmit={handleCreate}>
      <div className="coupon-form-heading"><div><h3>New coupon</h3><p>Customers can use this code during its valid dates.</p></div><button className="coupon-close" type="button" onClick={() => setFormOpen(false)} aria-label="Close coupon form"><Icon name="close" size={18}/></button></div>
      <div className="coupon-form-grid">
        <label className="coupon-field coupon-field-wide"><span>Offer name</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="e.g. Weekend special" required/></label>
        <label className="coupon-field"><span>Coupon code</span><span className="coupon-code-field"><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} minLength={4} maxLength={24} placeholder="e.g. FOODIE20" required/><button type="button" onClick={generateCode}>Generate</button></span></label>
        <div className="coupon-field"><span id="coupon-discount-type-label">Discount type</span><div className="coupon-select" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDiscountTypeOpen(false) }}><button type="button" className={`coupon-select-trigger ${discountTypeOpen ? 'open' : ''}`} aria-labelledby="coupon-discount-type-label" aria-haspopup="listbox" aria-expanded={discountTypeOpen} onClick={() => setDiscountTypeOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setDiscountTypeOpen(true) } else if (event.key === 'Escape') setDiscountTypeOpen(false) }}><span>{discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed amount (LKR)'}</span><Icon name="down" size={16}/></button>{discountTypeOpen && <div className="coupon-select-menu" role="listbox" aria-labelledby="coupon-discount-type-label">{[['PERCENTAGE', 'Percentage'], ['FIXED', 'Fixed amount (LKR)']].map(([value, label]) => <button type="button" role="option" aria-selected={discountType === value} className={discountType === value ? 'selected' : ''} key={value} onClick={() => { setDiscountType(value); setDiscountTypeOpen(false) }}>{label}{discountType === value && <Icon name="check" size={15}/>}</button>)}</div>}</div></div>
        <label className="coupon-field"><span>Discount amount {discountType === 'PERCENTAGE' ? '(%)' : '(LKR)'}</span><input type="number" min="0.01" max={discountType === 'PERCENTAGE' ? '100' : undefined} step="0.01" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} required/></label>
        <div className="coupon-field coupon-period"><span>Valid period</span><DateRangePicker dateFrom={startDate} dateTo={endDate} onApply={(from, to) => { setStartDate(from); setEndDate(to) }}/></div>
      </div>
      <div className="coupon-form-footer"><small>Validity includes both selected dates. Offers are saved to the shared database.</small><button className="report-primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save coupon'}</button></div>
    </form>}
    {(message || error) && <p className={`coupon-feedback ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{error || message}</p>}
    <div className="coupon-tabs" role="tablist" aria-label="Filter coupons">{filters.map(([key, label]) => <button type="button" role="tab" aria-selected={filter === key} className={filter === key ? 'active' : ''} key={key} onClick={() => setFilter(key)}>{label}<small>{counts[key]}</small></button>)}</div>
    {loading ? <div className="restaurant-loading"><span className="auth-spinner"/>Loading coupons…</div> : <div className="table-scroll"><table className="coupon-table"><thead><tr><th>Offer</th><th>Code</th><th>Discount</th><th>Valid dates</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleCoupons.map((coupon) => { const status = couponState(coupon); return <tr key={coupon.id}><td><strong>{coupon.title}</strong></td><td><code>{coupon.code}</code></td><td>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `LKR ${Number(coupon.discountValue).toFixed(2)}`}</td><td>{displayDate(coupon.startDate)} – {displayDate(coupon.endDate)}</td><td><span className={`coupon-status coupon-status-${status}`}>{status[0].toUpperCase() + status.slice(1)}</span></td><td>{status === 'active' || status === 'upcoming' ? <button type="button" className="coupon-cancel-button" disabled={busy} onClick={() => cancelCoupon(coupon)}>Cancel offer</button> : <span className="coupon-no-action">—</span>}</td></tr> })}</tbody></table>{visibleCoupons.length === 0 && <p className="empty-state">No {filter === 'all' ? '' : `${filter} `}offers have been created in this browser.</p>}</div>}
  </section>
}

function RestaurantPage({ restaurants, loading, error, view, onView, search, onSearch, dateFrom, dateTo, onDateApply, onAction, actionMessage, actionError }) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [selectedMenu,setSelectedMenu]=useState([])
  useEffect(()=>{let active=true;if(selectedRestaurant)api('/api/restaurants/'+selectedRestaurant.restaurantId+'/menu/manage').then(menu=>{if(active)setSelectedMenu(menu)}).catch(()=>{if(active)setSelectedMenu([])});return()=>{active=false}},[selectedRestaurant?.restaurantId])
  const datedRestaurants = restaurants.filter((restaurant) => {
    if (!restaurant.registeredAt) return true
    const registrationDate = restaurant.registeredAt.slice(0, 10)
    return registrationDate >= dateFrom && registrationDate <= dateTo
  })
  const pendingRestaurants = datedRestaurants.filter((restaurant) => restaurant.verificationStatus === 'PENDING')
  const approvedRestaurants = datedRestaurants.filter((restaurant) => restaurant.verificationStatus === 'APPROVED')
  const rejectedRestaurants = datedRestaurants.filter((restaurant) => restaurant.verificationStatus === 'REJECTED')
  const restaurantsForView = view === 'pending' ? pendingRestaurants
    : view === 'approved' ? approvedRestaurants
      : view === 'rejected' ? rejectedRestaurants
        : datedRestaurants
  const visibleRestaurants = restaurantsForView
    .filter((restaurant) => `${restaurant.restaurantName} ${restaurant.restaurantAddress} ${restaurant.restaurantPhone} ${restaurant.ownerFirstName} ${restaurant.ownerLastName} ${restaurant.ownerEmail}`.toLowerCase().includes(search.trim().toLowerCase()))
  const suggestions = datedRestaurants
    .filter((restaurant) => !search.trim() || `${restaurant.restaurantName} ${restaurant.restaurantAddress} ${restaurant.ownerFirstName} ${restaurant.ownerLastName} ${restaurant.ownerEmail}`.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 5)

  function chooseSuggestion(restaurant) {
    onSearch(restaurant.restaurantName)
    setSearchFocused(false)
    setActiveSuggestion(-1)
  }

  function onSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      event.preventDefault()
      chooseSuggestion(suggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      setSearchFocused(false)
      setActiveSuggestion(-1)
    }
  }

  return <>
    <section className="panel restaurants-page">
      <div className="restaurants-page-heading"><div><h2>{view === 'pending' ? 'Waiting for Approval' : view === 'approved' ? 'Approved Restaurants' : view === 'rejected' ? 'Rejected Restaurants' : 'All Restaurants'}</h2><p>{view === 'pending' ? 'Review restaurant applications from merchant registrations' : view === 'approved' ? 'Restaurants approved to join the Foodie platform' : view === 'rejected' ? 'Restaurant applications that were rejected' : 'Registered restaurants'}</p></div><span>{restaurantsForView.length} restaurants</span></div>
      <div className="restaurant-tabs" role="tablist" aria-label="Restaurant lists"><button type="button" role="tab" aria-selected={view === 'all'} className={view === 'all' ? 'active' : ''} onClick={() => onView('all')}>All Restaurants <small>{datedRestaurants.length}</small></button><button type="button" role="tab" aria-selected={view === 'pending'} className={view === 'pending' ? 'active' : ''} onClick={() => onView('pending')}>Waiting for Approval <small>{pendingRestaurants.length}</small></button><button type="button" role="tab" aria-selected={view === 'rejected'} className={view === 'rejected' ? 'active' : ''} onClick={() => onView('rejected')}>Rejected <small>{rejectedRestaurants.length}</small></button><button type="button" role="tab" aria-selected={view === 'approved'} className={view === 'approved' ? 'active' : ''} onClick={() => onView('approved')}>Approved <small>{approvedRestaurants.length}</small></button></div>
      <div className="restaurants-toolbar">
        <div className="restaurant-search-wrap"><label className="order-search restaurant-search"><Icon name="search" size={17}/><span className="sr-only">Search restaurants</span><input role="combobox" aria-autocomplete="list" aria-expanded={searchFocused && suggestions.length > 0} aria-controls="restaurant-search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `restaurant-suggestion-${activeSuggestion}` : undefined} value={search} onChange={(event) => { onSearch(event.target.value); setActiveSuggestion(-1) }} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} onKeyDown={onSearchKeyDown} placeholder="Search restaurants, owners..."/>{search && <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSearch(''); setActiveSuggestion(-1) }}><Icon name="close" size={15}/></button>}</label>
          {searchFocused && suggestions.length > 0 && <div className="order-search-suggestions restaurant-suggestions" id="restaurant-search-suggestions" role="listbox"><div className="suggestion-heading">{search.trim() ? 'Matching restaurants' : 'Restaurants'}</div>{suggestions.map((restaurant, index) => <button type="button" id={`restaurant-suggestion-${index}`} role="option" aria-selected={activeSuggestion === index} className={`order-suggestion ${activeSuggestion === index ? 'active' : ''}`} key={restaurant.restaurantId} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(restaurant)}><span className="suggestion-order-icon"><Icon name="restaurant" size={16}/></span><span className="suggestion-copy"><strong>{restaurant.restaurantName}</strong><small>{restaurant.ownerFirstName} {restaurant.ownerLastName} · {restaurant.ownerEmail}</small></span><span className="suggestion-type">{restaurant.verificationStatus === 'PENDING' ? 'Pending' : 'Restaurant'}</span></button>)}</div>}
        </div>
        <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={onDateApply}/>
        <ReportExport title="Restaurants" data={visibleRestaurants.map((restaurant) => ({ Restaurant: restaurant.restaurantName, Owner: `${restaurant.ownerFirstName} ${restaurant.ownerLastName}`, Email: restaurant.ownerEmail, Phone: restaurant.restaurantPhone, Address: restaurant.restaurantAddress, Registered: restaurant.registeredAt ? displayDate(restaurant.registeredAt.slice(0, 10)) : 'Not recorded', Status: restaurant.verificationStatus }))} dateFrom={dateFrom} dateTo={dateTo}/>
      </div>
      {(actionMessage || actionError) && <p className={`restaurant-action-message ${actionError ? 'error' : ''}`} role="status">{actionError || actionMessage}</p>}
      {error && <div className="restaurant-error" role="alert"><strong>Could not load restaurant registrations.</strong><span>{error}</span></div>}
      {loading ? <div className="restaurant-loading"><span className="auth-spinner"/>Loading restaurants…</div> : <div className="table-scroll"><table className="restaurant-table"><thead><tr><th>Restaurant</th><th>Owner</th><th>Contact</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleRestaurants.map((restaurant) => <tr key={restaurant.restaurantId}><td><strong>{restaurant.restaurantName}</strong><small>{restaurant.restaurantAddress}</small></td><td>{restaurant.ownerFirstName} {restaurant.ownerLastName}</td><td><a href={`mailto:${restaurant.ownerEmail}`}>{restaurant.ownerEmail}</a><small>{restaurant.restaurantPhone}</small></td><td>{restaurant.registeredAt ? displayDate(restaurant.registeredAt.slice(0, 10)) : 'Date not recorded'}</td><td><span className={`restaurant-status restaurant-status-${restaurant.verificationStatus.toLowerCase()}`}>{restaurant.verificationStatus === 'PENDING' ? 'Waiting for approval' : restaurant.verificationStatus === 'APPROVED' ? 'Approved' : 'Rejected'}</span></td><td className="restaurant-actions"><button type="button" className="restaurant-view-button" onClick={() => setSelectedRestaurant(restaurant)}>View details</button>{view === 'pending' && <><button type="button" className="restaurant-approve-button" onClick={() => onAction(restaurant, 'approve')}>Approve</button><button type="button" className="restaurant-reject-button" onClick={() => onAction(restaurant, 'reject')}>Reject</button></>}</td></tr>)}</tbody></table>{visibleRestaurants.length === 0 && !error && <p className="empty-state">{view === 'pending' ? 'No pending registrations match these filters.' : 'No restaurants match these filters.'}</p>}</div>}
    </section>
    {selectedRestaurant && <div className="report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRestaurant(null) }}><section className="restaurant-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="restaurant-detail-title"><button className="report-close" type="button" aria-label="Close details" onClick={() => setSelectedRestaurant(null)}><Icon name="close" size={20}/></button><span className="report-dialog-icon"><Icon name="restaurant" size={23}/></span><h2 id="restaurant-detail-title">{selectedRestaurant.restaurantName}</h2><p className="restaurant-detail-status">{selectedRestaurant.verificationStatus === 'PENDING' ? 'Waiting for approval' : selectedRestaurant.verificationStatus}</p><dl><dt>Owner</dt><dd>{selectedRestaurant.ownerFirstName} {selectedRestaurant.ownerLastName}</dd><dt>Email</dt><dd>{selectedRestaurant.ownerEmail}</dd><dt>Phone</dt><dd>{selectedRestaurant.restaurantPhone}</dd><dt>Address</dt><dd>{selectedRestaurant.restaurantAddress}</dd><dt>Registered</dt><dd>{selectedRestaurant.registeredAt ? displayDate(selectedRestaurant.registeredAt.slice(0, 10)) : 'Date not recorded'}</dd></dl><div className="rider-document-list"><strong>Restaurant menu</strong>{selectedMenu.map(item=><div key={item.id}>{item.image&&<img className="food-thumb" src={item.image} alt={item.name}/>}<span>{item.name} · Rs. {Number(item.price).toLocaleString()}</span></div>)}</div>{selectedRestaurant.documents?.length>0&&<div className="rider-document-list"><strong>Submitted documents</strong>{selectedRestaurant.documents.map(document=><a key={document.id} href={document.url} target="_blank" rel="noreferrer">{document.name}</a>)}</div>}</section></div>}
  </>
}

function DeliveryRidersPage({ riders, view, onView, search, onSearch, dateFrom, dateTo, onDateApply, onAction, actionMessage }) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [selectedRider, setSelectedRider] = useState(null)
  const datedRiders = riders.filter((rider) => {
    if (!rider.registeredAt) return true
    const registeredDate = rider.registeredAt.slice(0, 10)
    return registeredDate >= dateFrom && registeredDate <= dateTo
  })
  const pendingRiders = datedRiders.filter((rider) => rider.status === 'PENDING')
  const cancelledRiders = datedRiders.filter((rider) => rider.status === 'CANCELLED')
  const suspendedRiders = datedRiders.filter((rider) => rider.status === 'SUSPENDED')
  const ridersForView = view === 'pending' ? pendingRiders
    : view === 'cancelled' ? cancelledRiders
      : view === 'suspended' ? suspendedRiders
        : datedRiders
  const visibleRiders = ridersForView.filter((rider) => `${rider.firstName} ${rider.lastName} ${rider.email} ${rider.phone} ${rider.vehicleType} ${rider.vehicleNumber}`.toLowerCase().includes(search.trim().toLowerCase()))
  const suggestions = datedRiders
    .filter((rider) => !search.trim() || `${rider.firstName} ${rider.lastName} ${rider.email} ${rider.phone} ${rider.vehicleNumber}`.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 5)
  const filters = [['all', 'All Delivery Riders', datedRiders.length], ['pending', 'Waiting for Approval', pendingRiders.length], ['cancelled', 'Cancelled', cancelledRiders.length], ['suspended', 'Suspended', suspendedRiders.length]]
  const headings = { all: 'All Delivery Riders', pending: 'Waiting for Approval', cancelled: 'Cancelled Riders', suspended: 'Suspended Riders' }

  function chooseSuggestion(rider) {
    onSearch(`${rider.firstName} ${rider.lastName}`)
    setSearchFocused(false)
    setActiveSuggestion(-1)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      event.preventDefault()
      chooseSuggestion(suggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      setSearchFocused(false)
      setActiveSuggestion(-1)
    }
  }

  return <>
  <section className="panel restaurants-page">
    <div className="restaurants-page-heading"><div><h2>{headings[view]}</h2><p>Review delivery rider registrations and account status</p></div><span>{ridersForView.length} riders</span></div>
    <div className="restaurant-tabs" role="tablist" aria-label="Filter delivery riders by status">{filters.map(([key, label, count]) => <button type="button" role="tab" aria-selected={view === key} className={view === key ? 'active' : ''} key={key} onClick={() => onView(key)}>{key === 'all' && <Icon name="filter" size={15}/>}<span>{label}</span><small>{count}</small></button>)}</div>
    <div className="restaurants-toolbar">
      <div className="restaurant-search-wrap"><label className="order-search restaurant-search"><Icon name="search" size={17}/><span className="sr-only">Search delivery riders</span><input role="combobox" aria-autocomplete="list" aria-expanded={searchFocused && suggestions.length > 0} aria-controls="rider-search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `rider-suggestion-${activeSuggestion}` : undefined} value={search} onChange={(event) => { onSearch(event.target.value); setActiveSuggestion(-1) }} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} onKeyDown={handleSearchKeyDown} placeholder="Search riders, email, or vehicle..."/>{search && <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSearch(''); setActiveSuggestion(-1) }}><Icon name="close" size={15}/></button>}</label>
        {searchFocused && suggestions.length > 0 && <div className="order-search-suggestions restaurant-suggestions" id="rider-search-suggestions" role="listbox"><div className="suggestion-heading">{search.trim() ? 'Matching riders' : 'Delivery riders'}</div>{suggestions.map((rider, index) => <button type="button" id={`rider-suggestion-${index}`} role="option" aria-selected={activeSuggestion === index} className={`order-suggestion ${activeSuggestion === index ? 'active' : ''}`} key={rider.riderId} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(rider)}><span className="suggestion-order-icon"><Icon name="rider" size={16}/></span><span className="suggestion-copy"><strong>{rider.firstName} {rider.lastName}</strong><small>{rider.email} · {rider.phone}</small></span><span className="suggestion-type">{rider.status === 'PENDING' ? 'Pending' : rider.status[0] + rider.status.slice(1).toLowerCase()}</span></button>)}</div>}
      </div>
      <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={onDateApply}/>
      <ReportExport title="Delivery Riders" data={visibleRiders.map((rider) => ({ 'Rider ID': rider.riderId, Name: `${rider.firstName} ${rider.lastName}`, Email: rider.email, Phone: rider.phone, Vehicle: rider.vehicleType, Registration: rider.vehicleNumber, Registered: rider.registeredAt ? displayDate(rider.registeredAt.slice(0, 10)) : 'Not recorded', Status: rider.status }))} dateFrom={dateFrom} dateTo={dateTo}/>
    </div>
    {actionMessage && <p className="restaurant-action-message" role="status">{actionMessage}</p>}
    <div className="table-scroll"><table className="restaurant-table"><thead><tr><th>Delivery Rider</th><th>Contact</th><th>Vehicle</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleRiders.map((rider) => <tr key={rider.riderId}><td><strong>{rider.firstName} {rider.lastName}</strong><small>Rider #{rider.riderId}</small></td><td><a href={`mailto:${rider.email}`}>{rider.email}</a><small>{rider.phone}</small></td><td>{rider.vehicleType}<small>{rider.vehicleNumber}</small></td><td>{rider.registeredAt ? displayDate(rider.registeredAt.slice(0, 10)) : 'Date not recorded'}</td><td><span className={`rider-status rider-status-${rider.status.toLowerCase()}`}>{rider.status === 'PENDING' ? 'Waiting for approval' : rider.status[0] + rider.status.slice(1).toLowerCase()}</span></td><td className="restaurant-actions"><button type="button" className="restaurant-view-button" onClick={() => setSelectedRider(rider)}>See details</button>{rider.status === 'PENDING' && <><button type="button" className="restaurant-approve-button" onClick={() => onAction(rider, 'approve')}>Approve</button><button type="button" className="restaurant-reject-button" onClick={() => onAction(rider, 'cancel')}>Cancel</button></>}{rider.status === 'ACTIVE' && <button type="button" className="restaurant-reject-button" onClick={() => onAction(rider, 'suspend')}>Suspend</button>}{rider.status === 'SUSPENDED' && <button type="button" className="restaurant-approve-button" onClick={() => onAction(rider, 'reactivate')}>Reactivate</button>}</td></tr>)}</tbody></table>{visibleRiders.length === 0 && <p className="empty-state">No delivery riders match these filters.</p>}</div>
  </section>
  {selectedRider && <div className="report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRider(null) }}><section className="restaurant-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="rider-detail-title"><button className="report-close" type="button" aria-label="Close rider details" onClick={() => setSelectedRider(null)}><Icon name="close" size={20}/></button><span className="report-dialog-icon"><Icon name="rider" size={23}/></span><h2 id="rider-detail-title">{selectedRider.firstName} {selectedRider.lastName}</h2><p className="restaurant-detail-status">{selectedRider.status === 'PENDING' ? 'Waiting for approval' : selectedRider.status[0] + selectedRider.status.slice(1).toLowerCase()}</p><dl><dt>Rider ID</dt><dd>#{selectedRider.riderId}</dd><dt>Email</dt><dd>{selectedRider.email || 'Not provided'}</dd><dt>Phone</dt><dd>{selectedRider.phone || 'Not provided'}</dd>{selectedRider.dateOfBirth && <><dt>Date of birth</dt><dd>{displayDate(selectedRider.dateOfBirth)}</dd></>}{selectedRider.nationalId && <><dt>NIC number</dt><dd>{selectedRider.nationalId}</dd></>}{selectedRider.licenseNumber && <><dt>Driving licence</dt><dd>{selectedRider.licenseNumber}</dd></>}<dt>Address</dt><dd>{[selectedRider.addressLine1, selectedRider.addressLine2, selectedRider.addressLine3].filter(Boolean).join(', ') || selectedRider.address || 'Not provided'}</dd><dt>Vehicle</dt><dd>{selectedRider.vehicleType || 'Not provided'}</dd><dt>Registration</dt><dd>{selectedRider.vehicleNumber || selectedRider.vehicleRegistrationNumber || 'Not provided'}</dd><dt>Registered</dt><dd>{selectedRider.registeredAt ? displayDate(selectedRider.registeredAt.slice(0, 10)) : 'Date not recorded'}</dd></dl>{selectedRider.vehicleChanges?.filter(change=>change.status==='PENDING_REVIEW').map(change=><div className="refund-decision-actions" key={change.id}><span>Vehicle review: {change.registration}</span><button className="restaurant-approve-button" onClick={async()=>{try{await api('/api/admin/vehicle-changes/'+change.id+'/approve',{method:'POST'});await onAction(selectedRider,'refresh');setSelectedRider(null)}catch(error){window.alert(error.message)}}}>Approve vehicle change</button><button className="restaurant-reject-button" onClick={async()=>{try{await api('/api/admin/vehicle-changes/'+change.id+'/reject',{method:'POST'});await onAction(selectedRider,'refresh');setSelectedRider(null)}catch(error){window.alert(error.message)}}}>Reject vehicle change</button></div>)}{Array.isArray(selectedRider.documents) && selectedRider.documents.length > 0 && <div className="rider-document-list"><strong>Submitted documents</strong>{selectedRider.documents.map((document) => <a key={document.name} href={document.url} target="_blank" rel="noreferrer">{document.name}</a>)}</div>}</section></div>}
  </>
}

function BusinessPolicyEditor() {
  const fields=[['delivery_fee','Delivery fee (LKR)'],['commission_rate','Merchant commission rate (0–1)'],['driver_service_rate','Driver service rate (0–1)'],['reward_discount_rate','Reward discount rate (0–1)'],['reward_minimum_points','Minimum redemption points'],['reward_tier_one','Reward tier one threshold'],['reward_tier_two','Reward tier two threshold'],['reward_tier_three','Reward tier three threshold'],['reward_points_base','Base earned points'],['reward_points_one','Tier one earned points'],['reward_points_two','Tier two earned points'],['reward_points_three','Tier three earned points']]
  const [open,setOpen]=useState(false),[values,setValues]=useState({}),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  async function edit(){setOpen(true);setBusy(true);setLoaded(false);setError('');setMessage('');try{setValues(await api('/api/admin/policies'));setLoaded(true)}catch(error){setError(error.message)}finally{setBusy(false)}}
  async function save(event){event.preventDefault();if(busy||!loaded)return;setBusy(true);setError('');setMessage('');try{const body={};for(const [key] of fields){if(values[key]==null||values[key]===''||!Number.isFinite(Number(values[key])))throw new Error('Enter each actual business policy value.');body[key]=Number(values[key])}await api('/api/admin/policies',{method:'PUT',body});setValues(await api('/api/admin/policies'));setMessage('Business policies saved to the database. Existing order snapshots are preserved.')}catch(error){setError(error.message)}finally{setBusy(false)}}
  return <section className="panel coupons-page"><div className="coupons-heading"><div><h2>Business Policies</h2><p>Set actual delivery fees, service rates and reward rules.</p></div><button className="soft-button" type="button" onClick={edit} disabled={busy}>Edit business policies</button></div>{open&&<form className="coupon-create-form" onSubmit={save}><div className="coupon-form-heading"><div><h3>Fees, rates &amp; rewards</h3><p>Rates are fractions from 0 to 1. No sample business values are supplied.</p></div><button className="coupon-close" type="button" aria-label="Close business policies" onClick={()=>setOpen(false)}><Icon name="close"/></button></div>{loaded&&<><div className="coupon-form-grid">{fields.map(([key,label])=><label className="coupon-field" key={key}><span>{label}</span><input type="number" required min={key==='reward_minimum_points'||key.startsWith('reward_points')?'1':'0'} max={key.endsWith('rate')?'1':'1000000'} step={key==='reward_minimum_points'||key.startsWith('reward_points')?'1':key.endsWith('rate')?'0.0001':'0.01'} value={values[key]??''} onChange={event=>setValues(current=>({...current,[key]:event.target.value}))}/></label>)}</div><div className="coupon-form-footer"><small>Changes affect future calculations. Existing recorded order amounts are not rewritten.</small><button className="report-primary-button" type="submit" disabled={busy}>{busy?'Saving…':'Save business policies'}</button></div></>}</form>}{(message||error)&&<p className={'coupon-feedback '+(error?'error':'')} role={error?'alert':'status'}>{error||message}</p>}</section>
}

function CustomerManagement({users,onChange}) {
 const [query,setQuery]=useState(''),[message,setMessage]=useState('')
 const rows=users.filter(user=>[user.firstName,user.lastName,user.email,user.phone].join(' ').toLowerCase().includes(query.toLowerCase()))
 async function change(user){try{await api('/api/admin/users/'+user.id,{method:'PATCH',body:{active:!user.active}});await onChange();setMessage('Customer account status updated.')}catch(error){setMessage(error.message)}}
 return <section className="panel restaurants-page"><div className="restaurants-page-heading"><div><h2>Customer Management</h2><p>Review registered customers and account access.</p></div><span>{rows.length} customers</span></div><label className="order-search"><Icon name="search" size={17}/><span className="sr-only">Search customers</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search customers..."/></label>{message&&<p className="payment-feedback" role="status">{message}</p>}<div className="table-scroll"><table><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Registered</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map(user=><tr key={user.id}><td>{user.firstName} {user.lastName}</td><td>{user.email}</td><td>{user.phone}</td><td>{displayDate(user.createdAt.slice(0,10))}</td><td>{user.active?'Active':'Suspended'}</td><td><button className={user.active?'restaurant-reject-button':'restaurant-approve-button'} onClick={()=>change(user)}>{user.active?'Suspend customer':'Reactivate customer'}</button></td></tr>)}</tbody></table>{!rows.length&&<p className="empty-state">No customers match this search.</p>}</div></section>
}

function AdminDashboard({ onLogout, previewMode = false }) {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [readNotificationIds,setReadNotificationIds]=useState([])
  const [notifications,setNotifications]=useState([])
  const [orders,setOrders]=useState([])
  const [users,setUsers]=useState([])
  const [statistics,setStatistics]=useState({})
  const [adminAccount,setAdminAccount]=useState(null)
  const [dateFrom, setDateFrom] = useState(() => isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30)))
  const [dateTo, setDateTo] = useState(() => isoDate(new Date()))
  const [revenuePeriod, setRevenuePeriod] = useState('This Month')
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [restaurantView, setRestaurantView] = useState('all')
  const [restaurantSearch, setRestaurantSearch] = useState('')
  const [restaurantDateFrom, setRestaurantDateFrom] = useState('2020-01-01')
  const [restaurantDateTo, setRestaurantDateTo] = useState(() => isoDate(new Date()))
  const [restaurants, setRestaurants] = useState([])
  const [restaurantsLoading, setRestaurantsLoading] = useState(false)
  const [restaurantsError, setRestaurantsError] = useState('')
  const [restaurantActionMessage, setRestaurantActionMessage] = useState('')
  const [restaurantActionError, setRestaurantActionError] = useState('')
  const [riderView, setRiderView] = useState('all')
  const [riderSearch, setRiderSearch] = useState('')
  const [riderDateFrom, setRiderDateFrom] = useState('2020-01-01')
  const [riderDateTo, setRiderDateTo] = useState(() => isoDate(new Date()))
  const [deliveryRiders, setDeliveryRiders] = useState([])
  const [riderActionMessage, setRiderActionMessage] = useState('')
  const [payments, setPayments] = useState([])
  const [paymentActionMessage, setPaymentActionMessage] = useState('')
  const [refunds, setRefunds] = useState([])
  const [refundActionMessage, setRefundActionMessage] = useState('')
  const [refundFocusId, setRefundFocusId] = useState('')

  const unreadNotificationCount = notifications.filter((item) => item.unread && !readNotificationIds.includes(item.id)).length

  async function refreshPlatform(){
    try{const data=await platformData();setOrders(data.orders);setRestaurants(data.restaurants);setDeliveryRiders(data.riders);setUsers(data.users);setPayments(data.payments);setRefunds(data.refunds);setNotifications(data.notifications);setReadNotificationIds(data.notifications.filter(note=>!note.unread).map(note=>note.id));setStatistics(data.statistics);setAdminAccount(data.account);setRestaurantsError('')}catch(error){setRestaurantsError(error.message)}finally{setRestaurantsLoading(false)}
  }
  useEffect(()=>{setRestaurantsLoading(true);refreshPlatform();const timer=setInterval(refreshPlatform,4000);return()=>clearInterval(timer)},[])
  async function markAllRead(){try{await api('/api/notifications/read-all',{method:'POST'});await refreshPlatform()}catch(error){setRestaurantsError(error.message)}}
  const activeRiders=deliveryRiders.filter(rider=>rider.status==='ACTIVE').length
  const revenueStart=(()=>{const now=new Date();if(revenuePeriod==='This Year')return new Date(now.getFullYear(),0,1);if(revenuePeriod==='This Quarter')return new Date(now.getFullYear(),Math.floor(now.getMonth()/3)*3,1);if(revenuePeriod==='This Week')return new Date(now.getFullYear(),now.getMonth(),now.getDate()-(now.getDay()+6)%7);return new Date(now.getFullYear(),now.getMonth(),1)})()
  const periodRevenue=payments.filter(payment=>payment.status==='COMPLETED'&&new Date(payment.paidDate)>=revenueStart).reduce((sum,payment)=>sum+Number(payment.amount),0)
  async function openNotification(item) {
    try{await api('/api/notifications/'+item.id+'/read',{method:'POST'})}catch(error){setRestaurantsError(error.message);return}
    setReadNotificationIds((current) => current.includes(item.id) ? current : [...current, item.id])
    setNotificationsOpen(false)
    setSearchOpen(false)
    if (item.destination === 'Orders' && item.recordId) setSearch(item.recordId)
    if (item.destination === 'Restaurants') setRestaurantView('pending')
    if (item.destination === 'Delivery Riders') setRiderView('pending')
    if (item.destination === 'Refunds' && item.recordId) setRefundFocusId(item.recordId)
    setActiveNav(item.destination)
  }

  const filteredOrders = useMemo(() => orders.filter((order) => `${order.id} ${order.customer} ${order.restaurant} ${order.status}`.toLowerCase().includes(search.toLowerCase())), [orders, search])
  const ordersPageData = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer} ${order.restaurant} ${order.status}`.toLowerCase().includes(search.toLowerCase())
    const matchesDate = order.placedDate >= dateFrom && order.placedDate <= dateTo
    const matchesStatus = orderStatusFilter === 'all'
      || (orderStatusFilter === 'live' && ['Preparing', 'Confirmed', 'Ready', 'Picked Up'].includes(order.status))
      || (orderStatusFilter === 'complete' && order.status === 'Delivered')
      || (orderStatusFilter === 'cancelled' && order.status === 'Cancelled')
    return matchesSearch && matchesDate && matchesStatus
  }), [orders, dateFrom, dateTo, orderStatusFilter, search])

  async function handleRestaurantAction(restaurant,action){setRestaurantActionError('');try{await api('/api/admin/merchants/'+restaurant.merchantId+'/'+action,{method:'POST',body:undefined});await refreshPlatform();setRestaurantActionMessage(restaurant.restaurantName+' '+action+' recorded.')}catch(error){setRestaurantActionError(error.message)}}
  async function handleRiderAction(rider,action){if(action==='refresh'){await refreshPlatform();return}try{await api('/api/admin/riders/'+rider.riderId+'/'+(action==='cancel'?'reject':action),{method:'POST',body:undefined});await refreshPlatform();setRiderActionMessage('Rider '+action+' recorded.')}catch(error){setRiderActionMessage(error.message)}}
  async function handlePaymentCancel(payment){try{await api('/api/admin/payments/'+payment.id+'/cancel',{method:'POST'});await refreshPlatform();setPaymentActionMessage('Pending payment cancelled.')}catch(error){setPaymentActionMessage(error.message)}}
  async function handleRefundDecision(refund,status){try{await api('/api/admin/refunds/'+refund.id,{method:'POST',body:{status}});await refreshPlatform();setRefundActionMessage('Refund decision recorded. No money was transferred.')}catch(error){setRefundActionMessage(error.message)}}

  return <div className="dashboard-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><FoodieLogo /><button className="sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><Icon name="close" /></button></div>
      <nav className="side-nav" aria-label="Admin navigation">
        {navGroups.map((group) => <div className="nav-group" key={group.label || 'main'}>
          {group.label && <p className="nav-heading">{group.label}</p>}
          {group.links.map(([label, icon]) => <button key={label} className={`nav-link ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setSearchOpen(false); setSidebarOpen(false) }}><Icon name={icon} size={18}/><span>{label}</span></button>)}
        </div>)}
      </nav>
      <div className="sidebar-account"><div className="account-avatar">AD</div><span><strong>{adminAccount?[adminAccount.firstName,adminAccount.lastName].join(' '):'Administrator'}</strong><small>{adminAccount?.role || 'ADMIN'}</small></span><button type="button" aria-label="Account and logout options" title="Log out" onClick={() => setLogoutConfirmOpen(true)}><Icon name="more" /></button></div>
    </aside>

    <main className="dashboard-main">
      <header className="topbar">
        <button type="button" className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={20}/></button>
        <div className="page-heading"><h1>{activeNav === 'Notifications' ? 'Notification Center' : activeNav}</h1><p>{activeNav === 'Orders' ? 'Review order details and fulfillment status' : activeNav === 'Restaurants' ? 'Manage restaurant registrations and applications' : activeNav === 'Delivery Riders' ? 'Manage rider registrations and delivery accounts' : activeNav === 'Payments' ? 'Monitor payment transactions and methods' : activeNav === 'Refunds' ? 'Review customer refund requests and order details' : activeNav === 'Complaints' ? 'Review complaints and respond to the person who submitted them' : activeNav === 'Notifications' ? 'Stay up to date and open the section that needs your attention' : activeNav === 'Coupons & Offers' ? 'Create and manage redeemable coupon codes' : 'Monitor your food delivery business performance'}</p></div>
        <div className="top-actions">
          {!['Orders', 'Restaurants', 'Delivery Riders', 'Payments', 'Refunds', 'Complaints', 'Notifications', 'Coupons & Offers'].includes(activeNav) && <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onApply={(from, to) => { setDateFrom(from); setDateTo(to)}}/>}
          {!['Orders', 'Restaurants', 'Delivery Riders', 'Payments', 'Refunds', 'Complaints', 'Notifications', 'Coupons & Offers'].includes(activeNav) && <button className={`icon-button search-toggle ${searchOpen ? 'selected' : ''}`} aria-label="Search orders" onClick={() => { setSearchOpen(!searchOpen); setSearch('') }}><Icon name="search" size={20}/></button>}
          <div className="notification-wrap"><button className={`icon-button ${notificationsOpen ? 'selected' : ''}`} aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}><Icon name="bell" size={20}/>{unreadNotificationCount > 0 && <span className="notification-count">{unreadNotificationCount}</span>}</button>
            {notificationsOpen && <section className="notification-popover"><div className="popover-head"><div><strong>Notifications</strong><small>{notifications.length} updates · {unreadNotificationCount} unread</small></div><button type="button" disabled={unreadNotificationCount === 0} onClick={markAllRead}>Mark all read</button></div>{notifications.slice(0, 3).map((note) => { const isUnread = note.unread && !readNotificationIds.includes(note.id); return <button type="button" className={`notification-item notification-popover-item ${isUnread ? 'unread' : ''}`} key={note.id} onClick={() => openNotification(note)}><span className="notification-bullet"/><span className="notification-item-copy"><strong>{note.title}</strong><span>{note.text}</span><small>{note.time}</small></span></button> })}<button className="all-notifications" onClick={() => { setActiveNav('Notifications'); setNotificationsOpen(false) }}>View notification center</button></section>}
          </div>
          <button className="profile-button" aria-label="Account and logout options" title="Log out" onClick={() => setLogoutConfirmOpen(true)}><span className="profile-avatar">AD</span><Icon name="down" size={14}/></button>
        </div>
      </header>

      {searchOpen && <div className="search-bar"><Icon name="search" size={18}/><input autoFocus placeholder="Search order, customer, or restaurant..." value={search} onChange={(e) => setSearch(e.target.value)} /><button onClick={() => { setSearch(''); setSearchOpen(false) }} aria-label="Close search"><Icon name="close" size={18}/></button></div>}

      {activeNav === 'Customers' ? <CustomerManagement users={users.filter(user=>user.role==='CUSTOMER')} onChange={refreshPlatform}/> : activeNav === 'Restaurants' ? <RestaurantPage restaurants={restaurants} loading={restaurantsLoading} error={restaurantsError} view={restaurantView} onView={setRestaurantView} search={restaurantSearch} onSearch={setRestaurantSearch} dateFrom={restaurantDateFrom} dateTo={restaurantDateTo} onDateApply={(from, to) => { setRestaurantDateFrom(from); setRestaurantDateTo(to) }} onAction={handleRestaurantAction} actionMessage={restaurantActionMessage} actionError={restaurantActionError}/> : activeNav === 'Delivery Riders' ? <DeliveryRidersPage riders={deliveryRiders} view={riderView} onView={setRiderView} search={riderSearch} onSearch={setRiderSearch} dateFrom={riderDateFrom} dateTo={riderDateTo} onDateApply={(from, to) => { setRiderDateFrom(from); setRiderDateTo(to) }} onAction={handleRiderAction} actionMessage={riderActionMessage}/> : activeNav === 'Payments' ? <PaymentsPage payments={payments} onCancel={handlePaymentCancel} actionMessage={paymentActionMessage}/> : activeNav === 'Refunds' ? <RefundsPage refunds={refunds} onDecision={handleRefundDecision} actionMessage={refundActionMessage} focusRequestId={refundFocusId}/> : activeNav === 'Complaints' ? <ComplaintsPage/> : activeNav === 'Notifications' ? <NotificationCenterPage items={notifications} readIds={readNotificationIds} onOpen={openNotification} onMarkAllRead={markAllRead}/> : activeNav === 'Coupons & Offers' ? <CouponsOffersPage/> : activeNav === 'Orders' ? <OrdersPage orders={ordersPageData} allOrders={orders} search={search} onSearch={setSearch} statusFilter={orderStatusFilter} onStatusFilter={setOrderStatusFilter} dateFrom={dateFrom} dateTo={dateTo} onDateApply={(from, to) => { setDateFrom(from); setDateTo(to) }}/> : <>
      <section className="stats-grid" aria-label="Platform summary">
        <StatCard icon="wallet" label="Total Revenue" value={'Rs. '+Number(statistics.collectedSales || 0).toLocaleString()} tint="mint" />
        <StatCard icon="bag" label="Total Orders" value={statistics.orders ?? '—'} tint="blue" />
        <StatCard icon="rider" label="Active Riders" value={activeRiders} tint="amber" />
        <StatCard icon="user" label="Total Users" value={statistics.users ?? '—'} tint="lilac" />
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-column primary-column">
          <section className="panel chart-panel"><div className="panel-heading"><div><h2>Order Overview</h2><p>{displayDate(dateFrom)} – {displayDate(dateTo)}</p></div><button className="soft-button" onClick={() => setActiveNav('Orders')}>View Orders</button></div><div className="chart-empty-state">{ordersPageData.length} orders in this date range. {ordersPageData.filter(order=>order.status==='Delivered').length} completed.</div></section>

          <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent Orders</h2><p>Latest platform activity</p></div><button className="soft-button" onClick={() => setActiveNav('Orders')}>View All Orders</button></div>
            <div className="table-scroll"><table><thead><tr><th>Order ID</th><th>Customer</th><th>Restaurant</th><th>Amount</th><th>Status</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id}><td className="order-id">#{order.id}</td><td>{order.customer}</td><td>{order.restaurant}</td><td className="amount">{order.amount}</td><td><OrderStatus status={order.status}/></td></tr>)}</tbody></table>{filteredOrders.length === 0 && <p className="empty-state">No order data available.</p>}</div>
          </section>
        </div>

        <div className="dashboard-column secondary-column">
          <section className="panel live-panel"><div className="panel-heading"><div className="live-title"><div><h2>Live Orders</h2><p>Recent activity</p></div></div><button className="soft-button" onClick={() => setActiveNav('Orders')}>View All</button></div>
            <div className="live-orders">{filteredOrders.filter(order=>!['Delivered','Cancelled'].includes(order.status)).slice(0, 5).map((order) => <article className="live-order" key={order.id}><FoodThumb color={order.color}/><div className="live-order-info"><strong>#{order.id}</strong><span>{order.restaurant}</span><small>{order.items} · {order.ago}</small></div><OrderStatus status={order.status}/></article>)}{filteredOrders.length === 0 && <p className="empty-state">No active orders.</p>}</div>
          </section>

          <section className="panel revenue-panel"><div className="panel-heading"><div><h2>Revenue Overview</h2><p>Revenue sources</p></div><label className="period-select"><span className="sr-only">Revenue period</span><select value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value)}><option>This Week</option><option>This Month</option><option>This Quarter</option><option>This Year</option></select><Icon name="down" size={14}/></label></div>
            <div className="chart-empty-state">{payments.filter(payment=>payment.status==='COMPLETED').length} recorded collected payments.</div>
            <div className="total-revenue"><strong>Total Revenue</strong><b>Rs. {periodRevenue.toLocaleString()}</b></div>
          </section>
        </div>
      </div>
      <BusinessPolicyEditor/>
      </>}
    </main>
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    {logoutConfirmOpen && <div className="report-backdrop logout-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLogoutConfirmOpen(false) }}><section className="report-dialog logout-dialog" role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description"><button className="report-close" type="button" aria-label="Close logout confirmation" onClick={() => setLogoutConfirmOpen(false)}><Icon name="close" size={20}/></button><span className="logout-dialog-icon"><Icon name="user" size={22}/></span><h2 id="logout-title">Log out?</h2><p id="logout-description">Are you sure you want to log out of the admin portal?</p><div className="logout-dialog-actions"><button type="button" className="logout-cancel-button" onClick={() => setLogoutConfirmOpen(false)}>Cancel</button><button type="button" className="logout-confirm-button" onClick={onLogout}>Log out</button></div></section></div>}
  </div>
}

async function getLoginCsrfToken() {
  const response = await apiFetch('/login', { credentials: 'include', headers: { Accept: 'text/html' } })
  if (!response.ok) throw new Error(`Admin sign-in service returned ${response.status}. Check that the backend is running on localhost:8081.`)
  const html = await response.text()
  const documentPage = new DOMParser().parseFromString(html, 'text/html')
  const csrf = documentPage.querySelector('input[name="_csrf"]')?.value
  if (!csrf) throw new Error('Could not start a secure sign-in. Please refresh and try again.')
  return csrf
}

async function checkAdminSession() {
  const response = await apiFetch('/api/admin/test', { credentials: 'include', headers: { Accept: 'application/json' } })
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false
  const result = await response.json()
  return result.message === 'Platform Admin authentication successful'
}

async function getAdminCsrfToken() {
  const response = await apiFetch('/api/admin/csrf', { credentials: 'include', headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Could not securely sign out. Please try again.')
  const payload = await response.json()
  return payload.token
}

function LoginPage({ onSuccess, onPreview }) {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const email=String(form.get('email') || ''),password=String(form.get('password') || '')
      const setupToken=new URLSearchParams(window.location.search).get('setupToken')
      if(setupToken){await api('/api/auth/setup-password',{method:'POST',body:{email,token:setupToken,password}});window.history.replaceState({},'',window.location.pathname)}
      await signIn(email,password,'ADMIN');onSuccess()
    } catch (error) {
      setMessage(error instanceof TypeError ? 'Unable to connect to the Foodie backend. Start the backend and try again.' : error.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-screen">
    <div className="auth-ambient auth-ambient-top"/><div className="auth-ambient auth-ambient-bottom"/>
    <section className="auth-intro">
      <div className="auth-brand"><span className="auth-hat"><svg viewBox="0 0 52 56" aria-hidden="true"><path d="M14 31a12 12 0 1 1 23-6 10 10 0 1 1 4 19v9H11v-9a10 10 0 0 1 3-13Z" fill="white" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round"/><path d="M12 42h29" stroke="currentColor" strokeWidth="3.2"/></svg></span><span><strong>Foodie</strong><small>GOOD FOOD&nbsp; • &nbsp;HAPPY PEOPLE</small></span></div>
      <div className="auth-intro-copy"><h1>Admin <span>Portal</span></h1><p>Manage, Monitor, and Grow<br/>the Foodie Platform</p>
        <ul><li><span><Icon name="grid" size={25}/></span><div><strong>Platform Overview</strong><small>Track key metrics and activity</small></div></li><li><span><Icon name="restaurant" size={25}/></span><div><strong>Merchant Management</strong><small>Review and verify restaurant applications</small></div></li><li><span><Icon name="users" size={25}/></span><div><strong>User Management</strong><small>Manage customers, drivers, and partners</small></div></li><li><span><Icon name="shield" size={25}/></span><div><strong>Secure &amp; Reliable</strong><small>Keep the platform safe and trusted</small></div></li></ul>
      </div>
      <div className="auth-city" aria-hidden="true"><span/><span/><span/><span/><span/><span/><span/><span/><b>RESTAURANT</b></div>
    </section>
    <section className="auth-form-side"><div className="auth-card">
      <p className="auth-eyebrow">WELCOME BACK</p><h2>Admin Login</h2><p className="auth-subtitle">Sign in to access the Foodie Admin Portal</p>
      <form onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="admin-email">Email Address</label><div className="auth-input"><Icon name="mail" size={21}/><input id="admin-email" name="email" defaultValue={new URLSearchParams(window.location.search).get('email') || ''} type="email" autoComplete="username" placeholder="Enter your admin email" required /></div>
        <label className="auth-label auth-password-label" htmlFor="admin-password">Password</label><div className="auth-input"><Icon name="lock" size={21}/><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}><Icon name="eye" size={19}/></button></div>
        <div className="auth-options"><label><input type="checkbox" name="remember" disabled title="Persistent sign-in is not configured on the backend"/><span>Remember me</span></label><button type="button" onClick={async()=>{try{const email=document.querySelector('#admin-email')?.value;await api('/api/auth/recovery',{method:'POST',body:{email}});setMessage('If eligible, recovery instructions were queued. Email delivery requires configured SMTP.')}catch(error){setMessage(error.message)}}}>Forgot password?</button></div>
        {message && <p className="auth-message" role="alert">{message}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'} {!busy && <Icon name="arrow" size={19}/>}</button>
      </form>
      <div className="auth-divider"><span/>OR<span/></div><aside className="auth-notice"><Icon name="shield" size={34}/><div><strong>Authorized Personnel Only</strong><small>This portal is restricted to Foodie administrators.</small></div></aside>
      {false && <button className="auth-preview-button" type="button" onClick={()=>document.querySelector('#admin-email')?.focus()}>Admin sign-in required <span>Authorized accounts only</span></button>}
      <p className="auth-session-note">Secure sign-in uses your Foodie admin account.</p>
    </div></section>
  </main>
}

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true
    checkAdminSession().then((valid) => { if (active) setAuthenticated(valid) }).catch(() => { if (active) setAuthenticated(false) }).finally(() => { if (active) setCheckingSession(false) })
    return () => { active = false }
  }, [])

  async function signOut() {
    try {
      await api('/api/auth/logout',{method:'POST'});setAuthenticated(false)
    } catch {
      // Keep the dashboard visible if the backend did not confirm logout.
    }
  }

  if (checkingSession) return <main className="auth-loading"><span className="auth-spinner"/><p>Checking admin session…</p></main>
  if (authenticated) return <AdminDashboard onLogout={signOut}/>
  return <LoginPage onSuccess={() => setAuthenticated(true)} onPreview={() => setPreviewMode(true)}/>
}

export default App
