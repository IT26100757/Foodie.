import { downloadExcel, downloadPdf, downloadWord } from './walletReportExports.js'
import { useEffect, useMemo, useRef, useState } from 'react'

const ranges = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'threeMonths', label: 'Last 3 months' },
  { key: 'year', label: 'This year' },
]
const statuses = ['All orders', 'Completed', 'Rejected']
const money = (amount, currency = 'LKR') => {
  try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount) }
  catch { return `${currency} ${Number(amount || 0).toFixed(2)}` }
}
const numeric = (value) => {
  if (value === null || value === undefined || value === '') return 0
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}
const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const orderDay = (value) => {
  if (!value) return null
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const rangeStart = (range, now) => {
  const today = dayStart(now)
  if (range === 'today') return today
  if (range === 'week') {
    const mondayOffset = (today.getDay() + 6) % 7
    today.setDate(today.getDate() - mondayOffset)
    return today
  }
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (range === 'threeMonths') return new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return new Date(now.getFullYear(), 0, 1)
}
const readItems = (items) => {
  if (!Array.isArray(items)) return items ? String(items) : '—'
  if (!items.length) return '—'
  return items.map((item) => {
    if (typeof item === 'string') return item
    const quantity = Number(item.quantity ?? item.count ?? 1)
    const name = item.name || item.itemName || item.title || item.menuItem?.name || item.item?.name || 'Item'
    return `${name}${quantity > 1 ? ` × ${quantity}` : ''}`
  }).join(', ')
}
function reportRow(order) {
  const customerAgreed = order.customerAgreedToAdditionalCharges === true
  const total = numeric(order.total)
  const additional = customerAgreed ? numeric(order.additionalCharge) : 0
  const net = total + additional
  const fee = numeric(order.serviceCharge)
  return {
    id: order.id ?? '—',
    items: readItems(order.items),
    date: order.date || '—',
    time: order.time || '—',
    total,
    additional,
    net,
    fee,
    currency: order.currency || 'LKR',
    status: order.status || 'Pending',
  }
}
function isCompleted(status) { return ['complete', 'completed', 'delivered', 'picked_up'].includes(String(status || '').toLowerCase()) }
function isRejected(status) { return ['reject', 'rejected', 'cancelled', 'canceled'].includes(String(status || '').toLowerCase()) }

export default function WalletReports({ orders = [], onClose }) {
  const [range, setRange] = useState('month')
  const [status, setStatus] = useState('All orders')
  const [exporting, setExporting] = useState('')
  const [error, setError] = useState('')
  const [periodOpen, setPeriodOpen] = useState(false)
  const periodRef = useRef(null)
  const label = ranges.find((item) => item.key === range)?.label || 'This month'
  useEffect(() => {
    if (!periodOpen) return undefined
    const closeOutside = (event) => { if (!periodRef.current?.contains(event.target)) setPeriodOpen(false) }
    const closeOnEscape = (event) => { if (event.key === 'Escape') setPeriodOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape) }
  }, [periodOpen])
  const rows = useMemo(() => orders.map(reportRow).filter((row, index) => {
    const day = orderDay(orders[index]?.date)
    const now = new Date()
    const from = rangeStart(range, now)
    const through = dayStart(now)
    const inRange = day && day >= from && day <= through
    const inStatus = status === 'All orders' || (status === 'Completed' ? isCompleted(row.status) : isRejected(row.status))
    return inRange && inStatus
  }).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)), [orders, range, status])
  const totals = useMemo(() => rows.reduce((sum, row) => ({
    total: sum.total + row.total,
    additional: sum.additional + row.additional,
    net: sum.net + row.net,
    fee: sum.fee + row.fee,
  }), { total: 0, additional: 0, net: 0, fee: 0 }), [rows])
  const report = { title: 'Foodie Merchant Business Report', period: label, status, generatedAt: new Date(), rows, totals }

  async function exportAs(format) {
    setError('')
    setExporting(format)
    try {
      if (format === 'PDF') await downloadPdf(report)
      if (format === 'Word') await downloadWord(report)
      if (format === 'Excel') await downloadExcel(report)
    } catch {
      setError(`Could not create the ${format} report. Please try again.`)
    } finally {
      setExporting('')
    }
  }

  return <div className="wallet-report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="wallet-report-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-report-title">
      <button type="button" className="wallet-dialog-close" aria-label="Close report" onClick={onClose}>×</button>
      <span className="wallet-section-kicker">WALLET REPORTS</span>
      <h2 id="wallet-report-title">Business report</h2>
      <p>Choose a reporting period and order status, then export the matching report.</p>
      <div className="wallet-report-filters">
        <div className="wallet-report-period-field"><span>Reporting period</span><div className="wallet-report-period" ref={periodRef}><button type="button" className="wallet-report-period-trigger" aria-haspopup="listbox" aria-expanded={periodOpen} onClick={() => setPeriodOpen((open) => !open)}>{label}<span aria-hidden="true">⌄</span></button>{periodOpen && <div className="wallet-report-period-menu" role="listbox" aria-label="Reporting period">{ranges.map((item) => <button type="button" role="option" aria-selected={range === item.key} className={range === item.key ? 'selected' : ''} key={item.key} onClick={() => { setRange(item.key); setPeriodOpen(false) }}>{item.label}</button>)}</div>}</div></div>
        <div><span className="wallet-report-filter-label">Order status</span><div className="wallet-report-statuses" role="group" aria-label="Filter report by order status">{statuses.map((item) => <button type="button" key={item} className={status === item ? 'selected' : ''} aria-pressed={status === item} onClick={() => setStatus(item)}>{item}</button>)}</div></div>
      </div>
      <div className="wallet-report-summary"><span><b>{rows.length}</b> orders</span><span>Order total <b>{money(totals.total)}</b></span><span>Additional charges <b>{money(totals.additional)}</b></span><span>Net total <b>{money(totals.net)}</b></span><span>Recorded service charges <b>{money(totals.fee)}</b></span></div>
      <div className="wallet-report-table-wrap"><table className="wallet-report-table"><thead><tr><th>Order ID</th><th>Order items</th><th>Date &amp; time</th><th>Total</th><th>Additional charges</th><th>Net total</th><th>Service charges</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>#{row.id}</td><td>{row.items}</td><td>{row.date}<small>{row.time}</small></td><td>{money(row.total, row.currency)}</td><td>{money(row.additional, row.currency)}</td><td>{money(row.net, row.currency)}</td><td>{money(row.fee, row.currency)}</td><td>{row.status}</td></tr>)}{!rows.length && <tr><td colSpan="8" className="wallet-report-empty">No orders match this period and status.</td></tr>}</tbody><tfoot><tr><th colSpan="3">Totals</th><th>{money(totals.total)}</th><th>{money(totals.additional)}</th><th>{money(totals.net)}</th><th>{money(totals.fee)}</th><th>{rows.length} orders</th></tr></tfoot></table></div>
      <div className="wallet-report-footer"><span>Service charges come from persisted payment records.</span><div>{error && <small className="wallet-report-error" role="alert">{error}</small>}{['PDF', 'Word', 'Excel'].map((format) => <button type="button" key={format} disabled={Boolean(exporting)} onClick={() => exportAs(format)}>{exporting === format ? 'Preparing…' : `Export ${format}`}</button>)}</div></div>
    </section>
  </div>
}
