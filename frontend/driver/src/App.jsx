import { api, apiFetch, signIn } from './api.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import './App.css'

const driverIcon = L.divIcon({
  className: 'driver-map-marker',
  html: '<span aria-hidden="true"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function DriverMap({ position, online, networkOnline, locationStatus }) {
  const mapRef = useRef(null)
  const center = position || [20, 0]
  return <div className="map-frame" aria-label="OpenStreetMap showing your device location when available">
    <MapContainer ref={mapRef} center={center} zoom={position ? 14 : 2} scrollWheelZoom zoomControl={false} className="leaflet-map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomControl position="bottomright" />
      <MapFollow position={position} />
      {position && <><CircleMarker center={position} radius={17} pathOptions={{ color: '#1478e8', weight: 2, fillColor: '#1478e8', fillOpacity: 0.16 }} /><Marker position={position} icon={driverIcon} title="Your live device location" alt="Your live device location" /> </>}
    </MapContainer>
    <div className="map-head-panel">
      <span className={`map-live-badge ${online ? 'is-live' : ''}`}><i />{online ? 'LIVE TRACKING' : 'DRIVER MAP'}</span>
      <strong>{position ? 'Your location' : 'Map overview'}</strong>
      <small>{position ? 'Device location' : locationStatus}</small>
    </div>
    <div className="map-driver-card">
      <div className="map-driver-avatar">GE</div>
      <div className="map-driver-details"><small>DRIVER LOCATION</small><strong>{position ? 'Current location' : 'Location unavailable'}</strong><span><i className={online ? 'is-online' : ''}/>{online ? 'Location sharing is on' : 'Currently offline'}</span></div>
    </div>
    <div className="map-key"><span className="map-key-dot"/>{position ? 'Current device location' : 'Location unavailable'}</div>
    <button className="map-recenter" type="button" aria-label="Center map on my location" disabled={!position} onClick={() => position && mapRef.current?.flyTo(position, Math.max(mapRef.current.getZoom(), 15), { duration: 0.7 })}><span><Icon name="location" size={16}/></span><small>My location</small></button>
    <div className={`map-network-note ${networkOnline ? '' : 'is-offline'}`}><i />{networkOnline ? 'Map by OpenStreetMap' : 'Offline · map tiles may not load'}</div>
  </div>
}

function MapFollow({ position }) {
  const map = useMap()
  useEffect(() => { if (position) map.setView(position, Math.max(map.getZoom(), 14), { animate: true }) }, [map, position])
  return null
}

const steps = ['Personal Information', 'Contact Details', 'Identity Documents', 'Vehicle Documents', 'Vehicle Photos']

function Icon({ name, size = 18 }) {
  const shapes = {
    user: <><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.3 3.1-5.2 7-5.2s6.4 1.9 7 5.2"/></>,
    eye: <><path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6.3 0 9.5 6 9.5 6a15 15 0 0 1-3 3.7M6.2 6.8C3.7 8.4 2.5 12 2.5 12s3.2 6 9.5 6c.8 0 1.5-.1 2.2-.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h2m4 0h2M8 17h2m4 0h2"/></>,
    chevronDown: <path d="m7 10 5 5 5-5"/>,
    chevronLeft: <path d="m14.5 5-7 7 7 7"/>,
    chevronRight: <path d="m9.5 5 7 7-7 7"/>,
    arrowLeft: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    phone: <path d="M7 3H4.8A1.8 1.8 0 0 0 3 4.9C3.8 13.5 10.5 20.2 19.1 21a1.8 1.8 0 0 0 1.9-1.8V17l-4.6-2-2.1 2.1a15 15 0 0 1-6.5-6.5L9.9 8.5 7 3Z"/>,
    upload: <><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></>,
    check: <path d="m5 12.5 4.2 4.2L19.5 6.8"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/></>,
    earnings: <><path d="M4 19V5m0 14h17"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" transform="translate(-1 -1) scale(1.08)"/></>,
    power: <><path d="M12 2v10"/><path d="M6.2 5.8a8 8 0 1 0 11.6 0"/></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    route: <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h2a4 4 0 0 0 4-4v-6a4 4 0 0 1 4-4"/></>,
    scooter: <><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h5l-2-7h4l2 4M4 10h4l2 3h5M13 7h3"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h18M16 14h2"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    translate: <><path d="M4 5h10M9 3v2c0 5-2 8-5 10M6 8c1 3 4 5 7 6M12 20l4-9 4 9M13.5 17h5"/></>,
    routePin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  }
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || <circle cx="12" cy="12" r="8"/>}</svg>
}

function Scooter({ small = false }) {
  return <div className={small ? 'scooter-art mini-scooter' : 'scooter-art'} role="img" aria-label="Food delivery rider riding an orange scooter"><img src={`${import.meta.env.BASE_URL}rider-scooter-v2.png`} alt=""/><span className="spin-wheel rear"><i/></span><span className="spin-wheel front"><i/></span></div>
}

function Brand({ compact = false, splash = false }) { return <div className={compact ? 'brand-lockup compact' : `brand-lockup${splash ? ' splash-brand' : ''}`}><div className="brand-mark"><span className="brand-speed">〰</span><span className="brand-cloche">⌒</span>foodie<span className="brand-period">.</span></div>{compact ? <small>DRIVER</small> : splash ? <div className="portal-label">DRIVER</div> : <><div className="portal-label">DRIVER PORTAL</div><p>Good food. Brighter journeys.</p></>}</div> }

function UploadBox({ label, accept = 'image/*,.pdf', hint = 'JPG, PNG or PDF (Max 5MB)', required = true, savedFile = null }) {
  const [file, setFile] = useState(savedFile)
  return <label className="upload-field"><span className="upload-title">{label}{required && <b> *</b>}</span><span className={`upload-box ${file ? 'has-file' : ''}`}><span className="upload-icon"><Icon name={file ? 'check' : 'upload'} size={22}/></span><span>{file ? file.name : 'Upload file'}</span><input type="file" name={label} accept={accept} required={required && !file} onChange={e => setFile(e.target.files?.[0] || null)} /></span><small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready` : hint}</small></label>
}

function Field({ label, placeholder, type = 'text', required = true, ...props }) {
  const nameField = label === 'First Name' || label === 'Last Name'
  const onChange = nameField ? event => {
    const cleaned = event.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'’ -]/g, '')
    if (cleaned !== event.target.value) event.target.value = cleaned
    props.onChange?.(event)
  } : props.onChange
  return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} placeholder={placeholder} required={required} {...props} onChange={onChange} pattern={nameField ? "[A-Za-zÀ-ÖØ-öø-ÿ'’ -]+" : props.pattern} /></label>
}

function DatePicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(null)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [yearPicker, setYearPicker] = useState(false)
  const today = new Date()
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
  const calendarDays = Array.from({ length: 42 }, (_, index) => new Date(viewDate.getFullYear(), viewDate.getMonth(), index - firstDay + 1))
  const formatValue = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const sameDate = (a, b) => a && b && formatValue(a) === formatValue(b)
  const openPicker = () => {
    setDraft(value ? new Date(`${value}T00:00:00`) : null)
    if (value) setViewDate(new Date(`${value}T00:00:00`))
    setYearPicker(false)
    setOpen(true)
  }
  const chooseDate = date => { setDraft(date); setViewDate(new Date(date.getFullYear(), date.getMonth(), 1)) }
  const confirmDate = () => { if (draft) onChange(formatValue(draft)); setOpen(false) }
  const selectedText = date => date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Choose your birthday'

  return <div className="date-field field"><span>Date of Birth <b>*</b></span><input type="hidden" name="birthDate" value={value}/><div className="date-input-wrap"><input type="text" value={value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : ''} placeholder="dd / mm / yyyy" readOnly onClick={openPicker} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker() } }} aria-haspopup="dialog" aria-required="true"/><button type="button" aria-label="Choose date of birth" onClick={openPicker}><Icon name="calendar"/></button></div>{error && <em className="date-error">{error}</em>}
    {open && <div className="date-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false) }}><section className="date-dialog" role="dialog" aria-modal="true" aria-label="Choose date of birth"><div className="date-dialog-top"><span>Select date</span><strong>{selectedText(draft)}</strong></div><div className="calendar-toolbar">{yearPicker ? <span className="calendar-caption">Choose year</span> : <button type="button" className="calendar-caption" onClick={() => setYearPicker(true)}>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} <Icon name="chevronDown" size={16}/></button>}<div className="calendar-arrows"><button type="button" aria-label="Previous month" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><Icon name="chevronLeft"/></button><button type="button" aria-label="Next month" disabled={viewDate.getFullYear() >= today.getFullYear() && viewDate.getMonth() >= today.getMonth()} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><Icon name="chevronRight"/></button></div></div>
      {yearPicker ? <div className="year-grid">{Array.from({ length: today.getFullYear() - 1939 }, (_, i) => today.getFullYear() - i).map(year => <button type="button" key={year} className={year === viewDate.getFullYear() ? 'chosen' : ''} onClick={() => { setViewDate(new Date(year, viewDate.getMonth(), 1)); setYearPicker(false) }}>{year}</button>)}</div> : <><div className="weekday-row">{['S','M','T','W','T','F','S'].map((day, i) => <span key={`${day}${i}`}>{day}</span>)}</div><div className="calendar-days">{calendarDays.map((date, i) => { const currentMonth = date.getMonth() === viewDate.getMonth(); const future = date > new Date(today.getFullYear(), today.getMonth(), today.getDate()); return <button type="button" key={`${formatValue(date)}-${i}`} disabled={future} className={`${currentMonth ? '' : 'outside-month'} ${sameDate(date, draft) ? 'chosen' : ''}`} onClick={() => chooseDate(date)}>{date.getDate()}</button> })}</div></>}
      <div className="date-dialog-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="date-confirm" disabled={!draft} onClick={confirmDate}>OK</button></div>
    </section></div>}
  </div>
}

const DRIVER_BANKS = ['Bank of Ceylon', 'Commercial Bank', 'Hatton National Bank', "People's Bank", 'Nations Trust Bank', 'Sampath Bank', 'Seylan Bank', 'Amana Bank']
const DRIVER_BANK_CROPS = {
  'bank of ceylon': { x: 168, y: 140, width: 210, height: 210 }, 'commercial bank': { x: 742, y: 153, width: 154, height: 118 },
  'hatton national bank': { x: 26, y: 515, width: 133, height: 137 }, "people's bank": { x: 607, y: 488, width: 139, height: 135 },
  'nations trust bank': { x: 7, y: 784, width: 141, height: 137 }, 'sampath bank': { x: 590, y: 805, width: 158, height: 155 },
  'seylan bank': { x: 39, y: 1038, width: 136, height: 214 }, 'amana bank': { x: 980, y: 1047, width: 97, height: 104 },
}
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const localDate = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month-1, day) }
const dateLabel = (value, options = { month:'short', day:'numeric' }) => localDate(value).toLocaleDateString('en-LK', options)
const shiftDate = (date, days) => { const next = new Date(date); next.setDate(next.getDate()+days); return next }

function DriverBankLogo({ bank }) {
  const crop = DRIVER_BANK_CROPS[bank.toLowerCase()]
  const scale = crop ? 27 / Math.max(crop.width, crop.height) : 0
  const style = crop ? { '--driver-bank-sheet-size': `${1080*scale}px ${1349*scale}px`, '--driver-bank-logo-position': `-${crop.x*scale}px -${crop.y*scale}px` } : undefined
  return <span className={`driver-bank-logo ${crop?'has-logo':''}`} style={style} role="img" aria-label={`${bank} logo`}>{!crop&&bank.slice(0,1)}</span>
}

function DriverBankPicker({ value, onSelect }) {
  const [open, setOpen] = useState(false)
  return <div className="driver-bank-picker"><button type="button" className="driver-bank-trigger" aria-expanded={open} aria-haspopup="listbox" onClick={()=>setOpen(v=>!v)}>{value?<DriverBankLogo bank={value}/>:<span className="driver-bank-placeholder">⌕</span>}<span><b>{value||'Choose a bank'}</b><small>{value?'Sri Lankan bank':'Select from available banks'}</small></span><i>⌄</i></button>{open&&<div className="driver-bank-menu" role="listbox" aria-label="Select a Sri Lankan bank">{DRIVER_BANKS.map(bank=><button type="button" role="option" aria-selected={bank===value} className={bank===value?'selected':''} key={bank} onClick={()=>{onSelect(bank);setOpen(false)}}><DriverBankLogo bank={bank}/><span><b>{bank}</b><small>Bank account in Sri Lanka</small></span><i>{bank===value?'✓':''}</i></button>)}</div>}</div>
}

function DriverNotificationIcon({ type }) {
  const icon=type==='complete'?'checkCircle':type==='payment'?'wallet':type==='admin'?'info':'scooter'
  const tone=type==='complete'?'n1':type==='payment'?'n2':type==='admin'?'n3':''
  return <span className={`notice-icon ${tone}`}><Icon name={icon} size={17}/></span>
}

function DriverHelpSupport({onBack}) {
  const [complaintType,setComplaintType]=useState('Merchant')
  const [subject,setSubject]=useState('')
  const [description,setDescription]=useState('')
  const [feedback,setFeedback]=useState('')
  const submitComplaint=async event=>{
    event.preventDefault()
    setFeedback('')
    try {
      const response=await apiFetch('/api/driver/complaints',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({type:complaintType,subject:subject.trim(),description:description.trim()})})
      if(!response.ok)throw new Error()
      const result=await response.json().catch(()=>({}))
      setFeedback(`Complaint submitted${result.reference?` · ${result.reference}`:''}.`)
      setSubject('');setDescription('')
    } catch { setFeedback('The complaint service is currently unavailable. Your complaint was not submitted.') }
  }
  return <div className="section-page driver-help-page"><div className="page-heading"><div><h1>Help &amp; Support</h1><p>Contact the Foodie support team or report an issue.</p></div><button type="button" className="light-button" onClick={onBack}><Icon name="arrowLeft" size={15}/>Back to settings</button></div>
    <div className="driver-help-grid"><section className="driver-contact-card"><div className="driver-help-card-icon"><Icon name="info" size={20}/></div><h2>Contact us</h2><p>Need help with your driver account or a delivery? Reach our support team.</p><div className="driver-contact-unavailable">Support contact details are not configured.</div></section>
      <form className="driver-complaint-card" onSubmit={submitComplaint}><div className="driver-complaint-heading"><div><span className="driver-help-card-icon"><Icon name="edit" size={19}/></span></div><div><h2>Submit a complaint</h2><p>Tell us whether your concern is about a merchant or a customer.</p></div></div><fieldset><legend>Who is your complaint about?</legend><div className="driver-complaint-types">{['Merchant','Customer'].map(type=><label key={type} className={complaintType===type?'selected':''}><input type="radio" name="complaintType" value={type} checked={complaintType===type} onChange={()=>setComplaintType(type)}/><span>{type==='Merchant'?<Icon name="home" size={17}/>:<Icon name="user" size={17}/>}</span><b>{type}</b></label>)}</div></fieldset><label className="driver-complaint-field">Subject<input value={subject} onChange={event=>setSubject(event.target.value)} required maxLength={120} placeholder={`Briefly describe the ${complaintType.toLowerCase()} issue`}/></label><label className="driver-complaint-field">Describe your problem<textarea value={description} onChange={event=>setDescription(event.target.value)} required minLength={10} maxLength={2000} rows={5} placeholder="Include the order number and details that will help us understand what happened."/><small>{description.length}/2000 characters</small></label><button className="driver-complaint-submit" type="submit">Submit complaint</button>{feedback&&<p className="driver-complaint-feedback" role="status">{feedback}</p>}</form></div>
  </div>
}

function DriverEarnings() {
  const [period,setPeriod]=useState('This week')
  const [startDate,setStartDate]=useState('')
  const [endDate,setEndDate]=useState('')
  const [earnings,setEarnings]=useState(null)
  const [earningsStatus,setEarningsStatus]=useState('Loading earnings…')
  const [accounts,setAccounts]=useState([])
  const [accountError,setAccountError]=useState('')
  const [bank,setBank]=useState('')
  const [holder,setHolder]=useState('')
  const [accountNumber,setAccountNumber]=useState('')
  const [bankStatus,setBankStatus]=useState('')
  const [selectedAccount,setSelectedAccount]=useState('')
  const [transferAmount,setTransferAmount]=useState('')
  const [transferStatus,setTransferStatus]=useState('')
  const today=new Date();today.setHours(0,0,0,0)
  const todayKey=dateKey(today)
  const weekStart=shiftDate(today,-((today.getDay()+6)%7))
  const range=period==='This week'?[dateKey(weekStart),todayKey]:period==='This month'?[dateKey(new Date(today.getFullYear(),today.getMonth(),1)),todayKey]:period==='Last 30 days'?[dateKey(shiftDate(today,-29)),todayKey]:[startDate,endDate]
  const rangeStart=range[0]
  const rangeEnd=range[1]
  useEffect(()=>{
    if(!rangeStart||!rangeEnd)return
    let active=true
    apiFetch(`/api/driver/earnings?from=${encodeURIComponent(rangeStart)}&to=${encodeURIComponent(rangeEnd)}`,{credentials:'include'})
      .then(async response=>{if(!response.ok)throw new Error();return response.json()})
      .then(data=>{if(active){setEarnings(data);setEarningsStatus('')}})
      .catch(()=>{if(active){setEarnings(null);setEarningsStatus('Earnings are currently unavailable.') }})
    return()=>{active=false}
  },[rangeStart,rangeEnd])
  const loadAccounts=()=>apiFetch('/api/driver/bank-accounts',{credentials:'include'}).then(async response=>{if(!response.ok)throw new Error();const rows=await response.json();setAccounts(Array.isArray(rows)?rows:[]);setAccountError('')}).catch(()=>{setAccounts([]);setAccountError('Bank account service is currently unavailable.')})
  useEffect(()=>{loadAccounts()},[])
  const money=value=>value==null?'—':`Rs. ${Number(value).toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2})}`
  const saveBank=async event=>{event.preventDefault();setBankStatus('');try{const response=await apiFetch('/api/driver/bank-accounts',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({bank,accountHolder:holder.trim(),accountNumber})});if(!response.ok)throw new Error();setBank('');setHolder('');setAccountNumber('');setBankStatus('Bank account saved.');await loadAccounts()}catch{setBankStatus('Bank account service is currently unavailable. No account details were saved.')}}
  const requestTransfer=async event=>{event.preventDefault();setTransferStatus('');try{const response=await apiFetch('/api/driver/payouts',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({bankAccountId:selectedAccount,amount:Number(transferAmount)})});if(!response.ok)throw new Error();setTransferAmount('');setTransferStatus('Payout request saved for review. No bank transfer has been executed.')}catch{setTransferStatus('Payout service is currently unavailable. No transfer was made.')}}
  const chart=Array.isArray(earnings?.dailyBreakdown)?earnings.dailyBreakdown:[]
  const chartMax=Math.max(1,...chart.map(item=>Number(item.netEarnings)||0))
  const choosePeriod=value=>{setPeriod(value);if(value==='Custom range'){setStartDate(dateKey(weekStart));setEndDate(todayKey)}}
  return <div className="section-page driver-earnings">
    <div className="page-heading"><div><h1>Earnings</h1><p>Track your delivery income, trips, and service charge</p></div><div className="earnings-period"><select className="light-button" aria-label="Earnings date range" value={period} onChange={event=>choosePeriod(event.target.value)}><option>This week</option><option>This month</option><option>Last 30 days</option><option>Custom range</option></select></div></div>
    {period==='Custom range'&&<div className="driver-date-range"><label>From<input type="date" max={todayKey} value={startDate} onChange={event=>setStartDate(event.target.value)}/></label><label>To<input type="date" min={startDate||undefined} max={todayKey} value={endDate} onChange={event=>setEndDate(event.target.value)}/></label></div>}
    <div className="earning-stats driver-earning-stats"><article><small>Total Earnings</small><b>{money(earnings?.totalEarnings)}</b><span>After service charge</span></article><article><small>Total Trips</small><b>{earnings?.totalTrips??'—'}</b><span>Completed deliveries</span></article><article><small>Service Charge</small><b>{money(earnings?.serviceCharge)}</b><span>{earnings?.serviceChargeRate!=null?`${earnings.serviceChargeRate}% of gross earnings`:'Charge details unavailable'}</span></article><article><small>Average per Order</small><b>{money(earnings?.averagePerTrip)}</b><span>Net earnings per trip</span></article></div>
    <div className="chart-card driver-earnings-chart"><div className="chart-title"><div><b>Net earnings</b><small>After service charge</small></div><small>{range[0]&&range[1]?`${dateLabel(range[0])} – ${dateLabel(range[1])}`:''}</small></div>{chart.length?<div className="bar-chart driver-bar-chart">{chart.map(item=><div key={item.date} title={`${item.date}: ${money(item.netEarnings)}`}><span style={{height:`${Math.max(Number(item.netEarnings)?4:0,(Number(item.netEarnings)||0)/chartMax*100)}%`}}/><small>{localDate(item.date).toLocaleDateString('en-LK',{weekday:'short'})}</small></div>)}</div>:<div className="driver-chart-empty">{earningsStatus||'No earnings records for this period.'}</div>}</div>
    <section className="driver-bank-card"><div className="driver-bank-heading"><span className="driver-bank-heading-icon">↗</span><div><h2>Bank account & payouts</h2><p>Manage the destination for your earnings transfers.</p></div></div>{accountError&&<p className="driver-transfer-notice" role="status">{accountError}</p>}{accounts.length>0&&<div className="driver-saved-accounts">{accounts.map(account=><article key={account.id}><DriverBankLogo bank={account.bank}/><span><b>{account.bank}</b><small>{account.accountHolder} · •••• {account.accountLastFour}</small></span><button type="button" onClick={()=>setSelectedAccount(String(account.id))}>{selectedAccount===String(account.id)?'Selected':'Select'}</button></article>)}</div>}<div className="driver-payout-grid"><form className="driver-bank-form" onSubmit={saveBank}><h3>Add a bank account</h3><label>Bank<DriverBankPicker value={bank} onSelect={setBank}/></label><label>Account holder name<input value={holder} onChange={event=>setHolder(event.target.value)} autoComplete="name" required/></label><label>Account number<input value={accountNumber} onChange={event=>setAccountNumber(event.target.value.replace(/\D/g,'').slice(0,20))} inputMode="numeric" pattern="[0-9]{4,20}" minLength="4" required/></label><button type="submit" className="driver-bank-save">Save bank account</button>{bankStatus&&<small role="status">{bankStatus}</small>}</form></div>{accounts.length>0&&<form className="driver-transfer-form" onSubmit={requestTransfer}><label>Transfer to<select value={selectedAccount} onChange={event=>setSelectedAccount(event.target.value)} required><option value="">Choose a linked account</option>{accounts.map(account=><option key={account.id} value={account.id}>{account.bank} ···· {account.accountLastFour}</option>)}</select></label><label>Amount (Rs.)<input type="number" min="1" step="0.01" value={transferAmount} onChange={event=>setTransferAmount(event.target.value)} required/></label><button type="submit">Request bank transfer</button>{transferStatus&&<small role="status">{transferStatus}</small>}</form>}</section>
  </div>
}
function ProfileSettings({ driver, vehiclePending, onProfileChange, onVehicleSubmit }) {
  const [message,setMessage]=useState('')
  const fullName=driver?.fullName||`${driver?.firstName||''} ${driver?.lastName||''}`.trim()||'Driver account'
  const initials=fullName==='Driver account'?'DR':fullName.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()
  const saveProfile=async(event,field,label)=>{
    event.preventDefault();setMessage('')
    const form=event.currentTarget;const data=new FormData(form)
    if(field==='password'&&data.get('password')!==data.get('confirmPassword')){form.elements.confirmPassword.setCustomValidity('Passwords do not match');form.reportValidity();return}
    if(field==='password')form.elements.confirmPassword.setCustomValidity('')
    const value=field==='password'?undefined:data.get(field)?.toString().trim()
    try {
      const response=await apiFetch(field==='password'?'/api/driver/profile/password':'/api/driver/profile',{method:field==='password'?'POST':'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(field==='password'?{currentPassword:data.get('currentPassword'),newPassword:data.get('password')}:{[field]:value})})
      if(!response.ok)throw new Error()
      const updated=await response.json().catch(()=>({}))
      if(field!=='password')onProfileChange(await api('/api/driver/profile'))
      setMessage(field==='email'?'Verification requested. Your current email remains active until verified.':`${label} updated.`);form.reset()
    } catch {setMessage('Profile service is currently unavailable. No changes were saved.')}
  }
  const submitVehicle=async event=>{
    event.preventDefault();setMessage('')
    const form=event.currentTarget;const data=new FormData(form)
    try {
      const response=await apiFetch('/api/driver/profile/vehicle-change-requests',{method:'POST',credentials:'include',body:data})
      if(!response.ok)throw new Error()
      const result=await response.json().catch(()=>({}))
      onVehicleSubmit(result);setMessage('Vehicle change request submitted.')
    } catch {setMessage('Vehicle review service is currently unavailable. No request was submitted.')}
  }
  const upload=(label,name,accept='image/*,.pdf')=><label className="profile-upload"><span>{label} <b>*</b></span><input type="file" name={name} accept={accept} required onChange={event=>{const file=event.target.files?.[0];event.target.setCustomValidity(file&&file.size>5*1024*1024?'File must be 5 MB or smaller.':'')}}/><small>Choose a clear image or PDF (max 5 MB)</small></label>
  return <div className="section-page profile-settings">
    <div className="page-heading"><div><h1>Profile</h1><p>Manage your account details and vehicle</p></div><span className={`review-badge ${vehiclePending?'pending':''}`}>{vehiclePending?'Review pending':driver?.status||'Status unavailable'}</span></div>
    {message&&<div className="profile-feedback" role="status">{message}<button type="button" aria-label="Dismiss message" onClick={()=>setMessage('')}><Icon name="close" size={15}/></button></div>}
    {vehiclePending&&<div className="review-notice"><b>Vehicle change under review</b><span>Your account is temporarily suspended while an administrator reviews the documents.</span></div>}
    <div className="profile-card"><div className="profile-identity"><div className="avatar large">{initials}</div><h2>{fullName}</h2>{driver?.driverId&&<span>ID: {driver.driverId}</span>}<i className={vehiclePending?'pending':''}><span className={!vehiclePending?'is-online':''}/>{vehiclePending?'Review pending':driver?.status||'Status unavailable'}</i></div><div className="profile-fields">{[['Email',driver?.email],['Contact Number',driver?.phone],['Address',driver?.address],['Vehicle Number',driver?.vehicleRegistrationNumber]].map(([label,value])=><div key={label}><small>{label}</small><b>{value||'—'}</b></div>)}</div></div>
    <div className="profile-form-grid">
      <form className="profile-form-card" onSubmit={event=>saveProfile(event,'password','Password')}><div><h2>Change password</h2><p>Choose a new password for your account.</p></div><label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required minLength="8"/></label><label>New password<input type="password" name="password" autoComplete="new-password" required minLength="8"/></label><label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" required minLength="8"/></label><button type="submit">Update password</button></form>
      <form className="profile-form-card" onSubmit={event=>saveProfile(event,'email','Email address')}><div><h2>Email address</h2><p>Update the email linked to your driver account.</p></div><label>New email address<input type="email" name="email" defaultValue={driver?.email||''} autoComplete="email" required/></label><button type="submit">Save email</button></form>
      <form className="profile-form-card" onSubmit={event=>saveProfile(event,'phone','Contact number')}><div><h2>Contact number</h2><p>Keep your reachable number up to date.</p></div><label>New contact number<input type="tel" name="phone" defaultValue={driver?.phone||''} autoComplete="tel" required/></label><button type="submit">Save contact number</button></form>
      <form className="profile-form-card" onSubmit={event=>saveProfile(event,'address','Address')}><div><h2>Home address</h2><p>Update the address saved on your profile.</p></div><label>New address<textarea name="address" defaultValue={driver?.address||''} rows="3" required/></label><button type="submit">Save address</button></form>
    </div>
    <form className="vehicle-request-card" onSubmit={submitVehicle}>
      <div className="vehicle-form-heading"><span><Icon name="scooter" size={21}/></span><div><h2>Change your vehicle</h2><p>Submit the new vehicle details and documents for administrator review.</p></div></div>
      <div className="vehicle-form-grid"><div className="vehicle-registration-field"><label>Vehicle registration number <b>*</b><input name="registration" placeholder="Enter registration number" required disabled={vehiclePending}/></label>{upload('Vehicle registration document','registrationDocument')}{upload('Vehicle revenue licence','revenueLicence')}{upload('Vehicle insurance document','insuranceDocument')}{upload('Front photo','frontPhoto','image/*')}{upload('Side photo','sidePhoto','image/*')}{upload('Back photo','backPhoto','image/*')}</div></div>
      <div className="vehicle-submit-row"><span>Account access is restricted while a submitted vehicle change is under review.</span><button type="submit" disabled={vehiclePending}>{vehiclePending?'Request pending':'Submit vehicle change'}</button></div>
    </form>
  </div>
}
function CashCollectionPanel({ activeOrderId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submitting = useRef(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const history = await api('/api/driver/orders/history');

      setOrders(
          history.filter((order) =>
              order.status === 'DELIVERED' &&
              order.paymentMethod === 'CASH' &&
              order.paymentStatus === 'PENDING'
          )
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders, activeOrderId]);

  async function confirmCollection(order) {
    if (submitting.current) return;

    submitting.current = true;
    setBusyId(order.id);
    setError('');
    setMessage('');

    try {
      await api(`/api/payments/collect/${order.id}`, {
        method: 'POST'
      });

      setOrders((current) =>
          current.filter((item) => item.id !== order.id)
      );

      setMessage(`Cash collection recorded for order #${order.id}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      submitting.current = false;
      setBusyId(null);
    }
  }

  const money = (value) =>
      'Rs. ' + Number(value).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

  return (
      <section className="cash-collection-panel">
        <div className="cash-collection-heading">
          <h2>Cash collection</h2>

          <button
              type="button"
              onClick={loadOrders}
              disabled={loading || busyId !== null}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        {!loading && !error && orders.length === 0 && (
            <p>No delivered orders awaiting cash collection.</p>
        )}

        <div className="cash-collection-list">
          {orders.map((order) => (
              <article className="cash-collection-row" key={order.id}>
                <div>
                  <strong>Order #{order.id}</strong>
                  <span>Customer payment · {money(order.total)}</span>
                </div>

                <button
                    type="button"
                    className="cash-collection-confirm"
                    disabled={loading || busyId !== null}
                    onClick={() => confirmCollection(order)}
                >
                  {busyId === order.id
                      ? 'Recording…'
                      : 'Confirm cash collected'}
                </button>
              </article>
          ))}
        </div>

        {orders.length > 0 && (
            <small>Confirm after receiving the full customer payment.</small>
        )}
      </section>
  );
}
function DriverDashboard({driver,onDriverChange}) {
  const [section,setSection]=useState('Home')
  const [online,setOnline]=useState(Boolean(driver?.online))
  const [availabilityError,setAvailabilityError]=useState('')
  const [locating,setLocating]=useState(false)
  const [hasLocation,setHasLocation]=useState(false)
  const [position,setPosition]=useState(driver?.latitude!=null&&driver?.longitude!=null?[driver.latitude,driver.longitude]:null)
  const [mapLocationStatus,setMapLocationStatus]=useState('Finding your location…')
  const [networkOnline,setNetworkOnline]=useState(()=>navigator.onLine)
  const [offer,setOffer]=useState(null)
  const [activeOrder,setActiveOrder]=useState(null)
  useEffect(()=>{let active=true;async function refresh(){try{const order=await api('/api/driver/orders/active');if(active)setActiveOrder(order)}catch(error){if(active)setOrderServiceError(error.message)}}refresh();const timer=setInterval(refresh,4000);return()=>{active=false;clearInterval(timer)}},[])

  const [sound,setSound]=useState(()=>localStorage.getItem('foodie-driver-sound')!=='off')
  const [dark,setDark]=useState(()=>localStorage.getItem('foodie-driver-dark-mode')==='on')
  const [settingsNotice,setSettingsNotice]=useState('')
  const [notifications,setNotifications]=useState([])
  const [notificationError,setNotificationError]=useState('')
  const [clockNow,setClockNow]=useState(()=>Date.now())
  const [orderServiceError,setOrderServiceError]=useState('')
  const vehiclePending=driver?.vehicleChangeStatus==='PENDING_REVIEW'||driver?.status==='SUSPENDED_FOR_VEHICLE_REVIEW'
  const unreadNotifications=notifications.filter(item=>!item.read).length
  const driverName=driver?.fullName||`${driver?.firstName||''} ${driver?.lastName||''}`.trim()||'Driver account'
  const initials=driverName==='Driver account'?'DR':driverName.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()
  const checkLocationAccess=()=>{setSettingsNotice('');if(!navigator.geolocation){setSettingsNotice('Location is unavailable in this browser.');return}navigator.geolocation.getCurrentPosition(({coords})=>{setPosition([coords.latitude,coords.longitude]);setHasLocation(true);setMapLocationStatus('');setSettingsNotice('Location access is enabled.')},error=>setSettingsNotice(error.code===1?'Location permission was denied.':'Could not determine your location.'),{enableHighAccuracy:true,timeout:15000,maximumAge:0})}
  const setAvailability=async enabled=>{
    setAvailabilityError('')
    if(vehiclePending){setAvailabilityError('Your account is suspended while your vehicle request is under review.');return}
    if(!enabled){try{const response=await apiFetch('/api/driver/availability',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({available:false})});if(!response.ok)throw new Error();setOnline(false)}catch{setAvailabilityError('Availability service is currently unavailable. Your status was not changed.')}return}
    if(!navigator.geolocation){setAvailabilityError('Location is required to go online.');return}
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async({coords})=>{
      setPosition([coords.latitude,coords.longitude]);setHasLocation(true);setMapLocationStatus('')
      try{const response=await apiFetch('/api/driver/availability',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({available:true,latitude:coords.latitude,longitude:coords.longitude})});if(!response.ok)throw new Error();setOnline(true)}catch{setAvailabilityError('Availability service is currently unavailable. You were not placed online.')}finally{setLocating(false)}
    },error=>{setLocating(false);setAvailabilityError(error.code===1?'Allow location access to go online.':'Could not determine your location. Check device settings and try again.')},{enableHighAccuracy:true,timeout:20000,maximumAge:0})
  }
  const playAlert=useCallback(()=>{if(!sound)return;try{const context=new(window.AudioContext||window.webkitAudioContext)();const oscillator=context.createOscillator();const gain=context.createGain();oscillator.frequency.value=840;gain.gain.setValueAtTime(.0001,context.currentTime);gain.gain.exponentialRampToValueAtTime(.08,context.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.3);oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.31);oscillator.onended=()=>context.close()}catch{/* Audio playback may require browser permission. */}},[sound])
  const loadNotifications=async()=>{try{const response=await apiFetch('/api/driver/notifications',{credentials:'include'});if(!response.ok)throw new Error();const items=await response.json();setNotifications(Array.isArray(items)?items.map(item=>({...item,message:item.text})):[]);setNotificationError('')}catch{setNotifications([]);setNotificationError('Notifications are currently unavailable.')}}
  const markAllRead=async()=>{try{const response=await apiFetch('/api/driver/notifications/read-all',{method:'POST',credentials:'include'});if(!response.ok)throw new Error();setNotifications(current=>current.map(item=>({...item,read:true})));setNotificationError('')}catch{setNotificationError('Notifications could not be updated.')}}
  const markRead=async id=>{try{const response=await apiFetch(`/api/driver/notifications/${encodeURIComponent(id)}/read`,{method:'POST',credentials:'include'});if(!response.ok)throw new Error();setNotifications(current=>current.map(item=>item.id===id?{...item,read:true}:item))}catch{setNotificationError('Notification could not be updated.')}}
  useEffect(()=>{const firstLoad=window.setTimeout(loadNotifications,0);const notificationsTimer=window.setInterval(loadNotifications,30000);const clockTimer=window.setInterval(()=>setClockNow(Date.now()),30000);return()=>{window.clearTimeout(firstLoad);window.clearInterval(notificationsTimer);window.clearInterval(clockTimer)}},[])
  useEffect(()=>{const updateNetwork=()=>setNetworkOnline(navigator.onLine);window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);return()=>{window.removeEventListener('online',updateNetwork);window.removeEventListener('offline',updateNetwork)}},[])
  useEffect(()=>{
    if(!online || activeOrder)return undefined
    let active=true
    const poll=async()=>{try{const response=await apiFetch('/api/driver/orders/offer',{credentials:'include'});if(response.status===204)return;if(!response.ok)throw new Error();const next=await response.json();if(active&&next?.id){setOffer(current=>{if(current?.id!==next.id&&sound)playAlert();return next});setOrderServiceError('')}}catch{if(active)setOrderServiceError('Order service is currently unavailable.')}}
    poll();const timer=window.setInterval(poll,4000);return()=>{active=false;window.clearInterval(timer)}
  },[online,activeOrder,sound,playAlert])
  const decideOrder=async accept=>{if(!offer)return;try{const response=await apiFetch(`/api/driver/orders/${encodeURIComponent(offer.id)}/${accept?'accept':'reject'}`,{method:'POST',credentials:'include'});if(!response.ok)throw new Error();const result=await response.json().catch(()=>({}));if(accept)setActiveOrder(result.order||offer);setOffer(null)}catch{setOrderServiceError('Order service is currently unavailable. Your response was not recorded.')}}
  const completeOrder=async()=>{
    if(!activeOrder)return
    try{const action=activeOrder.deliveryStatus==='ON_DELIVERY'?'complete':'pickup';await api('/api/driver/orders/'+activeOrder.id+'/'+action,{method:'POST'});setActiveOrder(await api('/api/driver/orders/active'));setOrderServiceError(action==='complete'?'Delivery recorded. Cash collection is a separate financial confirmation.':'Pickup recorded.');loadNotifications()}catch(error){setOrderServiceError(error.message)}
  }
  const changeSound=value=>{setSound(value);localStorage.setItem('foodie-driver-sound',value?'on':'off')}
  const changeDark=value=>{setDark(value);localStorage.setItem('foodie-driver-dark-mode',value?'on':'off')}
  const notificationTime=value=>{const minutes=Math.max(0,Math.floor((clockNow-new Date(value).getTime())/60000));if(minutes<1)return'Just now';if(minutes<60)return`${minutes} min${minutes===1?'':'s'} ago`;const hours=Math.floor(minutes/60);if(hours<24)return`${hours} hour${hours===1?'':'s'} ago`;const days=Math.floor(hours/24);return`${days} day${days===1?'':'s'} ago`}
  const nav=[['Home','home'],['Profile','user'],['Earnings','earnings'],['Notifications','bell'],['Settings','settings']]
  const formatMoney=value=>`Rs. ${Number(value||0).toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2})}`
  const displayDate=new Date(clockNow).toLocaleDateString('en-LK',{weekday:'short',day:'numeric',month:'short',year:'numeric'})
  return <section className={`driver-dashboard ${dark?'is-dark':''}`}>
    <aside className="driver-sidebar"><div className="driver-brand"><span><Icon name="scooter" size={23}/></span><b>foodie<span>.</span></b><small>DRIVER</small></div><nav aria-label="Driver dashboard">{nav.map(([name,icon])=><button key={name} onClick={()=>setSection(name)} className={section===name?'active':''} aria-current={section===name?'page':undefined}><i><Icon name={icon} size={19}/></i>{name}{name==='Notifications'&&unreadNotifications>0&&<em>{unreadNotifications>99?'99+':unreadNotifications}</em>}</button>)}</nav><button type="button" className="driver-side-user" onClick={()=>setSection('Profile')} aria-label="Open driver profile"><span className="avatar">{initials}</span><span><b>{driverName}</b>{driver?.driverId&&<small>ID: {driver.driverId}</small>}</span></button></aside>
    <div className="driver-main"><header className="driver-topbar"><div className="driver-greeting"><div className="avatar">{initials}</div><div><small>Welcome,</small><b>{driverName}</b><span>Driver account</span></div></div><div className="driver-clock"><span>{displayDate}</span><b><Icon name="clock" size={14}/> {new Date(clockNow).toLocaleTimeString('en-LK',{hour:'2-digit',minute:'2-digit'})}</b></div></header>
      {section==='Home'&&<div className="driver-home"><DriverMap position={position} online={online} networkOnline={networkOnline} locationStatus={mapLocationStatus}/><div className="home-status"><div className={`status-icon ${online?'on':''}`}><Icon name={online?'location':'power'} size={19}/></div><div className="status-copy"><b>{online?'You’re Online':'You’re currently offline'}</b><span>{online?'Available for nearby deliveries':'Go online to receive delivery offers'}</span></div>{online&&<span className="online-pill"><i/> Online</span>}</div><div className="home-actions"><div className="searching-label"><span className={`pulse-ring ${online?'is-active':''}`}><Icon name={online?'location':'scooter'} size={20}/></span><div><b>{activeOrder?'Delivery in progress':online?'Waiting for delivery offers':'Ready to start delivering?'}</b><small>{activeOrder?`Order ${activeOrder.id}`:online?'New delivery offers will appear here.':'Turn on availability when you are ready.'}</small></div></div><button className="availability-control" type="button" onClick={()=>setAvailability(!online)} aria-label={online?'Go offline':'Go online'} aria-pressed={online}><span>{locating?'Locating…':online?'Online':'Offline'}</span><span className={`availability-switch ${online?'is-online':''}`}><i/></span></button></div>{(availabilityError||orderServiceError)&&<p className="driver-settings-feedback" role="status">{availabilityError||orderServiceError}</p>}{activeOrder&&<div className="accepted-card"><span className="accepted-icon"><Icon name="scooter" size={21}/></span><div><b>{activeOrder.id}</b><small>{activeOrder.destination||'Delivery in progress'}</small></div><button type="button" onClick={completeOrder}><Icon name="check" size={15}/> {activeOrder.deliveryStatus==='ON_DELIVERY'?'Complete delivery':'Confirm pickup'}</button></div>}</div>}
      {section === 'Home' && (
          <CashCollectionPanel activeOrderId={activeOrder?.id ?? null} />
      )}
      {section==='Profile'&&<ProfileSettings driver={driver} vehiclePending={vehiclePending} onProfileChange={onDriverChange} onVehicleSubmit={async()=>onDriverChange(await api('/api/driver/profile'))}/>}
      {section==='Earnings'&&<DriverEarnings/>}
      {section==='Notifications'&&<div className="section-page"><div className="page-heading"><div><h1>Notifications</h1><p>Order updates, payment alerts, and important notes</p></div><button className="text-button" onClick={markAllRead} disabled={!unreadNotifications}>Mark all as read</button></div>{notificationError&&<p className="driver-settings-feedback" role="status">{notificationError}</p>}{notifications.length?<div className="notice-list">{notifications.map(item=><article key={item.id} className={!item.read?'is-unread':''}><DriverNotificationIcon type={item.type}/><div className="driver-notice-copy"><b>{item.title}</b><span>{item.message}</span></div><small>{notificationTime(item.createdAt)}</small>{!item.read&&<button type="button" className="driver-notice-mark-read" onClick={()=>markRead(item.id)}>Mark read</button>}</article>)}</div>:<div className="notice-list driver-notice-empty"><Icon name="bell" size={24}/><b>No notifications</b><span>{notificationError||'New account updates will appear here.'}</span></div>}</div>}
      {section==='Settings'&&<div className="section-page"><div className="page-heading"><div><h1>Settings</h1><p>Manage your preferences</p></div></div>{settingsNotice&&<p className="driver-settings-feedback" role="status">{settingsNotice}</p>}<div className="settings-list"><article><span><Icon name="location"/></span><div><b>Location Access</b><small>Required to find nearby deliveries</small></div><em>{hasLocation?'Enabled':'Not enabled'}</em><button type="button" onClick={checkLocationAccess} aria-label="Check location access"><Icon name="chevron"/></button></article><article><span><Icon name="bell"/></span><div><b>Sound Notifications</b><small>Alert when a delivery offer arrives</small></div><button className={`switch ${sound?'checked':''}`} role="switch" aria-label="Sound notifications" aria-checked={sound} onClick={()=>changeSound(!sound)}/></article><article><span><Icon name="settings"/></span><div><b>Dark Mode</b><small>Use a darker color theme</small></div><button className={`switch ${dark?'checked':''}`} role="switch" aria-label="Dark mode" aria-checked={dark} onClick={()=>changeDark(!dark)}/></article><article><span><Icon name="info"/></span><div><b>Help & Support</b><small>Contact us or report an issue</small></div><button type="button" aria-label="Open help and support" onClick={()=>{setSettingsNotice('');setSection('Help')}}><Icon name="chevron"/></button></article></div></div>}
      {section==='Help'&&<DriverHelpSupport onBack={()=>setSection('Settings')}/>}
    </div>
    {offer&&<div className="order-overlay"><div className="order-dialog"><div className="order-bell"><Icon name="bell" size={24}/></div><h2>New delivery offer</h2><p>Review the delivery details and respond.</p><div className="order-id">Order ID<b>{offer.id}</b></div><div className="customer-row"><div className="avatar">{String(offer.customerName||'C').slice(0,1).toUpperCase()}</div><div><small>Customer</small><b>{offer.customerName||'Customer'}</b></div></div>{Array.isArray(offer.items)&&<div className="order-items"><b>Items</b>{offer.items.map((item,index)=><span key={item.id||index}>{item.name||item}</span>)}</div>}<div className="order-totals"><div><span>Delivery payment</span><b>{formatMoney(offer.deliveryPayment)}</b></div></div><div className="destination-row"><span>📍</span><div><b>Destination</b><small>{offer.destination||'Address unavailable'}</small></div><b>{offer.distance||''}</b></div><div className="order-buttons"><button type="button" onClick={()=>decideOrder(false)}>Reject</button><button type="button" onClick={()=>decideOrder(true)}>Accept order</button></div></div></div>}
  </section>
}
function App() {
  const [page,setPage]=useState('splash')
  const [step,setStep]=useState(0)
  const [phone,setPhone]=useState('')
  const [phoneError,setPhoneError]=useState('')
  const [birthDate,setBirthDate]=useState('')
  const [birthDateError,setBirthDateError]=useState('')
  const [showPassword,setShowPassword]=useState(false)
  const [loginError,setLoginError]=useState('')
  const [registrationError,setRegistrationError]=useState('')
  const [driver,setDriver]=useState(null)
  const [registrationData,setRegistrationData]=useState({})
  const [registrationFiles,setRegistrationFiles]=useState({})
  const [applicationAccount,setApplicationAccount]=useState(null)
  const [registrationBusy,setRegistrationBusy]=useState(false)
  const fieldKeys={'First Name':'firstName','Last Name':'lastName','NIC Number':'nationalId','Driving License Number':'licenseNumber','Email Address':'email','Address Line 1':'address1','Address Line 2':'address2','Address Line 3':'address3','Vehicle Registration Number':'registration'}
  const registrationField=label=>({name:fieldKeys[label],value:registrationData[fieldKeys[label]] || '',onChange:event=>setRegistrationData(current=>({...current,[fieldKeys[label]]:event.target.value}))})
  const documentKinds={'NIC (Front Side)':'NIC_FRONT','NIC (Back Side)':'NIC_BACK','Driving License (Front Side)':'LICENSE_FRONT','Driving License (Back Side)':'LICENSE_BACK','Vehicle Registration Document (Front Side)':'REGISTRATION_FRONT','Vehicle Registration Document (Back Side)':'REGISTRATION_BACK','Vehicle Revenue Licence (Front Side)':'REVENUE_FRONT','Vehicle Revenue Licence (Back Side)':'REVENUE_BACK','Vehicle Insurance (Front Side)':'INSURANCE_FRONT','Vehicle Insurance (Back Side)':'INSURANCE_BACK','Front View':'VEHICLE_FRONT','Back View':'VEHICLE_BACK','Side View':'VEHICLE_SIDE'}


  useEffect(()=>{const timer=window.setTimeout(async()=>{try{const account=await api('/api/account');if(account.role==='RIDER'){setApplicationAccount(account);setRegistrationData({firstName:account.firstName,lastName:account.lastName,nationalId:account.nationalId,licenseNumber:account.licenseNumber,email:account.email,address1:account.address1,address2:account.address2,address3:account.address3,registration:account.plate});setPhone(account.phone || '');setBirthDate(account.birthDate || '');const documents=await api('/api/applications/documents');setRegistrationFiles(Object.fromEntries(documents.map(document=>[Object.keys(documentKinds).find(label=>documentKinds[label]===document.name),{name:'Saved '+document.name,size:document.size,existing:true}]).filter(([label])=>label)));if(account.approvalStatus==='APPROVED'){setDriver(await api('/api/driver/profile'));setPage('dashboard');return}setLoginError('Application '+account.approvalStatus+'. Permitted onboarding remains available.')}}catch{}setPage('login')},1400);return()=>window.clearTimeout(timer)},[])
  const normalizePhone=value=>value.replace(/[^\d+]/g,'')
  const validPhone=value=>/^(?:\+94|0)?\d{9}$/.test(normalizePhone(value))
  const submitLogin=async event=>{
    event.preventDefault();setLoginError('');const data=new FormData(event.currentTarget)
    try {
      const email=String(data.get('email')),password=String(data.get('password'))
      const token=new URLSearchParams(window.location.search).get('setupToken')
      if(token){await api('/api/auth/setup-password',{method:'POST',body:{email,token,password}});window.history.replaceState({},'',window.location.pathname)}
      const account=await signIn(email,password,'RIDER');setApplicationAccount(account)
      if(account.approvalStatus!=='APPROVED'){
        if(token){try{await api('/api/applications/submit',{method:'POST'});setLoginError('Application submitted for Admin approval.')}catch(error){setLoginError(error.message)}}
        else setLoginError('Application '+account.approvalStatus+(account.submitted?' — submitted for Admin review.':' — complete permitted onboarding.'))
        return
      }
      setDriver(await api('/api/driver/profile'));setPage('dashboard')
    }catch(error){setLoginError(error.message)}
  }
  const next=async event=>{
    event.preventDefault()
    if(step===0&&!birthDate){setBirthDateError('Select your date of birth.');return}
    setBirthDateError('')
    if(step===1&&!validPhone(phone)){setPhoneError('Enter a valid Sri Lankan phone number.');return}
    setPhoneError('')
    if(step<4)setStep(step+1)
    else {
      if(registrationBusy)return;setRegistrationBusy(true);setRegistrationError('')
      try {
        let account=applicationAccount
        if(!account){account=await api('/api/driver/applications',{method:'POST',body:{...registrationData,phone,birthDate}});setApplicationAccount(account)}
        if(account.submitted){setRegistrationError('Application '+account.approvalStatus+' — already submitted.');return}
        for(const [label,kind] of Object.entries(documentKinds)){const file=registrationFiles[label];if(!file)throw new Error('Upload '+label);if(file.existing)continue;const form=new FormData();form.append('file',file);await api('/api/applications/documents/'+kind,{method:'POST',body:form})}
        if(account.emailVerified){await api('/api/applications/submit',{method:'POST'});setRegistrationError('Registration submitted for Admin approval.')}
        else setRegistrationError('Your registration and documents were saved. Use the private email setup link to choose a password and submit for approval. Email delivery requires configured SMTP.')
      }catch(error){setRegistrationError(error.message)}finally{setRegistrationBusy(false)}
    }
  }

  return <main className="portal-shell">
    {page==='splash'&&<section className="splash-screen"><div className="splash-sun"/><div className="splash-cloud cloud-a"/><div className="splash-cloud cloud-b"/><Brand splash/><div className="splash-city"/><div className="splash-road"/><div className="splash-streak streak-a"/><div className="splash-streak streak-b"/><div className="splash-puff"><i/><i/><i/></div><div className="splash-ride"><Scooter/></div></section>}
    {page==='login'&&<section className="login-layout"><div className="login-art"><div className="art-cloud one"/><div className="art-cloud two"/><div className="art-city"/><Brand/><div className="sun-disc"/><div className="login-rider"><Scooter small/></div></div><div className="login-card"><h1>Welcome Back</h1><p className="subhead">Log in to your driver account</p><form onSubmit={submitLogin}><Field label="Email Address" name="email" defaultValue={new URLSearchParams(window.location.search).get('email') || ''} placeholder="Enter your email" type="email" autoComplete="username"/><label className="field"><span>Password</span><div className="password-wrap"><input name="password" type={showPassword?'text':'password'} placeholder="Enter your password" required autoComplete="current-password"/><button type="button" className="eye" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}><Icon name={showPassword?'eyeOff':'eye'} size={19}/></button></div></label><div className="login-options"><span/><button type="button" className="text-button" onClick={async()=>{try{const email=document.querySelector('input[name=email]')?.value;await api('/api/auth/recovery',{method:'POST',body:{email}});setLoginError('If eligible, recovery instructions were queued. Email delivery requires configured SMTP.')}catch(error){setLoginError(error.message)}}}>Forgot password?</button></div><button className="primary full" type="submit">Login</button></form>{loginError&&<p className="auth-error" role="alert">{loginError}</p>}<div className="or-line"><span/>or<span/></div><button className="outline full driver-button" onClick={()=>{setPage('register');setStep(0);setRegistrationError('')}}><Icon name="user" size={18}/> Register as a driver</button><p className="register-prompt">Need an account? <button className="text-button" onClick={()=>{setPage('register');setStep(0);setRegistrationError('')}}>Register here</button></p></div></section>}
    {page==='register'&&<section className="register-layout"><aside className="step-sidebar"><Brand compact/><div className="step-count">Step {step+1} of 5</div><nav>{steps.map((title,index)=><button type="button" key={title} onClick={()=>index<step&&setStep(index)} className={`step-nav ${index===step?'active':''} ${index<step?'done':''}`}><span>{index<step?<Icon name="check" size={15}/>:index+1}</span>{title}</button>)}</nav><div className="sidebar-city"/><div className="sidebar-rider"><Scooter small/></div></aside><div className="form-panel"><div className="registration-scenery" aria-hidden="true"><i className="scenery-cloud cloud-one"/><i className="scenery-cloud cloud-two"/><i className="scenery-sun"/><i className="scenery-skyline"/><i className="scenery-tree tree-one"/><i className="scenery-tree tree-two"/><i className="scenery-road"/></div><div className="step-progress"><i style={{width:`${(step+1)*20}%`}}/></div><div className="step-heading"><h1>{steps[step]}</h1><p>{['Let’s start with your basic details','Where can we reach you?','Upload clear photos or scans of your documents','Upload your vehicle related documents','Upload clear photos of your vehicle'][step]}</p></div><form className="step-form" onSubmit={next} onChange={event=>{if(event.target.type==='file'){const file=event.target.files?.[0];if(file)setRegistrationFiles(current=>({...current,[event.target.name]:file}))}}}>
      {step===0&&<div className="field-grid"><Field {...registrationField('First Name')} label="First Name" placeholder="Enter your first name"/><Field {...registrationField('Last Name')} label="Last Name" placeholder="Enter your last name"/><Field {...registrationField('NIC Number')} label="NIC Number" placeholder="Enter your NIC number"/><Field {...registrationField('Driving License Number')} label="Driving License Number" placeholder="Enter your driving license number"/><DatePicker value={birthDate} onChange={date=>{setBirthDate(date);setBirthDateError('')}} error={birthDateError}/></div>}
      {step===1&&<div className="field-grid contact-grid"><Field {...registrationField('Email Address')} label="Email Address" placeholder="Enter your email address" type="email"/><label className="field"><span>Contact Number <b>*</b></span><div className="phone-wrap"><span><Icon name="phone" size={16}/> +94 <Icon name="chevronDown" size={14}/></span><input type="tel" value={phone} onChange={event=>{setPhone(event.target.value);setPhoneError('')}} placeholder="Enter your number" required/></div><small>Enter a valid Sri Lankan phone number.</small>{phoneError&&<em>{phoneError}</em>}</label><Field {...registrationField('Address Line 1')} label="Address Line 1" placeholder="Street address, house number"/><Field {...registrationField('Address Line 2')} label="Address Line 2" placeholder="Apartment, building, etc. (optional)" required={false}/><Field {...registrationField('Address Line 3')} label="Address Line 3" placeholder="City, district, postal code" required={false}/></div>}
      {step===2&&<div className="upload-grid"><UploadBox savedFile={registrationFiles['NIC (Front Side)']} label="NIC (Front Side)"/><UploadBox savedFile={registrationFiles['NIC (Back Side)']} label="NIC (Back Side)"/><UploadBox savedFile={registrationFiles['Driving License (Front Side)']} label="Driving License (Front Side)"/><UploadBox savedFile={registrationFiles['Driving License (Back Side)']} label="Driving License (Back Side)"/></div>}
      {step===3&&<div className="vehicle-docs"><div className="vehicle-group"><Field {...registrationField('Vehicle Registration Number')} label="Vehicle Registration Number" placeholder="Enter vehicle registration number"/><div className="upload-grid"><UploadBox savedFile={registrationFiles['Vehicle Registration Document (Front Side)']} label="Vehicle Registration Document (Front Side)"/><UploadBox savedFile={registrationFiles['Vehicle Registration Document (Back Side)']} label="Vehicle Registration Document (Back Side)"/></div><p className="upload-hint">Upload a PDF document or clear photos of both sides.</p></div><div className="vehicle-group"><div className="upload-grid"><UploadBox savedFile={registrationFiles['Vehicle Revenue Licence (Front Side)']} label="Vehicle Revenue Licence (Front Side)"/><UploadBox savedFile={registrationFiles['Vehicle Revenue Licence (Back Side)']} label="Vehicle Revenue Licence (Back Side)"/></div></div><div className="vehicle-group"><div className="upload-grid"><UploadBox savedFile={registrationFiles['Vehicle Insurance (Front Side)']} label="Vehicle Insurance (Front Side)"/><UploadBox savedFile={registrationFiles['Vehicle Insurance (Back Side)']} label="Vehicle Insurance (Back Side)"/></div></div></div>}
      {step===4&&<><div className="upload-grid three-uploads"><UploadBox savedFile={registrationFiles['Front View']} label="Front View" accept="image/*" hint="JPG or PNG (Max 5MB)"/><UploadBox savedFile={registrationFiles['Back View']} label="Back View" accept="image/*" hint="JPG or PNG (Max 5MB)"/><UploadBox savedFile={registrationFiles['Side View']} label="Side View" accept="image/*" hint="JPG or PNG (Max 5MB)"/></div><div className="guidelines"><strong><Icon name="info" size={17}/> Important Guidelines:</strong><ul><li>Upload clear and recent photos</li><li>Show the full vehicle in each photo</li><li>Make sure the number plate is visible</li><li>JPG or PNG format (Max 5MB each)</li></ul></div></>}
      {registrationError&&<p className="driver-settings-feedback" role="alert">{registrationError}</p>}
      <div className="form-actions">{step>0?<button type="button" className="back-button" onClick={()=>setStep(step-1)}><Icon name="arrowLeft" size={17}/> Back</button>:<button type="button" className="back-button" onClick={()=>setPage('login')}>Cancel</button>}{step<4?<button type="submit" className="primary next-button">Next <Icon name="arrowRight" size={17}/></button>:<button type="submit" className="primary" disabled={registrationBusy}>Submit Registration</button>}</div>
    </form></div></section>}
    {page==='dashboard'&&<DriverDashboard driver={driver} onDriverChange={setDriver}/>}
  </main>
}
export default App
