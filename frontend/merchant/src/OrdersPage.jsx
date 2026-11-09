import { api } from './api.js'
import { useEffect, useMemo, useRef, useState } from 'react'

const icons = {
  orders: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  previous: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
}

function Icon({ name, size = 18, className = '' }) {
  return <svg className={`ui-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function OrdersPage({ orders, onAdditionalChargeChange }) {
  const [filter, setFilter] = useState('All orders')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [expanded, setExpanded] = useState('')
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
    const offset = first.getDay()
    return Array.from({ length: 42 }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - offset + 1))
  }, [visibleMonth])

  const filteredOrders = orders.filter((order) => {
    const status = String(order.status || '').toLowerCase()
    const matchesFilter = filter === 'All orders' || (filter === 'New orders' ? ['new', 'pending', 'processing', 'preparing', 'ready', 'out for delivery'].includes(status) : filter === 'Completed' ? ['completed', 'complete'].includes(status) : ['rejected', 'cancelled', 'canceled'].includes(status))
    const matchesQuery = !query || String(order.id).toLowerCase().includes(query.toLowerCase())
    const matchesDate = !date || String(order.date || '').slice(0, 10) === date
    return matchesFilter && matchesQuery && matchesDate
  })

  const formattedDate = date ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`)) : 'Select date'

  return <div className="dashboard-content section-content orders-content">
    <div className="dashboard-heading-row"><div><span className="dashboard-kicker">ORDER MANAGEMENT</span><h1>Orders<span>.</span></h1><p>Follow new orders and keep every order moving.</p></div></div>
    <div className="order-toolbar"><div className="order-filters" role="group" aria-label="Filter orders">{['All orders', 'New orders', 'Completed', 'Rejected'].map((item) => <button type="button" key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="order-search"><label className="order-id-search"><span className="sr-only">Search by order ID</span><Icon name="orders" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order ID" /></label><div className="order-date-picker" ref={calendarRef}><button className={`order-date-trigger ${date ? 'has-date' : ''}`} type="button" aria-haspopup="dialog" aria-expanded={calendarOpen} onClick={() => setCalendarOpen((open) => !open)}><Icon name="calendar" size={17} /><span>{formattedDate}</span><Icon name="chevronDown" size={15} className="date-trigger-chevron" /></button>
      {calendarOpen && <section className="order-calendar" role="dialog" aria-label="Choose order date"><div className="calendar-topline"><div><span className="calendar-eyebrow">FILTER ORDERS</span><strong>{date ? new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`)) : 'Select a date'}</strong></div></div><div className="calendar-month-row"><strong>{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(visibleMonth)}</strong><div><button type="button" aria-label="Previous month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Icon name="previous" size={17} /></button><button type="button" aria-label="Next month" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Icon name="next" size={17} /></button></div></div><div className="calendar-grid" role="grid"><div className="calendar-weekdays" role="row">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span role="columnheader" key={day}>{day}</span>)}</div><div className="calendar-dates" role="row">{calendarDays.map((day) => { const key = dateKey(day); const outsideMonth = day.getMonth() !== visibleMonth.getMonth(); const selected = date === key; const today = dateKey(new Date()) === key; return <button type="button" role="gridcell" key={key} className={`${outsideMonth ? 'outside-month' : ''} ${selected ? 'selected-day' : ''} ${today ? 'today' : ''}`} aria-label={new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(day)} aria-pressed={selected} onClick={() => { setDate(key); setCalendarOpen(false) }}>{day.getDate()}</button> })}</div></div><div className="calendar-footer"><button type="button" onClick={() => { setDate(''); setCalendarOpen(false) }}>Clear date</button><button type="button" onClick={() => { setDate(dateKey(new Date())); setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setCalendarOpen(false) }}>Today</button></div></section>}
    </div></div></div>
    <section className="dashboard-card orders-table-card" aria-label="Orders"><div className="orders-table-scroll"><table className="orders-table"><thead><tr><th>Order</th><th>Date &amp; time</th><th>Payment type</th><th>Total</th><th>Additional charges</th><th>Net total</th><th>Status</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>
      {filteredOrders.map((order) => <OrderRows key={order.id} order={order} expanded={expanded} setExpanded={setExpanded} onAdditionalChargeChange={onAdditionalChargeChange} />)}
      {!filteredOrders.length && <tr><td colSpan="8"><div className="orders-empty"><span className="empty-state-mark"><Icon name="orders" size={20} /></span><strong>{orders.length ? 'No orders match these filters' : 'No orders yet'}</strong><p>{orders.length ? 'Try another order ID or date.' : 'New orders for your restaurant will appear here.'}</p></div></td></tr>}
    </tbody></table></div><div className="orders-footnote">{orders.length ? `${filteredOrders.length} order${filteredOrders.length === 1 ? '' : 's'}` : 'Waiting for order updates'}</div></section>
  </div>
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

function OrderRows({ order, expanded, setExpanded, onAdditionalChargeChange }) {
  const id = String(order.id)
  const customerAgreed = order.customerAgreedToAdditionalCharges === true
  const total = readAmount(order.total)
  const additionalCharge = customerAgreed ? (readAmount(order.additionalCharge) ?? 0) : 0
  const netTotal = total === null ? null : total + additionalCharge
  const currency = order.currency || 'LKR'

  return <>
    <tr onClick={() => setExpanded((value) => value === id ? '' : id)} className="order-row"><td><strong>#{order.id}</strong></td><td><span>{order.date || '—'}</span><small>{order.time || '—'}</small></td><td>{order.paymentType || '—'}</td><td className="order-amount">{formatAmount(order.total, currency)}</td><td className="additional-charge-cell"><input type="number" min="0" step="0.01" value={order.additionalCharge ?? ''} disabled={customerAgreed} aria-label={`Additional charge for order ${order.id}`} placeholder={customerAgreed ? 'Accepted charge' : 'Propose charge'} onClick={(event) => event.stopPropagation()} onChange={(event) => onAdditionalChargeChange(order.id, event.target.value === '' ? 0 : Number(event.target.value))} /><small>{customerAgreed ? 'Customer agreed' : 'Waiting for customer approval'}</small></td><td className="order-amount">{formatAmount(netTotal, currency)}</td><td><span role="button" tabIndex={0} title="Select to accept, prepare or mark ready" onClick={async(event)=>{event.stopPropagation();const next={NEW:'PREPARING',PREPARING:'READY',READY:order.type==='PICKUP'?'PICKED_UP':null}[order.backendStatus];if(!next)return;try{await api('/api/orders/'+order.id+'/status',{method:'PATCH',body:{status:next}});window.dispatchEvent(new Event('foodie:refresh-orders'))}catch(error){window.alert(error.message)}}} className={`order-status ${order.statusClass || ''}`} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.currentTarget.click()}}}>{order.status || 'Pending'}</span></td><td><Icon name="chevronDown" size={15} className={expanded === id ? 'expanded' : ''} /></td></tr>
    {expanded === id && <tr className="order-detail-row"><td colSpan="8">Order #{order.id} · {order.status || 'Pending'}{order.items?.length ? ` · ${order.items.map((item) => item.name || item).join(', ')}` : ''}</td></tr>}
  </>
}