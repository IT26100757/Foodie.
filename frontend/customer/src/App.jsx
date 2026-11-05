import { useEffect, useState } from 'react'
import './App.css'
import HomePage from './HomePage.jsx'
import { api, signIn, accountView } from './api.js'

const foods = [
  { emoji: '🍕', className: 'food-pizza' }, { emoji: '🍟', className: 'food-fries' },
  { emoji: '🍔', className: 'food-burger' }, { emoji: '🍩', className: 'food-donut' },
  { emoji: '🥑', className: 'food-avocado' }, { emoji: '🍗', className: 'food-chicken' },
  { emoji: '🥬', className: 'food-leaf' },
]

function FieldIcon({ name }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const shapes = {
    person: <><circle cx="12" cy="8" r="3.3" /><path d="M5.8 20v-1.6a6.2 6.2 0 0 1 12.4 0V20z" /></>,
    id: <><rect x="3.5" y="5" width="17" height="14" rx="1.8" /><circle cx="8.5" cy="11" r="2" /><path d="M5.8 16a3 3 0 0 1 5.4 0M13 10h4.5M13 13h4.5M13 16h3" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 7 8 6 8-6" /></>,
    home: <><path d="m3.5 11 8.5-7 8.5 7M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" /></>,
    location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  }
  return <span className="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="19" height="19" {...common}>{shapes[name]}</svg></span>
}

function Brand() {
  return <a className="brand" href="#" onClick={(event) => event.preventDefault()} aria-label="Foodie customer portal">
    <span className="brand-icon" aria-hidden="true">🍔</span><span className="brand-name">foodie<span>.</span></span><span className="brand-tag">CUSTOMER</span>
  </a>
}

function FoodDecorations() {
  return <div className="food-decorations" aria-hidden="true">{foods.map((food, index) =>
    <span key={food.className} className={`food-float ${food.className}`} style={{ '--delay': `${index * -2.1}s`, '--duration': `${13 + index * 1.3}s` }}>{food.emoji}</span>
  )}<i className="spark spark-one">✳</i><i className="spark spark-two">✦</i><i className="spark spark-three">✳</i><i className="trail trail-one" /><i className="trail trail-two" /></div>
}

function SplashScreen({ welcome }) {
  const greeting = welcome?.kind === 'guest'
    ? 'Welcome, guest! Let’s find something delicious.'
    : welcome?.name ? `Welcome back, ${welcome.name}!` : null
  return <main className="splash-screen" aria-label={greeting || 'Loading Foodie customer portal'}>
    <div className="splash-blob splash-blob-top" /><div className="splash-blob splash-blob-bottom" /><FoodDecorations />
    <div className="splash-content">
      <div className="splash-food-art" aria-hidden="true"><span className="splash-fry">🍟</span><span className="splash-pizza">🍕</span><div className="meal-stack"><span>🥤</span><span>🍔</span><span>🍟</span></div><span className="splash-burger">🍔</span><span className="splash-donut">🍩</span></div>
      <div className="splash-wordmark">foodie<span>.</span></div><span className="splash-tag">CUSTOMER</span><p className={greeting ? 'splash-welcome-message' : ''}>{welcome?.kind === 'customer' ? <>Welcome back, <strong>{welcome.name}</strong>!</> : greeting || 'GOOD FOOD. GREAT MOODS.'}</p>
      <div className="splash-loader" role="status" aria-label={greeting ? 'Preparing your Foodie home page' : 'Loading'}><span /><span /><span /></div><span className="loading-copy">{greeting ? 'Getting your foodie experience ready...' : 'Loading your foodie experience...'}</span>
    </div>
  </main>
}

function Feature({ icon, title, text }) {
  return <div className="feature"><span className="feature-icon" aria-hidden="true">{icon}</span><strong>{title}</strong><span>{text}</span></div>
}

function formatPhone(digits) {
  const first = digits.slice(0, 2)
  const middle = digits.slice(2, 5)
  const last = digits.slice(5, 9)
  return [first, middle, last].filter(Boolean).join(' ')
}

function passwordStrength(password) {
  if (!password) return { label: 'Use at least 8 characters, with a mix of letters and numbers.', level: 0 }
  const score = [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  return { label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score], level: score }
}

function normalizeCustomerPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.replace(/^94/, '').replace(/^0/, '').slice(-9)
}

function readLocalCustomerAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem('foodie.customer.accounts') || '[]')
    return Array.isArray(accounts) ? accounts : []
  } catch { return [] }
}

function App() {
  const [isHome, setIsHome] = useState(window.location.pathname === '/home')
  const isAuthRoute = !isHome && ['/', '/login', '/register'].includes(window.location.pathname)
  const [view, setView] = useState('splash')
  const [welcome, setWelcome] = useState(null)
  const [registering, setRegistering] = useState(window.location.pathname === '/register')
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const strength = passwordStrength(password)

  useEffect(() => {
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 2100
    const timer = window.setTimeout(() => setView('portal'), delay)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (view !== 'welcome') return undefined
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 550 : 2600
    const timer = window.setTimeout(() => setView('portal'), delay)
    return () => window.clearTimeout(timer)
  }, [view])

  function switchMode(nextMode) {
    setRegistering(nextMode)
    window.history.replaceState({}, '', nextMode ? '/register' : '/login')
    setError('')
    setNotice('')
    setPhone('')
    setPassword('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const data = new FormData(event.currentTarget)

    const passwordValue = String(data.get('password') || '')
    const identifier = String(data.get('email') || '').trim()
    if (registering) {
      const firstName = String(data.get('firstName') || '').trim()
      const lastName = String(data.get('lastName') || '').trim()
      const nic = String(data.get('nationalId') || '').trim()
      const email = String(data.get('email') || '').trim()
      const phoneDigits = normalizeCustomerPhone(data.get('phone'))
      const validNic = /^(\d{9}[vVxX]|\d{12})$/.test(nic)
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      const confirmPassword = String(data.get('confirmPassword') || '')
      if (!firstName || !lastName || !nic || !email || !phoneDigits || !data.get('address1') || !data.get('address2') || !data.get('address3') || !passwordValue || !confirmPassword) return setError('Please complete all fields to create your account.')
      if (!validNic) return setError('Enter a valid Sri Lankan NIC (9 digits and V/X, or 12 digits).')
      if (!validEmail) return setError('Enter a valid email address.')
      if (phoneDigits.length !== 9) return setError('Enter all 9 digits of your Sri Lankan phone number.')
      if (passwordValue.length < 8) return setError('Choose a password with at least 8 characters.')
      if (passwordValue !== confirmPassword) return setError('Your passwords do not match.')
      if (!data.get('terms')) return setError('Please agree to the terms and privacy policy.')
    } else {
      if (!identifier || !passwordValue) return setError('Please enter your email or phone number and password.')
    }
    setSubmitting(true)
    try {
      if (registering) {
        await api('/api/auth/register/CUSTOMER', { method: 'POST', body: {
          ...Object.fromEntries(data), phone: normalizeCustomerPhone(data.get('phone')), terms: Boolean(data.get('terms')),
        } })
      }
      const setupToken=new URLSearchParams(window.location.search).get('setupToken')
      if(setupToken)await api('/api/auth/setup-password',{method:'POST',body:{email:identifier,token:setupToken,password:passwordValue}})
      const account = await signIn(identifier, passwordValue, 'CUSTOMER')
      const customer = accountView(account)
      sessionStorage.setItem('foodie.customer', JSON.stringify(customer))
      setWelcome({ kind: 'customer', name: customer.displayName })
      window.history.replaceState({}, '', '/home')
      setIsHome(true)
      setView('welcome')
    } catch (error) { setError(error.message) } finally { setSubmitting(false) }
  }

  if (view === 'welcome') return <SplashScreen welcome={welcome} />

  if (isHome || !isAuthRoute) return <HomePage />

  if (view === 'splash') return <SplashScreen />

  return <main className="portal-page">
    <div className="gold-blob gold-blob-top" /><div className="gold-blob gold-blob-bottom" /><FoodDecorations />
    <header className="topbar"><Brand /><div className="topbar-prompt"><span>{registering ? 'Already a foodie?' : 'Already hungry?'}</span><button className="topbar-action" type="button" onClick={() => switchMode(!registering)}>{registering ? 'Sign in' : 'Create account'}</button></div></header>
    <div className="portal-layout">
      <section className="story-panel" aria-label="Foodie benefits">
        <div className="story-copy"><span className="eyebrow"><i /> YOUR NEXT FAVOURITE MEAL</span><h1>GOOD FOOD.<br /><span>GREAT MOODS.</span></h1><p>Discover local favourites and get delicious food delivered to your door.</p></div>
        <div className="features"><Feature icon="🏪" title="Local favourites" text="Explore top-rated restaurants near you" /><Feature icon="🛍️" title="Easy ordering" text="Find and order your favourite meals" /><Feature icon="🛵" title="Order tracking" text="Track your food in real time" /></div>
        <p className="handwritten">Food<br />Brings People<br />Together <span>♡</span></p>
      </section>
      <section className={`login-card${registering ? ' registration-card' : ''}`}>
        <div className="card-heading"><span className="form-label">CUSTOMER PORTAL</span><span className="secure-pill"><i /> SECURE {registering ? 'SIGN UP' : 'SIGN IN'}</span></div>
        <div className="form-intro"><h2>{registering ? <>CREATE<br />ACCOUNT<span>.</span></> : <>WELCOME<br />BACK<span>.</span></>}</h2><p>{registering ? 'Create your account and find something delicious.' : 'Sign in to find something delicious.'}</p></div>
        {error && <div className="form-message" role="alert">{error}</div>}{notice && <div className="form-message success-message" role="status">{notice}</div>}
        <form onSubmit={submit} noValidate>
          {registering ? <>
            <div className="name-fields">
              <label className="field"><span>First name</span><div className="input-wrap"><FieldIcon name="person" /><input name="firstName" placeholder="First name" autoComplete="given-name" required /></div></label>
              <label className="field"><span>Last name</span><div className="input-wrap"><FieldIcon name="person" /><input name="lastName" placeholder="Last name" autoComplete="family-name" required /></div></label>
            </div>
            <label className="field"><span>National ID (NIC)</span><div className="input-wrap"><FieldIcon name="id" /><input name="nationalId" placeholder="e.g. 200012345678 or 123456789V" autoComplete="off" maxLength="12" required /></div></label>
            <label className="field"><span>Email address</span><div className="input-wrap"><FieldIcon name="email" /><input name="email" defaultValue={new URLSearchParams(window.location.search).get('email') || ''} type="email" placeholder="you@example.com" autoComplete="email" required /></div></label>
            <label className="field"><span>Contact number</span><div className="input-wrap phone-wrap"><span className="country-prefix">+94</span><input name="phone" type="tel" inputMode="numeric" pattern="[0-9]{9}" placeholder="55 345 2345" autoComplete="tel-national" value={formatPhone(phone)} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 9))} required aria-label="Sri Lankan phone number, 9 digits" /></div><small className="field-help">Sri Lanka only. Enter 9 digits after +94.</small></label>
            <div className="address-fields"><label className="field"><span>Address line 1</span><div className="input-wrap"><FieldIcon name="home" /><input name="address1" placeholder="House or building" autoComplete="address-line1" required /></div></label><label className="field"><span>Address line 2</span><div className="input-wrap"><FieldIcon name="home" /><input name="address2" placeholder="Street or lane" autoComplete="address-line2" required /></div></label><label className="field"><span>Address line 3</span><div className="input-wrap"><FieldIcon name="location" /><input name="address3" placeholder="City or district" autoComplete="address-level2" required /></div></label></div>
            <label className="field"><span>Password</span><div className="input-wrap"><FieldIcon name="lock" /><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" autoComplete="new-password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div><div className="strength-note"><span className={`strength-meter strength-${strength.level}`}><i /><i /><i /><i /></span><span>{strength.label}</span></div></label>
            <label className="field"><span>Confirm password</span><div className="input-wrap"><FieldIcon name="lock" /><input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" autoComplete="new-password" required /></div></label>
            <label className="terms-row"><input name="terms" type="checkbox" required /><span>I agree to the terms and privacy policy.</span></label>
          </> : <>
            <label className="field"><span>Email or phone number</span><div className="input-wrap"><FieldIcon name="email" /><input name="email" defaultValue={new URLSearchParams(window.location.search).get('email') || ''} type="text" placeholder="you@example.com or 077 123 4567" autoComplete="username" required /></div></label>
            <label className="field"><span>Password</span><div className="input-wrap"><FieldIcon name="lock" /><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
            <div className="login-options"><label className="remember"><input type="checkbox" checked={keepSignedIn} onChange={(event) => setKeepSignedIn(event.target.checked)} /><span>Keep me signed in</span></label><button type="button" className="text-action" onClick={async()=>{try{const email=document.querySelector('input[name=email]')?.value;await api('/api/auth/recovery',{method:'POST',body:{email}});setNotice('If eligible, recovery instructions were queued. Email delivery requires configured SMTP.')}catch(error){setError(error.message)}}}>Forgot password?</button></div>
          </>}
          <button className="submit-button" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" /> Please wait…</> : <>{registering ? 'CREATE MY ACCOUNT' : 'SIGN IN TO FOODIE'} <span aria-hidden="true">→</span></>}</button>
        </form>
        <div className="login-divider"><span>{registering ? 'ALREADY A FOODIE?' : 'NEW TO FOODIE?'}</span></div>
        <button className="register-cta" type="button" onClick={() => switchMode(!registering)}>{registering ? 'Sign in to your account' : 'Create your account'}</button>
        {!registering && <div className="guest-action"><button className="guest-cta" type="button" onClick={() => { sessionStorage.removeItem('foodie.customer'); setWelcome({ kind: 'guest' }); window.history.replaceState({}, '', '/home?mode=guest'); setIsHome(true); setView('welcome') }}>Continue as guest <span aria-hidden="true">→</span></button><span>Browse and order without creating an account.</span></div>}
        <p className="card-footnote">Join thousands of food lovers and explore<br />the best food near you.</p>
      </section>
    </div>
  </main>
}

export default App