import { useState } from 'react'
import { api } from './api.js'
import './AccountCenter.css'


const banks = ['Bank of Ceylon', 'Commercial Bank', 'Hatton National Bank', "People's Bank", 'Nations Trust Bank', 'Sampath Bank', 'Seylan Bank', 'Amana Bank']
const bankCrops = {
  'bank of ceylon': { x: 168, y: 140, width: 210, height: 210 },
  'commercial bank': { x: 742, y: 153, width: 154, height: 118 },
  'hatton national bank': { x: 26, y: 515, width: 133, height: 137 },
  "people's bank": { x: 607, y: 488, width: 139, height: 135 },
  'nations trust bank': { x: 7, y: 784, width: 141, height: 137 },
  'sampath bank': { x: 590, y: 805, width: 158, height: 155 },
  'seylan bank': { x: 39, y: 1038, width: 136, height: 214 },
  'amana bank': { x: 980, y: 1047, width: 97, height: 104 },
}
const money = (value) => 'Rs. ' + Number(value || 0).toLocaleString('en-LK')
const sriLankanDigits = (value = '') => {
  let digits = String(value).replace(/\D/g, '')
  if (digits.startsWith('94')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}
const formatLocalPhone = (value = '') => {
  const digits = sriLankanDigits(value)
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean).join(' ')
}
function ContactIcon({ name }) {
  const paths = {
    person: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    email: <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></>,
    phone: <path d="M7.1 3.8 9.5 7a1.6 1.6 0 0 1-.1 2l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a1.6 1.6 0 0 1 2-.1l3.2 2.4a1.6 1.6 0 0 1 .5 1.9l-.7 1.5a2 2 0 0 1-2.1 1.1A18.5 18.5 0 0 1 2.6 6.1a2 2 0 0 1 1.1-2.1l1.5-.7a1.6 1.6 0 0 1 1.9.5Z" />,
    address: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  }
  return <svg className="customer-field-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
function AccountNavIcon({ name }) {
  const paths = {
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" /></>,
    orders: <><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M8.5 8h7m-7 4h7m-7 4h4" /></>,
    wallet: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18m-5 5h2" /></>,
    rewards: <><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15" /><path d="M12 6H7.8a2.3 2.3 0 1 1 2.3-2.3C10.1 5.1 12 6 12 6Zm0 0h4.2a2.3 2.3 0 1 0-2.3-2.3C13.9 5.1 12 6 12 6Z" /></>,
    merchant: <><path d="M14 4h6v6m-1-5-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
    driver: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="m6 17 4-8h4l4 8m-8-8-2-3H5m5 3 4 5h4m-4-5h4" /></>,
  }
  return <svg className="account-nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function BankLogo({ bank }) {
  const crop = bankCrops[bank.toLowerCase()]
  const scale = crop ? 28 / Math.max(crop.width, crop.height) : 0
  const style = crop ? {
    '--bank-sheet-size': (1080 * scale) + 'px ' + (1349 * scale) + 'px',
    '--bank-logo-position': '-' + (crop.x * scale) + 'px -' + (crop.y * scale) + 'px',
  } : undefined
  return <span className={'customer-bank-logo ' + (crop ? 'has-logo' : '')} style={style} aria-label={bank + ' logo'} role="img">{!crop && bank.slice(0, 1)}</span>
}

function BankPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return <div className="customer-bank-picker">
    <button type="button" className="customer-bank-trigger" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      {value ? <BankLogo bank={value} /> : <span className="customer-bank-empty">⌕</span>}
      <span><b>{value || 'Choose a bank'}</b><small>{value ? 'Sri Lankan bank' : 'Select from available banks'}</small></span><i>⌄</i>
    </button>
    {open && <div className="customer-bank-options" role="listbox" aria-label="Choose a bank">{banks.map((bank) => <button type="button" role="option" aria-selected={value === bank} key={bank} onClick={() => { onChange(bank); setOpen(false) }}><BankLogo bank={bank} /><span><b>{bank}</b><small>Bank account in Sri Lanka</small></span>{value === bank && <i>✓</i>}</button>)}</div>}
  </div>
}

export default function AccountCenter({ pointsBalance, policy = {}, section, customer, profile, onProfileChange, orders, onClose, theme, onThemeChange }) {
  const [active, setActive] = useState(section || 'settings')
  const [draft, setDraft] = useState(() => ({ ...profile }))
  const [notice, setNotice] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [cardForm, setCardForm] = useState({ bank: '', holder: '', last4: '', expiry: '' })
  const [cards,setCards]=useState([])
  const [photoError, setPhotoError] = useState('')
  const totalPoints = Number(pointsBalance || 0)
  const displayName = draft.name || customer.displayName || 'Foodie customer'

  async function saveProfile(event) {
    event.preventDefault()
    const phoneDigits = sriLankanDigits(draft.phone)
    if (phoneDigits && phoneDigits.length !== 9) {
      setNotice('Enter all 9 digits after +94, or leave the phone number blank.')
      return
    }
    try { await onProfileChange({ ...draft, name: draft.name.trim(), email: draft.email.trim(), phone: phoneDigits ? '+94 ' + formatLocalPhone(phoneDigits) : '' });setNotice('Your profile was saved.') } catch(error){setNotice(error.message)}
  }
  function uploadPhoto(event) {
    const image = event.target.files && event.target.files[0]
    if (!image) return
    if (!image.type.startsWith('image/')) { setPhotoError('Choose an image file.'); return }
    if (image.size > 1.5 * 1024 * 1024) { setPhotoError('Choose a photo smaller than 1.5 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setDraft({ ...draft, photo: String(reader.result) }); setPhotoError('') }
    reader.onerror = () => setPhotoError('This photo could not be opened.')
    reader.readAsDataURL(image)
  }
  async function savePassword(event) {
    event.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) { setNotice('The new passwords do not match.'); return }
    setPasswordForm({ current: '', next: '', confirm: '' })
    try {await api('/api/account/password',{method:'POST',body:{currentPassword:passwordForm.current,newPassword:passwordForm.next}});setNotice('Password changed. Please sign in again.');sessionStorage.removeItem('foodie.customer')} catch(error){setNotice(error.message)}
  }
  function addCard(event) {
    event.preventDefault()
    setNotice('Card storage and payments are unavailable until a real payment gateway is configured.')
  }
  function deleteCard(id) {
    const next = cards.filter((card) => card.id !== id)
    setCards(next)
    localStorage.setItem('foodie.customer.cards', JSON.stringify(next))
    setNotice('Card removed from this device.')
  }

  return <div className="account-center-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="account-center" role="dialog" aria-modal="true" aria-labelledby="account-center-title">
      <header className="account-center-header"><div><span className="account-center-kicker">FOODIE CUSTOMER</span><h2 id="account-center-title">Your account<span>.</span></h2></div><div className="account-center-header-actions"><div className="account-theme-toggle" role="group" aria-label="Color theme"><button type="button" className={theme === 'light' ? 'selected' : ''} aria-label="Use light mode" aria-pressed={theme === 'light'} onClick={() => onThemeChange('light')}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg></button><button type="button" className={theme === 'dark' ? 'selected' : ''} aria-label="Use dark mode" aria-pressed={theme === 'dark'} onClick={() => onThemeChange('dark')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8.7 8.7 0 0 1 8.8 3.5 8.8 8.8 0 1 0 20.5 15.2Z"/></svg></button></div><button className="account-center-close" type="button" aria-label="Close account" onClick={onClose}>×</button></div></header>
      <div className="account-center-body">
        <nav className="account-center-nav" aria-label="Account sections">
          <button className={active === 'settings' ? 'active' : ''} onClick={() => { setActive('settings'); setNotice('') }}><AccountNavIcon name="settings" /><span>Account settings</span></button>
          <button className={active === 'orders' ? 'active' : ''} onClick={() => { setActive('orders'); setNotice('') }}><AccountNavIcon name="orders" /><span>My orders</span></button>
          <button className={active === 'wallet' ? 'active' : ''} onClick={() => { setActive('wallet'); setNotice('') }}><AccountNavIcon name="wallet" /><span>Wallet</span></button>
          <button className={active === 'rewards' ? 'active' : ''} onClick={() => { setActive('rewards'); setNotice('') }}><AccountNavIcon name="rewards" /><span>Rewards</span></button>
          <div className="account-center-nav-separator" />
          <a href={import.meta.env.VITE_MERCHANT_PORTAL_URL || 'http://localhost:5173'} target="_blank" rel="noreferrer"><AccountNavIcon name="merchant" /><span>Want to be a merchant?</span></a>
          <button className={active === 'driver' ? 'active' : ''} onClick={() => { setActive('driver'); setNotice('') }}><AccountNavIcon name="driver" /><span>Want to be a driver?</span></button>
        </nav>
        <div className="account-center-content">
          {notice && <div className="account-center-notice" role="status">{notice}</div>}
          {active === 'settings' && <div className="account-section">
            <div className="account-section-heading"><div><span>PROFILE</span><h3>Account settings</h3><p>Update the details saved for your customer account.</p></div></div>
            <form className="customer-profile-form" onSubmit={saveProfile}>
              <div className="customer-photo-row"><div className="customer-photo">{draft.photo ? <img src={draft.photo} alt="Your profile" /> : <span>{displayName.slice(0, 1).toUpperCase()}</span>}</div><div><label className="customer-photo-button">Add profile picture<input type="file" accept="image/*" onChange={uploadPhoto} /></label><small>PNG, JPG or WEBP · up to 1.5 MB</small>{photoError && <small className="customer-form-error">{photoError}</small>}</div></div>
              <div className="customer-form-grid">
                <label><span className="customer-field-label"><ContactIcon name="person" />Full name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
                <label><span className="customer-field-label"><ContactIcon name="email" />Email address</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
                <label><span className="customer-field-label"><ContactIcon name="phone" />Telephone number</span><span className="customer-phone-input"><b>+94</b><input type="tel" inputMode="numeric" autoComplete="tel-national" value={formatLocalPhone(draft.phone)} onChange={(event) => setDraft({ ...draft, phone: sriLankanDigits(event.target.value) })} placeholder="55 456 7890" aria-label="Sri Lankan phone number, 9 digits after +94" /></span></label>
                <label><span className="customer-field-label"><ContactIcon name="address" />Address line 1</span><input value={draft.address1} onChange={(event) => setDraft({ ...draft, address1: event.target.value })} placeholder="House or building" /></label>
                <label><span className="customer-field-label"><ContactIcon name="address" />Address line 2</span><input value={draft.address2} onChange={(event) => setDraft({ ...draft, address2: event.target.value })} placeholder="Street or lane" /></label>
                <label><span className="customer-field-label"><ContactIcon name="address" />Address line 3</span><input value={draft.address3} onChange={(event) => setDraft({ ...draft, address3: event.target.value })} placeholder="City or district" /></label>
                <label><span className="customer-field-label"><ContactIcon name="address" />City</span><input value={draft.city || ''} onChange={(event) => setDraft({ ...draft, city: event.target.value })} autoComplete="address-level2" /></label>
                <label><span className="customer-field-label"><ContactIcon name="address" />Postal code</span><input value={draft.postalCode || ''} onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })} autoComplete="postal-code" /></label>
              </div>
              <button className="account-primary" type="submit">Save profile</button>
            </form>
            <form className="customer-password-form" onSubmit={savePassword}><h4>Change password</h4><div className="customer-form-grid"><label>Current password<input type="password" autoComplete="current-password" value={passwordForm.current} onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })} required /></label><label>New password<input type="password" minLength="8" autoComplete="new-password" value={passwordForm.next} onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })} required /></label><label>Confirm new password<input type="password" minLength="8" autoComplete="new-password" value={passwordForm.confirm} onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })} required /></label></div><button className="account-secondary" type="submit">Update password</button></form>
          </div>}
          {active === 'orders' && <div className="account-section"><div className="account-section-heading"><div><span>HISTORY</span><h3>My orders</h3><p>Order ID, items, charges, and totals from your account.</p></div></div>{orders.length ? <div className="customer-order-list">{[...orders].reverse().map((order) => <article className="customer-order" key={order.id}><div className="customer-order-head"><div><small>ORDER ID</small><strong>{order.id}</strong></div><span>{new Date(order.createdAt).toLocaleString('en-LK')}</span></div><div className="customer-order-items"><b>Order items</b>{order.items.map((item) => <span key={item.id}>{item.quantity} × {item.name}</span>)}</div><div className="customer-order-totals"><span>Additional charges <b>{money(order.additionalCharges)}</b></span><span>Net total <b>{money(order.netTotal)}</b></span><span>Reward stars <b>★ {order.points || 0}</b></span></div></article>)}</div> : <div className="account-empty"><span>🧾</span><h4>No orders yet</h4><p>Your orders will appear here after you place one.</p></div>}</div>}
          {active === 'wallet' && <div className="account-section"><div className="account-section-heading"><div><span>PAYMENT METHODS</span><h3>Wallet</h3><p>Manage saved card summaries on this device.</p></div></div>
            <div className="customer-card-list">{cards.map((card) => <article className="customer-saved-card" key={card.id}><BankLogo bank={card.bank} /><div><strong>{card.bank}</strong><span>{card.holder} · •••• {card.last4}</span><small>Expires {card.expiry}</small></div><button type="button" aria-label={'Delete card ending ' + card.last4} onClick={() => deleteCard(card.id)}>Delete</button></article>)}{!cards.length && <div className="customer-wallet-empty">No cards added yet.</div>}</div>
            <form className="customer-card-form" onSubmit={addCard}><h4>Add a card</h4><BankPicker value={cardForm.bank} onChange={(bank) => setCardForm({ ...cardForm, bank })} /><div className="customer-form-grid"><label>Cardholder name<input autoComplete="cc-name" value={cardForm.holder} onChange={(event) => setCardForm({ ...cardForm, holder: event.target.value })} required /></label><label>Last four digits<input inputMode="numeric" autoComplete="off" value={cardForm.last4} onChange={(event) => setCardForm({ ...cardForm, last4: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="4242" required /></label><label>Expiry (MM/YY)<input autoComplete="cc-exp" value={cardForm.expiry} onChange={(event) => setCardForm({ ...cardForm, expiry: event.target.value.split("").filter((char) => (char >= "0" && char <= "9") || char === "/").join("").slice(0, 5) })} placeholder="MM/YY" required /></label></div><p className="customer-wallet-note">Demo only: this account stores a masked card summary. Full card numbers and security codes are never requested. No payment is processed.</p><button className="account-primary" type="submit">Save card summary</button></form>
          </div>}
          {active === 'rewards' && <div className="account-section"><div className="account-section-heading"><div><span>FOODIE REWARDS</span><h3>Reward stars</h3><p>Earn stars after your order is fulfilled.</p></div></div><div className="reward-balance"><span>🎁</span><div><b>{totalPoints}</b><small>stars available</small></div></div><div className="reward-rules"><h4>How stars are earned</h4><p><span>Under Rs. {Number(policy.reward_tier_one || 0).toLocaleString()}</span><b>{policy.reward_points_base ?? '—'} stars</b></p><p><span>Rs. {Number(policy.reward_tier_one || 0).toLocaleString()} – {Number(policy.reward_tier_two || 0).toLocaleString()}</span><b>{policy.reward_points_one ?? '—'} stars</b></p><p><span>Rs. {Number(policy.reward_tier_two || 0).toLocaleString()} – {Number(policy.reward_tier_three || 0).toLocaleString()}</span><b>{policy.reward_points_two ?? '—'} stars</b></p><p><span>Rs. {Number(policy.reward_tier_three || 0).toLocaleString()} and above</span><b>{policy.reward_points_three ?? '—'} stars</b></p><small>Stars are calculated from the food subtotal, before additional charges.</small></div></div>}
          {active === 'driver' && <div className="account-section"><div className="account-section-heading"><div><span>DRIVER PORTAL</span><h3>Deliver with Foodie</h3><p>The driver portal is not available yet.</p></div></div><div className="account-empty"><span>🛵</span><h4>Coming soon</h4><p>We’ll open the driver application when the driver portal is ready.</p></div></div>}
        </div>
      </div>
    </section>
  </div>
}
