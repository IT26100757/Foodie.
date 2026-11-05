
import { useEffect, useRef, useState } from 'react'
import './App.css'
import OrdersPage from './OrdersPage.jsx'
import { api, signIn } from './api.js'
import { loadMerchantOrders } from './merchantApi.js'
import DeliveryPage from './DeliveryPage.jsx'
import MenuPage from './MenuPage.jsx'
import WalletPage from './WalletPage.jsx'
import { playOrderAlert, prepareOrderAudio, stopOrderAudio } from './orderAudio.js'

const foodieLogo = 'https://res.cloudinary.com/g7u1tdxx/image/upload/v1792826258/Gemini_Generated_Image_v0q9c4v0q9c4v0q9.jpg'

const iconPaths = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
  orders: <><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></>,
  menu: <><path d="M4 5h16M4 12h16M4 19h16"/></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18M15 14h3M7 5V3h11"/></>,
  delivery: <><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h5l3-7h-5l-2-3H6M14 10l2 7M4 12h4"/></>,
  reports: <><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-8h4v8M3 20h18"/></>,
  payments: <><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/></>,
  marketing: <><path d="m3 11 17-6v14L3 13zM6 14l2 6h4l-2-5M20 10l2-1M20 15l2 1"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 4.3 1.5c-1.1 1.2-2 1.4-2 3M12 17h.01"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2.6-1.5L13.5 3h-3L9 5a7 7 0 0 0-2.6 1.5L4 5.5 2 9l2 1.5a7 7 0 0 0 0 3L2 15l2 3.5 2.4-1A7 7 0 0 0 9 19l.5 2h3l.5-2a7 7 0 0 0 2.6-1.5l2.4 1L21 15z" transform="translate(1 0) scale(.92)"/></>,
  logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></>,
  notifications: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3v3H8z"/></>,
  chevronDown: <><path d="m6 9 6 6 6-6"/></>,
  trend: <><path d="M4 17 10 11l4 4 7-8M15 7h6v6"/></>,
  customers: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20v-1.5A5.5 5.5 0 0 1 8.5 13h1a5.5 5.5 0 0 1 5.5 5.5V20zM16 5.2a3.5 3.5 0 0 1 0 6.6M18 14a5 5 0 0 1 3 4.5V20"/></>,
  coins: <><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/><path d="M8 7h2M8 10h2M14 13h2M14 16h2"/></>,
  chart: <><path d="M4 19V5M4 19h17M8 15l4-4 3 2 5-6"/></>,
  sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></>,
  plate: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.5"/><path d="M3 4v6M5 4v6M4 10v10M20 4v7M20 11v9M18 4v7"/></>,
  feedback: <><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></>,
}
function Icon({ name, size = 20, className = '' }) {
  return <svg className={`ui-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{iconPaths[name]}</svg>
}
function App() {
  const [view, setView] = useState('splash')
  const [merchantName, setMerchantName] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(async () => {try{const account=await api('/api/account');if(account.role==='MERCHANT'&&account.approvalStatus==='APPROVED'){setMerchantName(account.firstName);setView('dashboard');return}}catch{}setView('login')}, 1800)
    return () => window.clearTimeout(timer)
  }, [])

  if (view === 'splash') return <SplashScreen />
  if (view === 'registration') return <RegistrationPortal onLogin={() => setView('login')} />
  if (view === 'dashboard') return <MerchantDashboard merchantName={merchantName} onSignOut={async () => {try{await api('/api/auth/logout',{method:'POST'});setView('login')}catch(error){window.alert(error.message)}}} />
  if (view === 'welcome') return <WelcomeTransition merchantName={merchantName} onComplete={() => setView('dashboard')} />
  return <LoginPortal onRegister={() => setView('registration')} onLogin={(name) => { setMerchantName(name); setView('welcome') }} />
}

function WelcomeTransition({ merchantName, onComplete }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(onComplete, reducedMotion ? 50 : 1900)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return <main className="welcome-transition" aria-label="Welcome to your Foodie dashboard">
    <div className="welcome-glow welcome-glow-red" /><div className="welcome-glow welcome-glow-yellow" />
    <div className="welcome-transition-content"><div className="welcome-transition-mark"><img src={foodieLogo} alt="" /></div>
      <span className="welcome-transition-kicker">FOODIE MERCHANT</span><h1>Welcome back<span>.</span></h1>
      <p>{merchantName ? `Let's get your workspace ready, ${merchantName}.` : 'Let’s get your workspace ready.'}</p>
      <div className="welcome-progress"><i /></div>
    </div>
  </main>
}

function Brand({ light = false }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#" onClick={(event) => event.preventDefault()} aria-label="Foodie merchant portal">
    <img className="brand-logo" src={foodieLogo} alt="" />
    <span>foodie<span className="brand-dot">.</span></span><span className="brand-tag">MERCHANT</span>
  </a>
}

function SplashScreen() {
  return <main className="splash-screen" aria-label="Loading Foodie merchant portal">
    <div className="splash-orbit splash-orbit-one" /><div className="splash-orbit splash-orbit-two" />
    <div className="splash-content"><div className="splash-mark"><img src={foodieLogo} alt="" /></div>
      <div className="splash-wordmark">foodie<span>.</span></div><p>GOOD FOOD. GREAT BUSINESS.</p>
      <div className="splash-loader" role="status"><span /><span /><span /></div><span className="splash-loading-text">PREPARING YOUR TABLE</span>
    </div>
  </main>
}

function LoginPortal({ onRegister, onLogin }) {
  const [identifier, setIdentifier] = useState(()=>new URLSearchParams(window.location.search).get('email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!identifier.trim() || !password) { setError('Enter your email or account ID and password to continue.'); return }
    setLoading(true)
    try{const setupToken=new URLSearchParams(window.location.search).get('setupToken');if(setupToken){await api('/api/auth/setup-password',{method:'POST',body:{email:identifier,token:setupToken,password}});window.history.replaceState({},'',window.location.pathname);}const account=await signIn(identifier,password,'MERCHANT');if(account.approvalStatus!=='APPROVED'){setError('Application '+account.approvalStatus+'. Use Create an account to complete permitted onboarding.');return}onLogin(account.firstName)}catch(error){setError(error.message)}finally{setLoading(false)}
  }

  return <main className="portal-page">
    <header className="topbar"><Brand /><div className="topbar-login"><span>New to Foodie?</span><button className="login-link" type="button" onClick={onRegister}>Create an account</button></div></header>
    <div className="portal-food-floaters" aria-hidden="true">
      <svg className="portal-mascot mascot-toast" viewBox="0 0 82 104" role="presentation"><path d="M17 80C12 68 8 43 10 27 12 12 23 5 39 5s28 8 31 22c3 18-1 43-6 54l3 14H48l-5-12h-7l-5 12H21l3-15Z" fill="#f4bd8e" stroke="#505575" strokeWidth="4.5" strokeLinejoin="round"/><path d="M29 94v7m22-7v7" stroke="#505575" strokeWidth="4.5" strokeLinecap="round"/><circle cx="30" cy="42" r="5" fill="#505575"/><circle cx="52" cy="42" r="5" fill="#505575"/><circle cx="31.5" cy="40.5" r="1.5" fill="white"/><circle cx="53.5" cy="40.5" r="1.5" fill="white"/><path d="M31 55q10 9 20 0" fill="none" stroke="#505575" strokeWidth="3.5" strokeLinecap="round"/><circle cx="19" cy="27" r="2" fill="#d99d72"/><circle cx="61" cy="66" r="2.5" fill="#d99d72"/></svg>
      <svg className="portal-mascot mascot-noodles" viewBox="0 0 112 104" role="presentation"><path d="M24 35q3-10 13-9 7-17 20-8 14-11 24 3 15-3 18 14" fill="#fff1b3" stroke="#505575" strokeWidth="4" strokeLinejoin="round"/><path d="M10 39h91c-2 29-19 48-45 48S13 68 10 39Z" fill="#fffaf0" stroke="#505575" strokeWidth="4.5" strokeLinejoin="round"/><path d="M12 50h86m-74 3q9 9 18 0m7 0q9 9 18 0m8 0q8 8 15 0" fill="none" stroke="#ef806f" strokeWidth="4" strokeLinecap="round"/><path d="M43 6v23M57 4l-4 26" stroke="#505575" strokeWidth="4" strokeLinecap="round"/><circle cx="42" cy="66" r="4" fill="#505575"/><circle cx="69" cy="66" r="4" fill="#505575"/><path d="M44 77q11 8 22 0" fill="none" stroke="#505575" strokeWidth="3.5" strokeLinecap="round"/><path d="M39 89v9m34-9v9" stroke="#505575" strokeWidth="4" strokeLinecap="round"/></svg>
      <svg className="portal-mascot mascot-burger" viewBox="0 0 100 100" role="presentation"><path d="M13 43C14 23 28 12 50 12s36 11 37 31H13Z" fill="#f4bc76" stroke="#505575" strokeWidth="4.5" strokeLinejoin="round"/><path d="M22 28h.1m15-8h.1m16 7h.1m15-5h.1m8 12h.1" stroke="#fff4d7" strokeWidth="4" strokeLinecap="round"/><path d="M14 48h72l-6 11H20l-6-11Z" fill="#78b879" stroke="#505575" strokeWidth="4" strokeLinejoin="round"/><path d="M19 62h62v10H19z" fill="#9e533f" stroke="#505575" strokeWidth="4"/><path d="M17 76h66c-2 10-14 14-33 14S19 86 17 76Z" fill="#e9a54f" stroke="#505575" strokeWidth="4" strokeLinejoin="round"/><circle cx="40" cy="54" r="3.5" fill="#505575"/><circle cx="61" cy="54" r="3.5" fill="#505575"/><path d="M42 62q8 7 16 0" fill="none" stroke="#505575" strokeWidth="3" strokeLinecap="round"/></svg>
      <svg className="portal-mascot mascot-drink" viewBox="0 0 82 104" role="presentation"><path d="m29 20 22 1 12 66H19l10-67Z" fill="#ffe9dd" stroke="#505575" strokeWidth="4.5" strokeLinejoin="round"/><path d="m39 20 8-15 8 4-5 12M23 31h36" fill="none" stroke="#505575" strokeWidth="4" strokeLinecap="round"/><circle cx="34" cy="53" r="4" fill="#505575"/><circle cx="50" cy="53" r="4" fill="#505575"/><path d="M35 64q7 7 14 0" fill="none" stroke="#505575" strokeWidth="3.5" strokeLinecap="round"/><circle cx="31" cy="77" r="3" fill="#e87c74"/><circle cx="42" cy="80" r="3" fill="#e87c74"/><circle cx="53" cy="76" r="3" fill="#e87c74"/><path d="M30 88v8m22-8v8" stroke="#505575" strokeWidth="4" strokeLinecap="round"/></svg>
      <svg className="portal-mascot mascot-pizza" viewBox="0 0 92 104" role="presentation"><path d="m12 22 68-13-24 73c-4 12-19 14-26 3L12 22Z" fill="#ffe39a" stroke="#505575" strokeWidth="4.5" strokeLinejoin="round"/><path d="m12 22 68-13" stroke="#d9964b" strokeWidth="9" strokeLinecap="round"/><circle cx="43" cy="42" r="5" fill="#e56d61"/><circle cx="61" cy="31" r="5" fill="#e56d61"/><circle cx="47" cy="62" r="4.5" fill="#e56d61"/><circle cx="44" cy="54" r="3" fill="#505575"/><circle cx="59" cy="50" r="3" fill="#505575"/><path d="M46 63q7 6 13 0m-27 30-5 7m23-12 3 12" fill="none" stroke="#505575" strokeWidth="3.5" strokeLinecap="round"/></svg>
    </div>
    <section className="portal-layout">
      <aside className="portal-story"><div className="story-copy"><span className="eyebrow"><span className="eyebrow-dot" /> THE MERCHANT TABLE</span>
        <h1>YOUR NEXT<br />GREAT DAY<br /><span>STARTS HERE.</span></h1>
        <p>Orders, customers, and your restaurant's growth. Everything you need, all in one place.</p>
        <div className="story-stats"><div><strong>ONE</strong><span>simple dashboard</span></div><i /><div><strong>MORE</strong><span>ways to grow</span></div></div>
      </div><div className="story-food-art" aria-hidden="true"><span className="art-spark">✳</span><div className="art-plate"><div className="art-burger"><i /><i /><i /><i /><i /></div></div><span className="art-caption">MADE FOR<br />YOUR BUSINESS</span></div>
      <div className="story-footer"><span>GOOD FOOD. GREAT BUSINESS.</span><span>FOODIE © 2026</span></div></aside>
      <section className="login-card"><div className="login-card-top"><span className="form-label">MERCHANT PORTAL</span><span className="secure-pill"><i /> SECURE SIGN IN</span></div>
        <div className="form-heading"><h2>Welcome<br />back<span className="brand-dot">.</span></h2><p>Sign in to pick up where your business left off.</p></div>
        {error && <div className="form-message" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <label className="field"><span>Email or account ID <b>*</b></span><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@restaurant.com" autoComplete="username" required /></label>
          <label className="field"><span>Password <b>*</b></span><div className="password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
          <div className="login-options"><span><i /> Your workspace is ready</span><button type="button" onClick={async()=>{try{await api('/api/auth/recovery',{method:'POST',body:{email:identifier}});setError('If eligible, recovery instructions were queued. Email delivery requires configured SMTP.')}catch(error){setError(error.message)}}}>Forgot password?</button></div>
          <button className="submit-button" type="submit" disabled={loading}>{loading ? <><span className="button-spinner" /> Signing in…</> : <>SIGN IN TO DASHBOARD <span aria-hidden="true">→</span></>}</button>
        </form>
        <div className="login-divider"><span>NEW TO FOODIE?</span></div>
        <button className="register-cta" type="button" onClick={onRegister}>Register your restaurant <span aria-hidden="true">↗</span></button>
      </section>
    </section>
  </main>
}
function getMerchantFoodSales(order) {
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);

  const additionalCharge = order.customerAgreed
      ? Number(order.additionalCharge || 0)
      : 0;

  return subtotal - discount + additionalCharge;
}
function MerchantDashboard({ merchantName, onSignOut }) {
  const [active, setActive] = useState('Home')
  const [chartMetric, setChartMetric] = useState('Sales')
  const [dateRange, setDateRange] = useState('Last 7 days')
  const [orders, setOrders] = useState([])
  const [reviews,setReviews]=useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [orderSoundEnabled, setOrderSoundEnabled] = useState(false)
  const [settingsTheme, setSettingsTheme] = useState(() => localStorage.getItem('foodie-theme') || 'light')
  const alertStopRef = useRef(null)
  useEffect(()=>{
    let active=true
    async function refresh(){try{const [rows,notes,feedback]=await Promise.all([loadMerchantOrders(),api('/api/notifications'),api('/api/restaurants/mine').then(owned=>owned[0]?api('/api/reviews/restaurant/'+owned[0].id):[])]);if(active){setOrders(rows);setReviews(feedback);setNotifications(notes.filter(note=>!note.read).map(note=>({...note,orderId:note.title.match(/#(\d+)/)?.[1],receivedAt:note.createdAt})))}}catch(error){console.error(error.message)}}
    refresh();const timer=setInterval(refresh,30000);return()=>{active=false;clearInterval(timer)}
  },[])
  const completed = orders.filter((order) =>
      ['DELIVERED', 'PICKED_UP'].includes(order.backendStatus)
  );

  const periodOrders = orders.filter((order) => {
    const days = dateRange === 'Last 30 days' ? 30 : 7;

    return (
        Date.now() - new Date(order.createdAt).getTime() <
        days * 86400000
    );
  });

  const paidPeriodOrders = periodOrders.filter(
      (order) => order.paymentStatus === 'COMPLETED'
  );

  const periodSales = paidPeriodOrders.reduce(
      (sum, order) => sum + getMerchantFoodSales(order),
      0
  );

  const averageOrderValue = paidPeriodOrders.length
      ? periodSales / paidPeriodOrders.length
      : 0;

  const metricValues = {
    'Total Sales': 'Rs. ' + periodSales.toLocaleString('en-LK'),
    'Total Orders': periodOrders.length,
    'Average Order Value':
        'Rs. ' + averageOrderValue.toLocaleString('en-LK'),
    'Total Customers': new Set(
        periodOrders.map(
            (order) => order.customerId || order.contactPhone
        )
    ).size
  };
  const customerVisits=new Map()
  const bestItems=new Map()
  for(const order of periodOrders.filter(order=>order.backendStatus!=='CANCELLED')){
    const customer=order.customerId || order.contactPhone || 'guest-order-'+order.id
    customerVisits.set(customer,(customerVisits.get(customer)||0)+1)
  }
  for(const order of completed)for(const item of order.items){const key=item.menuItemId;const existing=bestItems.get(key)||{name:item.name,quantity:0};existing.quantity+=Number(item.quantity);bestItems.set(key,existing)}
  const bestItemText=[...bestItems.values()].sort((a,b)=>b.quantity-a.quantity).slice(0,3).map(item=>item.name+' × '+item.quantity).join(' · ')
  const repeatCustomers=[...customerVisits.values()].filter(count=>count>1).length
  const chartValue=chartMetric==='Sales'?metricValues['Total Sales']:chartMetric==='Orders'?periodOrders.length:metricValues['Average Order Value']
  const feedbackText=reviews.length?reviews.slice(0,3).map(review=>'★ '+review.rating+' · '+review.comment).join(' · '):'No customer reviews recorded.'



  useEffect(() => {
    function onMerchantOrder(event) {
      const order = event.detail?.order
      if (!order?.id) return
      loadMerchantOrders().then(setOrders).catch(error=>console.error(error.message))
      api('/api/notifications').then(notes=>setNotifications(notes.filter(note=>!note.read).map(note=>({...note,receivedAt:note.createdAt})))).catch(error=>console.error(error.message))
      setNotificationsOpen(true)
      if (orderSoundEnabled) {
        alertStopRef.current?.()
        alertStopRef.current = playOrderAlert(30000)
      }
    }
    window.addEventListener('foodie:merchant-order', onMerchantOrder)
    return () => {
      window.removeEventListener('foodie:merchant-order', onMerchantOrder)
      alertStopRef.current?.()
      alertStopRef.current = null
      stopOrderAudio()
    }
  }, [orderSoundEnabled])
  function handleOrderSoundChange(enabled) {
    if (enabled && !prepareOrderAudio()) return
    if (!enabled) {
      alertStopRef.current?.()
      alertStopRef.current = null
    }
    setOrderSoundEnabled(enabled)
  }

  function handleWalletTransaction(transaction) {
    const notification = {
      id: transaction.transactionId,
      type: 'wallet-transaction',
      transactionId: transaction.transactionId,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency || 'LKR',
      receivedAt: transaction.updatedAt || new Date().toISOString(),
    }
    setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)])
    setNotificationsOpen(true)
  }

  async function updateAdditionalCharge(orderId,value){try{await api('/api/orders/'+orderId+'/additional-charge',{method:'PUT',body:{amount:Math.max(0,Number(value)||0)}});setOrders(await loadMerchantOrders())}catch(error){window.alert(error.message)}}
  const navItems = ['Home', 'Orders', 'Menu', 'Wallet', 'Delivery']
  const iconMap = { Home: 'home', Orders: 'orders', Menu: 'menu', Wallet: 'wallet', Delivery: 'delivery' }

  return <main className={`dashboard-shell ${settingsTheme === 'dark' ? 'dark-theme' : ''}`}>
    <aside className="dashboard-sidebar">
      <Brand light />
      <span className="sidebar-caption">WORKSPACE</span>
      <nav className="dashboard-nav" aria-label="Merchant dashboard">
        {navItems.map((item) => <button key={item} type="button" className={active === item ? 'active' : ''} onClick={() => setActive(item)}><span className="nav-icon"><Icon name={iconMap[item]} size={19} /></span>{item}{item === 'Orders' && <i className="nav-indicator" />}</button>)}
      </nav>
      <div className="sidebar-bottom"><button type="button" className={active === 'Settings' ? 'active' : ''} onClick={() => setActive('Settings')}><span className="nav-icon"><Icon name="settings" size={19} /></span>Settings</button><button type="button" onClick={onSignOut}><span className="nav-icon"><Icon name="logout" size={19} /></span>Log Out</button><div className="sidebar-profile"><span className="profile-avatar">{(merchantName || 'M').slice(0, 1).toUpperCase()}</span><span><b>{merchantName || 'Merchant'}</b><small>Merchant account</small></span><i>···</i></div></div>
    </aside>
    <section className="dashboard-main">
      <header className="dashboard-topbar"><div className="breadcrumb">Workspace <span>/</span> {active}</div><div className="dashboard-top-actions"><NotificationsMenu notifications={notifications} open={notificationsOpen} setOpen={setNotificationsOpen} onClear={async()=>{try{await api('/api/notifications/read-all',{method:'POST'});setNotifications([])}catch(error){window.alert(error.message)}}} onDismiss={async(id)=>{try{await api('/api/notifications/'+id+'/read',{method:'POST'});setNotifications(current=>current.filter(item=>item.id!==id))}catch(error){window.alert(error.message)}}} onSelect={(notification) => setActive(notification?.type === 'wallet-transaction' ? 'Wallet' : 'Orders')} /><span className="topbar-divider" />{active === 'Wallet' && <span className="wallet-merchant-label">{merchantName || 'Merchant'}<small>Merchant account</small></span>}<span className="top-avatar">{(merchantName || 'M').slice(0, 1).toUpperCase()}</span></div></header>
      {active === 'Home' ? <div className="dashboard-content">
        <div className="dashboard-heading-row"><div><span className="dashboard-kicker">YOUR BUSINESS AT A GLANCE</span><h1>Good afternoon{merchantName ? `, ${merchantName}` : ''}<span>.</span></h1><p>Here’s what’s happening with your restaurant.</p></div><button className="date-select" type="button" onClick={() => setDateRange((range) => range === 'Last 7 days' ? 'Last 30 days' : 'Last 7 days')}><Icon name="calendar" size={16} />{dateRange}<Icon name="chevronDown" size={14} className="date-chevron" /></button></div>
        <div className="metric-grid">{[['Total Sales', 'trend', 'red'], ['Total Orders', 'orders', 'yellow'], ['Average Order Value', 'coins', 'peach'], ['Total Customers', 'customers', 'mint']].map(([label, icon, tone]) => <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon name={icon} size={18} /></i></div><strong className="metric-empty">{metricValues[label]}</strong></article>)}</div>
        <BusinessPerformanceChart
            orders={orders}
            chartMetric={chartMetric}
            setChartMetric={setChartMetric}
        />
        <div className="insights-grid"><section className="dashboard-card insight-card"><div className="card-heading"><div><h2>Top Eats</h2><p>What customers are enjoying</p></div><span className="card-spark"><Icon name="sparkle" size={19} /></span></div><EmptyState icon="plate" text={bestItemText || 'No completed order items recorded.'} /></section>
          <section className="dashboard-card insight-card"><div className="card-heading"><div><h2>Top Selling Items</h2><p>Your best performers</p></div><button type="button" className="subtle-link" onClick={() => setActive('Menu')}>View menu →</button></div><EmptyState icon="orders" text={bestItemText || 'No completed order items recorded.'} /></section>
          <section className="dashboard-card insight-card"><div className="card-heading"><div><h2>Customers</h2><p>New and repeat visitors</p></div></div><div className="customer-legend"><span><i className="legend-new" />New customers</span><span><i className="legend-repeat" />Repeat customers</span></div><div className="customer-empty"><div className="donut-empty"><span>{customerVisits.size}</span></div><p>{customerVisits.size-repeatCustomers} new · {repeatCustomers} repeat customers in {dateRange.toLowerCase()}.</p></div></section>
          <section className="dashboard-card insight-card feedback-card"><div className="card-heading"><div><h2>Menu Item Feedback</h2><p>Hear what customers think</p></div><span className="feedback-stars"><Icon name="feedback" size={17} /></span></div><EmptyState icon="feedback" text={feedbackText} /></section>
        </div>
      </div> : active === 'Orders' ? <OrdersPage orders={orders} onAdditionalChargeChange={updateAdditionalCharge} /> : active === 'Delivery' ? <DeliveryPage orders={orders} /> : active === 'Menu' ? <MenuPage /> : active === 'Wallet' ? <WalletPage orders={orders} onTransactionComplete={handleWalletTransaction} /> : active === 'Settings' ? <SettingsPage soundEnabled={orderSoundEnabled} onSoundChange={handleOrderSoundChange} theme={settingsTheme} onThemeChange={(value) => { setSettingsTheme(value); localStorage.setItem('foodie-theme', value) }} /> : <div className="dashboard-content section-content"><span className="dashboard-kicker">FOODIE MERCHANT WORKSPACE</span><h1>{active}<span>.</span></h1><section className="dashboard-card section-empty"><EmptyState /></section></div>}
    </section>
  </main>
}

function SettingsPage({ soundEnabled, onSoundChange, theme, onThemeChange }) {
  const [section, setSection] = useState('')
  const [accountTab, setAccountTab] = useState('Restaurant Profile')
  const [profile,setProfile]=useState({name:'',address:'',phone:'',email:'',description:''})
  const [logo,setLogo]=useState('')
  const [saved, setSaved] = useState('')
  const [complaintType, setComplaintType] = useState('Customer')
  const [complaint, setComplaint] = useState({ subject: '', description: '' })
  const [complaintSubmitted, setComplaintSubmitted] = useState(false)
  const [preferences, setPreferences] = useState(() => { try { return JSON.parse(localStorage.getItem('foodie-notifications')) || { orders: true, delivery: true, customers: true, marketing: false } } catch { return { orders: true, delivery: true, customers: true, marketing: false } } })
  const [accounts,setAccounts]=useState([])
  useEffect(()=>{Promise.all([api('/api/restaurants/mine'),api('/api/account'),api('/api/wallet/bank-accounts')]).then(([restaurants,account,banks])=>{const restaurant=restaurants[0];if(restaurant){setProfile({...restaurant,email:account.email});setLogo(restaurant.logoImage || '')}setAccounts(banks.map(bank=>({...bank,number:'•••• '+bank.lastFour})))}).catch(error=>setSaved(error.message))},[])
  const cards = [
    ['Account Details', 'Manage your restaurant profile, password and email.', 'customers', 'profile'],
    ['Appearance', 'Switch between light and dark mode.', 'sparkle', 'appearance'],
    ['Bank Accounts', 'Manage your linked bank accounts.', 'payments', 'banks'],
    ['Notifications', 'Manage your notification preferences.', 'notifications', 'notifications'],
    ['Help & Support', 'Get help or submit a complaint.', 'help', 'help'],
  ]
  async function saveProfile(event){event?.preventDefault();try{await api('/api/restaurants/'+profile.id,{method:'PUT',body:{...profile,logoImage:logo}});setSaved('Restaurant profile saved.')}catch(error){setSaved(error.message)}}
  function togglePreference(key) { const next = { ...preferences, [key]: !preferences[key] }; setPreferences(next); localStorage.setItem('foodie-notifications', JSON.stringify(next)) }
  async function removeAccount(id){try{await api('/api/wallet/bank-accounts/'+id,{method:'DELETE'});setAccounts(current=>current.filter(account=>account.id!==id));setSaved('Bank account removed.')}catch(error){setSaved(error.message)}}
  function uploadLogo(event) { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { setSaved('Choose an image file for your restaurant logo.'); return } const reader = new FileReader(); reader.onload = () => { const image = String(reader.result); setLogo(image); setSaved('Logo selected. Save Changes to persist it.') }; reader.readAsDataURL(file) }
  const title = section ? ({ profile: 'Account Details', appearance: 'Appearance', banks: 'Bank Accounts', notifications: 'Notifications', help: 'Help & Support' })[section] : 'Settings'
  return <div className="dashboard-content section-content settings-content">
    <span className="dashboard-kicker">PREFERENCES</span><div className="settings-heading"><div><h1>{title}<span>.</span></h1><p>{section ? 'Manage your merchant workspace preferences.' : 'Manage your restaurant account, preferences and more.'}</p></div>{section && <button className="settings-back" type="button" onClick={() => { setSection(''); setSaved('') }}>← Back to settings</button>}</div>
    {saved && <p className="settings-feedback" role="status">{saved}</p>}
    {!section ? <div className="settings-tiles">{cards.map(([name, description, icon, key]) => <button type="button" className="dashboard-card settings-tile" key={key} onClick={() => { setSection(key); setSaved('') }}><span className="settings-tile-icon"><Icon name={icon} size={20} /></span><strong>{name}</strong><small>{description}</small><span className="settings-tile-arrow">›</span></button>)}</div> : null}
    {section === 'profile' && <div className="dashboard-card settings-card profile-settings"><aside className="settings-subnav">{['Restaurant Profile', 'Change Password', 'Change Email'].map((tab) => <button key={tab} type="button" className={accountTab === tab ? 'selected' : ''} onClick={() => { setAccountTab(tab); setSaved('') }}>{tab}</button>)}</aside>
      {accountTab === 'Restaurant Profile' ? <form className="settings-form" onSubmit={saveProfile}><h2>Restaurant Profile</h2><p>Update the information customers see about your restaurant.</p><div className="logo-upload"><div className="restaurant-logo-preview">{logo ? <img src={logo} alt="Restaurant logo" /> : <span>{(profile.name || 'F').slice(0,1).toUpperCase()}</span>}</div><label className="settings-upload-button">{logo ? 'Change logo' : 'Upload logo'}<input type="file" accept="image/*" onChange={uploadLogo} /></label><small>PNG, JPG or WEBP</small></div><label>Restaurant Name<input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label><label>Restaurant Address<input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="Street, city, country" /></label><div className="settings-form-row"><label>Contact Number<input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label><label>Email Address<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label></div><label>Description (Optional)<textarea value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} rows="3" /></label><button className="settings-primary" type="submit">Save Changes</button></form> : <form className="settings-form" onSubmit={async(e)=>{e.preventDefault();const values=Array.from(e.currentTarget.querySelectorAll('input')).map(input=>input.value);try{if(accountTab==='Change Password'){if(values[1]!==values[2])throw new Error('Passwords do not match.');await api('/api/account/password',{method:'POST',body:{currentPassword:values[0],newPassword:values[1]}});setSaved('Password changed. Sign in again.')}else{await api('/api/account/email',{method:'POST',body:{email:values[0],password:values[1]}});setSaved('Email verification requested. Check the new address.')}}catch(error){setSaved(error.message)}}}><h2>{accountTab}</h2><p>{accountTab === 'Change Password' ? 'Choose a new password for your merchant account.' : 'Update the email address used to sign in.'}</p>{accountTab === 'Change Password' ? <><label>Current Password<input required type="password" autoComplete="current-password" /></label><label>New Password<input required type="password" minLength="8" autoComplete="new-password" /></label><label>Confirm New Password<input required type="password" minLength="8" autoComplete="new-password" /></label></> : <><label>New Email Address<input required type="email" placeholder="you@restaurant.com" /></label><label>Confirm with Password<input required type="password" autoComplete="current-password" /></label></>}<button className="settings-primary">Save Changes</button><small className="settings-integration-note">Secure account changes require your current password; email changes require verification.</small></form>}</div>}
    {section === 'appearance' && <section className="dashboard-card settings-card"><h2>Theme Mode</h2><p>Choose the look that feels right for your workspace.</p><div className="theme-options">{['light','dark'].map((mode) => <button type="button" key={mode} className={theme === mode ? 'selected' : ''} onClick={() => onThemeChange(mode)}><span>{mode === 'light' ? '☀' : '☾'}</span><strong>{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</strong><i>{theme === mode ? '●' : '○'}</i></button>)}</div><h3>Preview</h3><div className="theme-preview"><div className="theme-preview-light"><b>foodie.</b><i /><i /><i /></div><div className="theme-preview-dark"><b>foodie.</b><i /><i /><i /></div></div></section>}
    {section === 'banks' && <section className="dashboard-card settings-card"><h2>Linked Bank Accounts</h2><p>Manage your saved destination accounts.</p>{accounts.length ? <div className="settings-bank-list">{accounts.map((account) => <article key={account.id}><span className="settings-bank-mark">▣</span><span><b>{account.bank}</b><small>{account.name} · {account.number}</small></span><button type="button" onClick={() => removeAccount(account.id)}>Remove</button></article>)}</div> : <p className="settings-empty">No linked bank accounts yet. Add one from Wallet.</p>}<small className="settings-integration-note">Bank details are stored securely; no bank transfer is executed automatically.</small></section>}
    {section === 'notifications' && <section className="dashboard-card settings-card settings-notification-list">{[['orders','Order Notifications','Get notified when you receive new orders.'],['delivery','Delivery Updates','Get notified about delivery status changes.'],['customers','Customer Messages','Get notified when customers send messages.'],['marketing','Marketing Updates','Receive updates about promotions and new features.']].map(([key,label,description]) => <div className="settings-option" key={key}><span className="settings-option-icon"><Icon name="notifications" size={19} /></span><span className="settings-option-copy"><strong>{label}</strong><small>{description}</small></span><SettingsSwitch label={label} enabled={preferences[key]} onChange={() => togglePreference(key)} /></div>)}<div className="settings-option"><span className="settings-option-icon"><span>◖))</span></span><span className="settings-option-copy"><strong>Notification Sound</strong><small>Play a sound for new order notifications.</small></span><SettingsSwitch label="Notification Sound" enabled={soundEnabled} onChange={() => onSoundChange(!soundEnabled)} /></div></section>}
    {section === 'help' && <div className="settings-help-grid"><section className="dashboard-card settings-card"><h2>Contact Information</h2><p><b>☎</b> +94 11 234 5678</p><p><b>✉</b> support@foodie.com</p><p><b>◷</b> Mon – Fri, 9:00 AM – 6:00 PM</p><small className="settings-integration-note">Contact details shown for assistance.</small></section><form className="dashboard-card settings-card settings-form complaint-form" onSubmit={async(e)=>{e.preventDefault();try{await api('/api/complaints',{method:'POST',body:{type:complaintType,...complaint}});setComplaintSubmitted(true);setComplaint({subject:'',description:''})}catch(error){setSaved(error.message)}}}><h2>Submit a Complaint</h2><p>Share a concern about a customer or delivery.</p><fieldset><legend>Complaint Type</legend>{['Customer','Delivery'].map((type) => <label key={type}><input type="radio" name="complaint-type" checked={complaintType === type} onChange={() => setComplaintType(type)} />{type}</label>)}</fieldset><label>Subject<input required value={complaint.subject} onChange={(e) => setComplaint({ ...complaint, subject: e.target.value })} placeholder="Enter a short subject" /></label><label>Description<textarea required rows="5" value={complaint.description} onChange={(e) => setComplaint({ ...complaint, description: e.target.value })} placeholder="Describe your complaint in detail..." /></label><small className="settings-integration-note">Complaints are saved for Admin review.</small><button className="settings-primary" type="submit">Submit Complaint</button>{complaintSubmitted && <p className="settings-feedback" role="status">Your complaint was submitted.</p>}</form></div>}
  </div>
}
function SettingsSwitch({ label, enabled, onChange }) { return <button type="button" className={`settings-switch ${enabled ? 'on' : ''}`} role="switch" aria-checked={enabled} aria-label={label} onClick={onChange}><span /></button> }
function NotificationsMenu({ notifications, open, setOpen, onClear, onDismiss, onSelect }) {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function closeOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, setOpen])

  return <div className="notification-menu" ref={menuRef}>
    <button className={`icon-button notification-trigger ${notifications.length ? 'has-notifications' : ''}`} aria-label={`Notifications${notifications.length ? `, ${notifications.length} new` : ''}`} aria-haspopup="dialog" aria-expanded={open} type="button" onClick={() => setOpen((value) => !value)}><Icon name="notifications" size={18} />{notifications.length > 0 && <span className="notification-count">{notifications.length > 99 ? '99+' : notifications.length}</span>}</button>
    {open && <section className="notification-panel" role="dialog" aria-label="Notifications"><div className="notification-panel-heading"><div><strong>Notifications</strong><span>{notifications.length ? `${notifications.length} new notification${notifications.length === 1 ? '' : 's'}` : 'You’re all caught up'}</span></div><button type="button" className="clear-notifications" onClick={onClear} disabled={!notifications.length}>Clear all</button></div>
      {notifications.length ? <div className="notification-items">{notifications.map((notification) => <article className="notification-entry" key={notification.id}><button type="button" className="notification-item" onClick={() => { onSelect(notification); setOpen(false) }}><span className="notification-mark"><Icon name={notification.type === 'wallet-transaction' ? 'payments' : 'orders'} size={17} /></span><span className="notification-copy"><strong>{notification.type === 'wallet-transaction' ? `Transaction ${notification.status === 'COMPLETED' ? 'successful' : 'failed'}` : 'New order received'}</strong><span>{notification.type === 'wallet-transaction' ? `Transaction ID ${notification.transactionId}` : `Order #${notification.orderId}`}</span>{notification.type === 'wallet-transaction' && <span>{notification.status === 'COMPLETED' ? 'Completed' : 'Failed'} · {new Intl.NumberFormat('en-LK', { style: 'currency', currency: notification.currency || 'LKR' }).format(Number(notification.amount))}</span>}<time>{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(notification.receivedAt))}</time></span></button><button type="button" className="dismiss-notification" aria-label={notification.type === 'wallet-transaction' ? `Clear transaction notification ${notification.transactionId}` : `Clear notification for order ${notification.orderId}`} onClick={() => onDismiss(notification.id)}>×</button></article>)}</div> : <div className="notifications-empty"><span className="notification-empty-mark"><Icon name="notifications" size={20} /></span><strong>No notifications</strong><p>Order and wallet transaction alerts will appear here.</p></div>}
    </section>}
  </div>
}
function EmptyState({ icon = 'chart', text = '' }) {
  return <div className="empty-state"><span className="empty-state-mark"><Icon name={icon} size={19} /></span>{text}</div>
}

function RegistrationPortal({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [frontPreview, setFrontPreview] = useState('')
  const [backPreview, setBackPreview] = useState('')
  const [message, setMessage] = useState('')
  const [documents,setDocuments]=useState({})
  const [application,setApplication]=useState(null)
  useEffect(()=>{api('/api/account').then(async account=>{if(account.role!=='MERCHANT')return;setApplication(account);const restaurant=await api('/api/applications/restaurant');setFormData(current=>({...current,firstName:account.firstName,lastName:account.lastName,nationalId:account.nationalId,email:account.email,restaurantName:restaurant.name,restaurantAddress:restaurant.address,restaurantPhone:restaurant.phone}));setMessage('Application '+account.approvalStatus+(account.submitted?' — submitted for review.':' — upload documents to complete onboarding.'))}).catch(()=>{})},[])


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    password: '',
    confirmPassword: '',
  })

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleFileChange(event, side) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file for the document.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Each document image must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    setMessage('')

    setDocuments(current=>({...current,[side]:file}))
    const previewUrl = URL.createObjectURL(file)

    if (side === 'front') {
      setFrontPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return previewUrl
      })
    } else {
      setBackPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return previewUrl
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (!application && formData.password.length < 8) {
      setMessage('Your password must contain at least 8 characters.')
      return
    }

    if (!application && formData.password !== formData.confirmPassword) {
      setMessage('Your passwords do not match.')
      return
    }

    if (!frontPreview || !backPreview) {
      setMessage('Please upload both sides of your business registration.')
      return
    }

    try {
      let account=application
      if(!account){account=await api('/api/merchants/register',{method:'POST',body:formData});await signIn(formData.email,formData.password,'MERCHANT');setApplication(account)}
      if(account.submitted){setMessage('Application '+account.approvalStatus+' — already submitted.');return}
      for(const [side,kind] of [['front','BUSINESS_FRONT'],['back','BUSINESS_BACK']]){const data=new FormData();data.append('file',documents[side]);await api('/api/applications/documents/'+kind,{method:'POST',body:data})}
      await api('/api/applications/submit',{method:'POST'});setApplication({...account,submitted:true});setMessage('Application submitted. Operational access starts after Admin approval.')
    } catch(error){setMessage(error.message)}
  }

  return (
      <main className="merchant-page">
        <header className="topbar">
          <a className="brand" href="#" aria-label="Foodie home">
            <img
                className="brand-logo"
                src="https://res.cloudinary.com/g7u1tdxx/image/upload/v1792826258/Gemini_Generated_Image_v0q9c4v0q9c4v0q9.jpg"
                alt="Foodie logo"
            />
            <span>foodie<span className="brand-dot">.</span></span>
            <span className="brand-tag">MERCHANT</span>
          </a>

          <div className="topbar-login">
            <span>Already a partner?</span>
            <button
                className="login-link"
                type="button"
                onClick={onLogin}
            >
              Sign in
            </button>
          </div>
        </header>

        <section className="registration-layout">
          <aside className="welcome-panel">
            <div className="welcome-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              GROW WITH FOODIE
            </span>

              <h1>
                Your food.
                <br />
                Your business.
                <br />
                <span>MORE POSSIBILITIES.</span>
              </h1>

              <p className="welcome-description">
                Bring your restaurant online, connect with hungry customers,
                and manage your business from one place.
              </p>

              <div className="benefit-list">
                <div className="benefit">
                  <span className="benefit-icon">01</span>
                  <div>
                    <strong>REACH MORE CUSTOMERS</strong>
                    <p>Make your menu available online.</p>
                  </div>
                </div>

                <div className="benefit">
                  <span className="benefit-icon">02</span>
                  <div>
                    <strong>MANAGE ORDERS EASILY</strong>
                    <p>Keep your restaurant organized.</p>
                  </div>
                </div>

                <div className="benefit">
                  <span className="benefit-icon">03</span>
                  <div>
                    <strong>GROW YOUR BUSINESS</strong>
                    <p>Track your restaurant's performance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="welcome-footer">
              <span>GOOD FOOD. GREAT BUSINESS.</span>
              <span>FOODIE © 2026</span>
            </div>
          </aside>

          <section className="form-panel">
            <div className="form-heading">
              <span className="form-label">MERCHANT REGISTRATION</span>
              <h2>Let's get you started.</h2>
              <p>
                Tell us about yourself and your restaurant to create your
                merchant account.
              </p>
            </div>

            {message && (
                <div className="form-message" role="status" aria-live="polite">
                  {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">01</span>
                  <div>
                    <h3>Owner information</h3>
                    <p>Your personal and account details</p>
                  </div>
                </div>

                <div className="field-grid">
                  <label className="field">
                    <span>First name <b>*</b></span>
                    <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        autoComplete="given-name"
                        required
                    />
                  </label>

                  <label className="field">
                    <span>Last name <b>*</b></span>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        autoComplete="family-name"
                        required
                    />
                  </label>

                  <label className="field">
                    <span>National ID number <b>*</b></span>
                    <input
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        placeholder="Enter your national ID"
                        autoComplete="off"
                        required
                    />
                  </label>

                  <label className="field">
                    <span>Email address <b>*</b></span>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                  </label>
                </div>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <div>
                    <h3>Restaurant information</h3>
                    <p>Tell us about your business</p>
                  </div>
                </div>

                <div className="field-grid">
                  <label className="field full-width">
                    <span>Restaurant name <b>*</b></span>
                    <input
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                        placeholder="e.g. The Hungry Kitchen"
                        autoComplete="organization"
                        required
                    />
                  </label>

                  <label className="field full-width">
                    <span>Restaurant address <b>*</b></span>
                    <textarea
                        name="restaurantAddress"
                        value={formData.restaurantAddress}
                        onChange={handleChange}
                        placeholder="Enter your complete restaurant address"
                        rows={3}
                        autoComplete="street-address"
                        required
                    />
                  </label>

                  <label className="field full-width">
                    <span>Restaurant contact number <b>*</b></span>
                    <input
                        name="restaurantPhone"
                        type="tel"
                        value={formData.restaurantPhone}
                        onChange={handleChange}
                        placeholder="Enter restaurant phone number"
                        autoComplete="tel"
                        required
                    />
                  </label>
                </div>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">03</span>
                  <div>
                    <h3>Business registration</h3>
                    <p>Upload clear images or scans of both sides</p>
                  </div>
                </div>

                <div className="upload-grid">
                  <DocumentUpload
                      title="Front side"
                      preview={frontPreview}
                      inputId="business-front"
                      onChange={(event) => handleFileChange(event, 'front')}
                  />

                  <DocumentUpload
                      title="Back side"
                      preview={backPreview}
                      inputId="business-back"
                      onChange={(event) => handleFileChange(event, 'back')}
                  />
                </div>

                <p className="upload-note">
                  JPG, PNG or other browser-supported image formats · Maximum
                  5 MB per image. Scan or photograph each side clearly.
                </p>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">04</span>
                  <div>
                    <h3>Secure your account</h3>
                    <p>Create the password you'll use to sign in</p>
                  </div>
                </div>

                <div className="field-grid">
                  <label className="field full-width">
                    <span>Password <b>*</b></span>
                    <div className="password-wrap">
                      <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          minLength={8}
                          required={!application}
                      />
                      <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>

                  <label className="field full-width">
                    <span>Confirm password <b>*</b></span>
                    <input
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Enter your password again"
                        autoComplete="new-password"
                        minLength={8}
                        required={!application}
                    />
                  </label>
                </div>

                <p className="security-note">
                  <span aria-hidden="true">🔒</span>
                  Your account credentials and documents must be securely
                  processed by the Foodie backend.
                </p>
              </section>

              <button className="submit-button" type="submit">
                Create merchant account <span aria-hidden="true">→</span>
              </button>

              <p className="terms-note">
                By continuing, you agree to Foodie's merchant registration
                terms and verification process.
              </p>
            </form>
          </section>
        </section>
      </main>
  )
}

function DocumentUpload({ title, preview, inputId, onChange }) {
  return (
      <div className="upload-card">
        <label className="upload-dropzone" htmlFor={inputId}>
          {preview ? (
              <img className="document-preview" src={preview} alt={`${title} preview`} />
          ) : (
              <>
                <span className="upload-icon" aria-hidden="true">↑</span>
                <strong>Upload {title.toLowerCase()}</strong>
                <span>Choose an image or scan</span>
              </>
          )}
        </label>

        <div className="upload-card-footer">
          <span>{title}</span>
          <label className="browse-button" htmlFor={inputId}>
            {preview ? 'Change image' : 'Browse'}
          </label>
        </div>

        <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="file-input"
            required
        />
      </div>
  )
}


function BusinessPerformanceChart({
                                    orders = [],
                                    chartMetric,
                                    setChartMetric
                                  }) {
  const [period, setPeriod] = useState('Last 6 months');
  const [chartType, setChartType] = useState('Line');
  const [hoverIndex, setHoverIndex] = useState(null);

  const now = new Date();

  const monthCount =
      period === 'Last 3 months'
          ? 3
          : period === 'This year'
              ? now.getMonth() + 1
              : 6;

  // Prepare monthly order and sales data
  const monthlyData = Array.from(
      { length: monthCount },
      (_, index) => {
        const month = period === 'This year'
            ? new Date(now.getFullYear(), index, 1)
            : new Date(
                now.getFullYear(),
                now.getMonth() - monthCount + index + 1,
                1
            );

        const monthOrders = orders.filter((order) => {
          const date = new Date(order.createdAt || order.date);

          return (
              !Number.isNaN(date.getTime()) &&
              date.getFullYear() === month.getFullYear() &&
              date.getMonth() === month.getMonth()
          );
        });

        // Only count collected payments as sales
        const paidOrders = monthOrders.filter(
            (order) => order.paymentStatus === 'COMPLETED'
        );

        // Food sales exclude delivery fees
        const sales = paidOrders.reduce(
            (total, order) =>
                total + getMerchantFoodSales(order),
            0
        );

        const average = paidOrders.length > 0
            ? sales / paidOrders.length
            : 0;

        return {
          label: month.toLocaleString('en-US', {
            month: 'short'
          }),

          fullLabel: month.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
          }),

          sales,
          orders: monthOrders.length,
          average
        };
      }
  );

  // Select chart metric
  const metricKey =
      chartMetric === 'Orders'
          ? 'orders'
          : chartMetric === 'Average Order Value'
              ? 'average'
              : 'sales';

  const color =
      chartMetric === 'Orders'
          ? '#4ca36b'
          : chartMetric === 'Average Order Value'
              ? '#f0ad36'
              : '#ef4438';

  const formatValue = (value) => {
    if (chartMetric === 'Orders') {
      return String(value);
    }

    return `Rs. ${Number(value).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Calculate chart scale
  const values = monthlyData.map(
      (item) => item[metricKey]
  );

  const highest = Math.max(
      chartMetric === 'Orders' ? 4 : 100,
      ...values
  );

  const roughStep = highest / 4;
  const power = 10 ** Math.floor(Math.log10(roughStep));

  const step =
      [1, 2, 2.5, 5, 10]
          .map((number) => number * power)
          .find((number) => number >= roughStep) ||
      10 * power;

  const maxY = step * 4;

  // SVG chart dimensions
  const left = 65;
  const right = 700;
  const top = 20;
  const bottom = 240;

  const width = right - left;
  const height = bottom - top;

  const x = (index) =>
      left +
      (index / Math.max(monthlyData.length - 1, 1)) *
      width;

  const y = (value) =>
      bottom - (value / maxY) * height;

  const points = monthlyData
      .map(
          (item, index) =>
              `${x(index)},${y(item[metricKey])}`
      )
      .join(' ');

  const selectedIndex =
      hoverIndex === null
          ? monthlyData.length - 1
          : Math.min(hoverIndex, monthlyData.length - 1);

  const selected = monthlyData[selectedIndex];

  return (
      <section className="dashboard-card sales-card">

        {/* Chart heading */}
        <div
            className="card-heading"
            style={{
              flexWrap: 'wrap',
              gap: 12
            }}
        >
          <div>
            <h2>Business performance</h2>
            <p>Track your restaurant's monthly performance</p>
          </div>

          <div
              className="chart-toggles"
              role="group"
              aria-label="Chart metric"
          >
            {[
              'Sales',
              'Orders',
              'Average Order Value'
            ].map((metric) => (
                <button
                    type="button"
                    key={metric}
                    className={
                      chartMetric === metric ? 'selected' : ''
                    }
                    onClick={() => setChartMetric(metric)}
                >
                  {metric}
                </button>
            ))}
          </div>
        </div>

        {/* Chart controls */}
        <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 20
            }}
        >
          <select
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                setHoverIndex(null);
              }}
              style={{
                border: '1px solid #e8e2da',
                borderRadius: 8,
                background: '#fff',
                padding: '9px 12px',
                fontSize: 11,
                color: '#625b52'
              }}
          >
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>This year</option>
          </select>

          <div style={{ display: 'flex', gap: 6 }}>
            {['Line', 'Bar'].map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => setChartType(type)}
                    style={{
                      border: '1px solid #e8e2da',
                      borderRadius: 8,
                      padding: '9px 15px',
                      background:
                          chartType === type ? '#153d30' : '#fff',
                      color:
                          chartType === type ? '#fff' : '#625b52',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                >
                  {type} chart
                </button>
            ))}
          </div>
        </div>

        {/* SVG chart */}
        <div
            style={{
              width: '100%',
              marginTop: 18
            }}
        >
          <svg
              viewBox="0 0 730 295"
              role="img"
              aria-label={`${chartMetric} monthly ${chartType.toLowerCase()} chart`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Horizontal grid lines and Y-axis labels */}
            {[0, 1, 2, 3, 4].map((tick) => {
              const value = (maxY / 4) * tick;
              const position = y(value);

              return (
                  <g key={tick}>
                    <line
                        x1={left}
                        x2={right}
                        y1={position}
                        y2={position}
                        stroke="#e9e5df"
                        strokeDasharray="4 5"
                    />

                    <text
                        x={left - 12}
                        y={position + 4}
                        textAnchor="end"
                        fill="#a19a90"
                        fontSize="11"
                    >
                      {chartMetric === 'Orders'
                          ? value.toLocaleString('en-LK')
                          : `Rs. ${
                              value >= 1000
                                  ? `${(value / 1000).toFixed(1)}k`
                                  : value.toLocaleString('en-LK')
                          }`}
                    </text>
                  </g>
              );
            })}

            {/* Line chart */}
            {chartType === 'Line' ? (
                <>
                  <polyline
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />

                  {monthlyData.map((item, index) => (
                      <circle
                          key={index}
                          cx={x(index)}
                          cy={y(item[metricKey])}
                          r={selectedIndex === index ? 6 : 4}
                          fill="#fff"
                          stroke={color}
                          strokeWidth="2.5"
                          style={{ cursor: 'pointer' }}
                          tabIndex={0}
                          onMouseEnter={() => setHoverIndex(index)}
                          onFocus={() => setHoverIndex(index)}
                          onClick={() => setHoverIndex(index)}
                      >
                        <title>
                          {`${item.fullLabel}: ${formatValue(
                              item[metricKey]
                          )}`}
                        </title>
                      </circle>
                  ))}
                </>
            ) : (
                /* Bar chart */
                monthlyData.map((item, index) => {
                  const barWidth = Math.min(
                      42,
                      (width / monthCount) * 0.55
                  );

                  const barHeight =
                      bottom - y(item[metricKey]);

                  return (
                      <rect
                          key={index}
                          x={x(index) - barWidth / 2}
                          y={y(item[metricKey])}
                          width={barWidth}
                          height={barHeight}
                          rx="5"
                          fill={color}
                          opacity={
                            selectedIndex === index ? 1 : 0.75
                          }
                          style={{ cursor: 'pointer' }}
                          tabIndex={0}
                          onMouseEnter={() => setHoverIndex(index)}
                          onFocus={() => setHoverIndex(index)}
                          onClick={() => setHoverIndex(index)}
                      >
                        <title>
                          {`${item.fullLabel}: ${formatValue(
                              item[metricKey]
                          )}`}
                        </title>
                      </rect>
                  );
                })
            )}

            {/* Month labels */}
            {monthlyData.map((item, index) => (
                <text
                    key={index}
                    x={x(index)}
                    y={bottom + 25}
                    textAnchor="middle"
                    fill="#928a80"
                    fontSize="11"
                >
                  {item.label}
                </text>
            ))}
          </svg>
        </div>

        {/* Selected month details */}
        <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              padding: '12px 14px',
              background: '#f8f6f2',
              border: '1px solid #eee9e2',
              borderRadius: 10,
              fontSize: 12
            }}
        >
          <strong>{selected.fullLabel}</strong>

          <span
              style={{
                color,
                fontWeight: 800
              }}
          >
          {chartMetric}: {formatValue(
              selected[metricKey]
          )}
        </span>
        </div>

        {/* Chart information */}
        <p
            style={{
              marginTop: 12,
              color: '#999188',
              fontSize: 10
            }}
        >
          {chartMetric === 'Sales'
              ? 'Based on collected merchant food sales, excluding delivery fees.'
              : chartMetric === 'Orders'
                  ? 'Based on recorded orders, including pending and cancelled orders.'
                  : 'Average collected merchant food sales per paid order.'}

          {' '}Months without matching orders show zero.
        </p>
      </section>
  );
}


export default App