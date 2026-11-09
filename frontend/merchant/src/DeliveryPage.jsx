import { useEffect, useMemo, useRef, useState } from 'react'

const icons = {
  orders: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  previous: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
}

function Icon({ name, size = 18 }) {
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function statusOf(order) {
  return String(order.deliveryStatus ?? order.status ?? '').toLowerCase()
}

function readAmount(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function formatAmount(value, currency = 'LKR') {
  const amount = readAmount(value)
  if (amount === null) return '—'
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function displayDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''))
  return match ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : value || '—'
}
function orderItems(order) {
  if (!Array.isArray(order.items) || !order.items.length) return '—'
  return order.items.map((item) => {
    if (typeof item === 'string') return item
    const name = item.name || item.itemName || 'Item'
    return item.quantity ? `${name} × ${item.quantity}` : name
  }).join(', ')
}

export default function DeliveryPage({ orders = [] }) {
  const [filter, setFilter] = useState('All deliveries')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const calendarRef = useRef(null)

  useEffect(() => {
    if (!calendarOpen) return
    function closeOutside(event) {
      if (!calendarRef.current?.contains(event.target)) setCalendarOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setCalendarOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [calendarOpen])

  const calendarDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    return Array.from({ length: 42 }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - first.getDay() + 1))
  }, [visibleMonth])

  const filteredOrders = orders.filter((order) => {
    const status = statusOf(order)
    const matchesFilter = filter === 'All deliveries' || (filter === 'Processing' ? ['new', 'pending', 'processing', 'preparing', 'ready', 'out for delivery'].includes(status) : filter === 'Completed' ? ['completed', 'complete'].includes(status) : ['rejected', 'cancelled', 'canceled'].includes(status))
    const matchesQuery = !query || String(order.id ?? '').toLowerCase().includes(query.toLowerCase())
    const matchesDate = !date || String(order.date || '').slice(0, 10) === date
    return matchesFilter && matchesQuery && matchesDate
  })

  const formattedDate = date ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`)) : 'Select date'

  return <div className="dashboard-content section-content orders-content">
    <div className="dashboard-heading-row"><div><span className="dashboard-kicker">DELIVERY MANAGEMENT</span><h1>Delivery<span>.</span></h1><p>Track delivery progress for your orders.</p></div></div>
    <div className="order-toolbar"><div className="order-filters" role="group" aria-label="Filter deliveries">{['All deliveries', 'Processing', 'Completed', 'Rejected'].map((item) => <button type="button" key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="order-search"><label className="order-id-search"><span className="sr-only">Search by order ID</span><Icon name="orders" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order ID" /></label><div className="order-date-picker" ref={calendarRef}><button className={`order-date-trigger ${date ? 'has-date' : ''}`} type="button" aria-haspopup="dialog" aria-expanded={calendarOpen} onClick={() => setCalendarOpen((open) => !open)}><Icon name="calendar" size={17} /><span>{formattedDate}</span><Icon name="chevronDown" size={15} /></button>
      {calendarOpen && <section className="order-calendar" role="dialog" aria-label="Choose delivery date"><div className="calendar-topline"><div><span className="calendar-eyebrow">FILTER DELIVERIES</span><strong>{date ? new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`)) : 'Select a date'}</strong></div></div><div className="calendar-month-row"><strong>{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(visibleMonth)}</strong><div><button type="button" aria-label="Previous month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Icon name="previous" size={17} /></button><button type="button" aria-label="Next month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Icon name="next" size={17} /></button></div></div><div className="calendar-grid" role="grid"><div className="calendar-weekdays" role="row">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span role="columnheader" key={day}>{day}</span>)}</div><div className="calendar-dates" role="row">{calendarDays.map((day) => { const key = dateKey(day); const outsideMonth = day.getMonth() !== visibleMonth.getMonth(); const selected = date === key; const today = dateKey(new Date()) === key; return <button type="button" role="gridcell" key={key} className={`${outsideMonth ? 'outside-month' : ''} ${selected ? 'selected-day' : ''} ${today ? 'today' : ''}`} aria-label={new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(day)} aria-pressed={selected} onClick={() => { setDate(key); setCalendarOpen(false) }}>{day.getDate()}</button> })}</div></div><div className="calendar-footer"><button type="button" onClick={() => { setDate(''); setCalendarOpen(false) }}>Clear date</button><button type="button" onClick={() => { setDate(dateKey(new Date())); setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setCalendarOpen(false) }}>Today</button></div></section>}
    </div></div></div>
    <section className="dashboard-card orders-table-card" aria-label="Deliveries"><div className="orders-table-scroll"><table className="orders-table delivery-table"><thead><tr><th>Order ID</th><th>Order Items</th><th>Date &amp; time</th><th>Net Total</th><th>Delivery Status</th></tr></thead><tbody>
      {filteredOrders.map((order) => {
        const status = order.deliveryStatus ?? order.status
        const customerAgreed = order.customerAgreedToAdditionalCharges === true
        const total = readAmount(order.total)
        const additionalCharge = customerAgreed ? (readAmount(order.additionalCharge) ?? 0) : 0
        const netTotal = total === null ? null : total + additionalCharge
        return <tr key={order.id}><td><strong>#{order.id}</strong></td><td className="delivery-items-cell" title={orderItems(order)}>{orderItems(order)}</td><td><span>{displayDate(order.date)}</span><small>{order.time || '—'}</small></td><td className="order-amount">{formatAmount(netTotal, order.currency || 'LKR')}</td><td><span className={`order-status ${order.statusClass || ''}`}>{status || 'Awaiting update'}</span></td></tr>
      })}
      {!filteredOrders.length && <tr><td colSpan="5"><div className="orders-empty"><span className="empty-state-mark"><Icon name="orders" size={20} /></span><strong>{orders.length ? 'No deliveries match these filters' : 'No deliveries yet'}</strong><p>{orders.length ? 'Try another order ID or date.' : 'Delivery updates will appear here when orders are received.'}</p></div></td></tr>}
    </tbody></table></div><div className="orders-footnote">{orders.length ? `${filteredOrders.length} ${filteredOrders.length === 1 ? 'delivery' : 'deliveries'}` : 'Waiting for delivery updates'}</div></section>
    <p className="delivery-integration-note">Delivery status is refreshed from the assigned Driver’s recorded actions.</p>
  </div>
}
