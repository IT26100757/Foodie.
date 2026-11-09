import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { checkoutRequest } from './customerApi.js'
import './CheckoutPage.css'

const emptyAddress = { address1: '', address2: '', address3: '', city: '', postalCode: '' }
const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK')}`
function sriLankanPhoneDigits(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('94') && digits.length > 9) digits = digits.slice(2)
  else if (digits.startsWith('0') && digits.length > 9) digits = digits.slice(1)
  return digits.slice(0, 9)
}

function loadCards() { return [] }

function Steps({ step }) {
  return <div className="checkout-steps" aria-label={`Checkout step ${step} of 3`}>
    {['Delivery Details', 'Payment', 'Review'].map((label, index) => {
      const number = index + 1
      return <div className={`checkout-step ${step === number ? 'active' : ''} ${step > number ? 'complete' : ''}`} key={label}>
        <span>{step > number ? '✓' : number}</span><b>{label}</b>
      </div>
    })}
  </div>
}

function Field({ label, value, onChange, required = false, type = 'text', placeholder = '', autoComplete, inputMode, maxLength }) {
  return <label className="checkout-field"><span>{label}{required && <b> *</b>}</span><input value={value || ''} onChange={(event) => onChange(event.target.value)} type={type} inputMode={inputMode} maxLength={maxLength} placeholder={placeholder} required={required} autoComplete={autoComplete} /></label>
}

function CardSummary({ card, selected, onSelect }) {
  return <button type="button" className={`checkout-saved-card ${selected ? 'selected' : ''}`} onClick={onSelect} aria-pressed={selected}>
    <span className="checkout-radio" />
    <span className="checkout-card-brand">{(card.bank || 'CARD').slice(0, 4).toUpperCase()}</span>
    <span className="checkout-card-copy"><b>{card.bank || 'Saved card'} ···· {card.last4}</b><small>{card.holder || 'Cardholder'} · Expires {card.expiry || '—'}</small></span>
    <span className="checkout-demo-tag">UNAVAILABLE</span>
  </button>
}

export default function CheckoutPage({ cart, profile, onProfileChange, isGuest, pointsBalance, offer, onComplete, onOpenRewards }) {
  const [step, setStep] = useState(1)
  const [draftDetails, setDetails] = useState(() => ({
    name: profile.name || '', phone: sriLankanPhoneDigits(profile.phone), email: profile.email || '',
    ...emptyAddress, address1: profile.address1 || '', address2: profile.address2 || '', address3: profile.address3 || '',
    city: profile.city || '', postalCode: profile.postalCode || '',
  }))
  const details = useMemo(() => ({
    ...draftDetails,
    name: draftDetails.name || profile.name || '',
    email: draftDetails.email || profile.email || '',
    phone: draftDetails.phone || sriLankanPhoneDigits(profile.phone),
    address1: draftDetails.address1 || profile.address1 || '',
    address2: draftDetails.address2 || profile.address2 || '',
    address3: draftDetails.address3 || profile.address3 || '',
    city: draftDetails.city || profile.city || '',
    postalCode: draftDetails.postalCode || profile.postalCode || '',
  }), [draftDetails, profile.name, profile.email, profile.phone, profile.address1, profile.address2, profile.address3, profile.city, profile.postalCode])
  const [saveAddress, setSaveAddress] = useState(!isGuest)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [redeemPoints, setRedeemPoints] = useState(false)
  const [cards] = useState(() => isGuest ? [] : loadCards())
  const [selectedCardId, setSelectedCardId] = useState(() => isGuest ? '' : loadCards()[0]?.id || '')
  const [newCardId] = useState('')
  const [showNewCard, setShowNewCard] = useState(false)
  const [newCard, setNewCard] = useState({ bank: 'Visa', holder: '', last4: '', expiry: '' })
  const [saveCard, setSaveCard] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [quote, setQuote] = useState(null)
  const [policies,setPolicies]=useState({})
  useEffect(()=>{api('/api/customer/policies').then(setPolicies).catch(error=>setError(error.message))},[])
  const [busy, setBusy] = useState(false)
  const [requestKey] = useState(() => crypto.randomUUID())
  useEffect(() => {
    let active=true
    const timer=setTimeout(async()=>{
      try { const value=await api('/api/guest/orders/quote',{method:'POST',body:checkoutRequest(cart,{...details,address1:details.address1 || 'Quote'},paymentMethod==='cod'?'CASH':'CARD',offer,redeemPoints)});if(active){setQuote(value);setError('')} } catch(error){if(active){setQuote(null);setError(error.message)}}
    },250)
    return ()=>{active=false;clearTimeout(timer)}
  },[cart,details,paymentMethod,offer,redeemPoints])

  const subtotal = useMemo(() => cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0), [cart])
  const deliveryFee = Number(quote?.deliveryFee || 0)
  const offerDiscount = Number(quote?.offerDiscount || 0)
  const pointsEligible = !isGuest && pointsBalance >= Number(policies.reward_minimum_points || Infinity)
  const pointsDiscount = Number(quote?.pointsDiscount || 0)
  const total = Number(quote?.total || 0)
  const earnedPoints = Number(quote?.points || 0)
  const remainingPoints = Math.max(0, pointsBalance - (redeemPoints ? Number(policies.reward_minimum_points || 0) : 0)) + earnedPoints
  const selectedCard = cards.find((card) => card.id === selectedCardId)

  function changeDetail(key, value) { setDetails((current) => ({ ...current, [key]: value })) }
  function saveNewCard(event) {
    event.preventDefault()
    setError('Card storage and payments are unavailable until a real payment gateway is configured.'); return
  }
  function continueFromDelivery(event) {
    event.preventDefault()
    if (isGuest && (!details.name.trim() || !details.phone.trim() || !details.email.trim())) { setError('Enter your name, phone number, and email to continue.'); return }
    if (sriLankanPhoneDigits(details.phone).length !== 9) { setError('Enter all 9 digits of your Sri Lankan phone number.'); return }
    if (!details.address1.trim() || !details.city.trim() || !details.postalCode.trim()) { setError('Enter address line 1, city, and postal code to continue.'); return }
    setError('')
    setStep(2)
  }
  function continueToReview() {
    if (paymentMethod === 'card' && !selectedCard && !showNewCard) { setShowNewCard(true); setError('Card payments are unavailable. Choose cash on delivery to continue.'); setStep(3); return }
    setStep(3)
    setError('')
  }
  async function completeOrder() {
    if(busy)return
    if(paymentMethod==='card'){setError('Card payments are unavailable until a real payment gateway is configured. No payment was processed.');return}
    if(!quote){setError('Wait for a valid server price quote before placing your order.');return}
    setBusy(true)
    try {
    const normalizedPhone = details.phone.trim().startsWith('+94') ? details.phone.trim() : `+94 ${details.phone.trim()}`
    const address = { address1: details.address1.trim(), address2: details.address2.trim(), address3: details.address3.trim(), city: details.city.trim(), postalCode: details.postalCode.trim() }
    if (!isGuest && saveAddress) await onProfileChange({ ...profile, name: details.name.trim(), phone: normalizedPhone, email: details.email.trim(), ...address })
    const order = {
      items: cart.map((item) => ({ ...item })), subtotal, additionalCharges: deliveryFee,
      discount: offerDiscount + pointsDiscount, offerDiscount, redeemedPoints: redeemPoints ? Number(policies.reward_minimum_points || 0) : 0,
      netTotal: total, points: earnedPoints, address, deliveryAddress: address, customer: { name: details.name.trim(), phone: normalizedPhone, email: details.email.trim() },
      total, currency: 'LKR', date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }), status: 'pending',
      paymentMethod: paymentMethod === 'card' ? 'Card' : 'Cash on delivery',
      paymentType: paymentMethod === 'card' ? 'Card' : 'Cash on delivery',
      paymentStatus: paymentMethod === 'card' ? 'Unavailable' : 'Pay on delivery',
      cardSummary: paymentMethod === 'card' && selectedCard ? { bank: selectedCard.bank, last4: selectedCard.last4 } : null,
    }
    const placed = await onComplete(order, requestKey)
    setConfirmation(placed)
    setStep(4)
    } catch(error) { setError(error.message) } finally { setBusy(false) }
  }

  if (confirmation) return <section className="checkout-page checkout-complete">
    <div className="checkout-success-card"><span className="checkout-success-mark">✓</span><span className="checkout-kicker">ORDER {confirmation.id}</span><h1>Order placed <em>successfully!</em></h1>
      <p>Your order has been saved and sent to the restaurant. {'Payment is due when your order arrives.'}</p>
      <div className="checkout-earned"><span>⭐</span><div><b>Earned points: {confirmation.points}</b><small>Points are credited after fulfilment.</small></div><button type="button" onClick={onOpenRewards}>View my points</button></div>
      <a className="checkout-primary" href="/track-order">Track My Order <span>→</span></a><small className="checkout-delivery-estimate">Delivery updates will appear in order tracking.</small>
    </div>
  </section>

  return <section className="checkout-page">
    <a className="checkout-back" href="/cart" aria-label="Back to cart">←</a><div className="checkout-heading"><span className="checkout-kicker">FOODIE CHECKOUT</span><h1>Checkout</h1><p>Please provide your delivery details and payment method.</p></div>
    <Steps step={step} />
    {error && <p className="checkout-error" role="alert">{error}</p>}
    {step === 1 && <form className="checkout-panel checkout-delivery-panel" onSubmit={continueFromDelivery}>
      <section className="checkout-section"><h2><span>♟</span>Customer Information</h2><div className="checkout-fields"><Field label="Full Name" value={details.name} onChange={(value) => changeDetail('name', value)} required autoComplete="name" /><Field label="Phone Number" value={details.phone} onChange={(value) => changeDetail('phone', sriLankanPhoneDigits(value))} required type="tel" inputMode="numeric" maxLength={9} autoComplete="tel-national" placeholder="771234567" /><Field label="Email Address" value={details.email} onChange={(value) => changeDetail('email', value)} required type="email" autoComplete="email" /></div></section>
      <section className="checkout-section"><div className="checkout-section-title"><h2><span>⌖</span>Delivery Address</h2>{!isGuest && profile.address1 && <button type="button" className="checkout-use-saved" onClick={() => setDetails((current) => ({ ...current, address1: profile.address1 || '', address2: profile.address2 || '', address3: profile.address3 || '', city: profile.city || '', postalCode: profile.postalCode || '' }))}>Use Saved Address</button>}</div><div className="checkout-fields"><Field label="Address Line 1" value={details.address1} onChange={(value) => changeDetail('address1', value)} required autoComplete="address-line1" placeholder="House or building" /><Field label="Address Line 2 (Optional)" value={details.address2} onChange={(value) => changeDetail('address2', value)} autoComplete="address-line2" placeholder="Street or apartment" /><Field label="Address Line 3 (Optional)" value={details.address3} onChange={(value) => changeDetail('address3', value)} placeholder="Area or landmark" /><Field label="City" value={details.city} onChange={(value) => changeDetail('city', value)} required autoComplete="address-level2" /><Field label="Postal Code" value={details.postalCode} onChange={(value) => changeDetail('postalCode', value)} required autoComplete="postal-code" /></div>
        {!isGuest && <label className="checkout-checkbox"><input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />Save this address for future orders</label>}
      </section><button className="checkout-primary" type="submit">Continue to Payment <span>→</span></button>
    </form>}
    {step === 2 && <div className="checkout-step-layout">
      <div className="checkout-step-main"><section className="checkout-panel checkout-order-panel"><h2>▣ &nbsp; Order Summary <a href="/cart">View items ({cart.reduce((n, item) => n + Number(item.quantity || 0), 0)}) ›</a></h2>{cart.map((item) => <article className="checkout-item" key={item.id}>{item.image ? <img src={item.image} alt="" /> : <div className="checkout-item-fallback">🍽️</div>}<div><b>{item.name}</b><small>{item.restaurant || 'Foodie'}{Object.entries(item.variants || {}).map(([name, value]) => ` · ${name}: ${value}`).join('')}</small></div><span>× {item.quantity}</span><strong>{money(Number(item.price) * Number(item.quantity))}</strong></article>)}<div className="checkout-totals"><p><span>Items Subtotal</span><b>{money(subtotal)}</b></p><p><span>Delivery Fee</span><b>{money(deliveryFee)}</b></p>{offerDiscount > 0 && <p className="checkout-discount"><span>Discount ({offer?.code || 'Offer'})</span><b>− {money(offerDiscount)}</b></p>}{pointsDiscount > 0 && <p className="checkout-discount"><span>Star Points Discount (10% · 20 points)</span><b>− {money(pointsDiscount)}</b></p>}<p className="checkout-total"><b>Total Amount</b><b>{money(total)}</b></p></div></section>
        {!isGuest && <section className="checkout-panel checkout-points"><h2><span>⭐</span>Your Star Points <b>{pointsBalance} points</b></h2>{pointsEligible ? <><p>You have <strong>{pointsBalance} star points</strong></p><label className="checkout-points-toggle"><span>Use <b>{Number(policies.reward_minimum_points || 0)} points</b> to get an extra {Number(policies.reward_discount_rate || 0)*100}% discount ({money(pointsDiscount)}).</span><input type="checkbox" checked={redeemPoints} onChange={(event) => setRedeemPoints(event.target.checked)} /><i /></label>{redeemPoints && <div className="checkout-points-remaining"><b>▤ &nbsp;{Number(policies.reward_minimum_points || 0)} points will be used</b><span>Remaining after this order: {remainingPoints - earnedPoints} points</span></div>}</> : <p>{pointsBalance} points available. Earn {Math.max(0,Number(policies.reward_minimum_points || 0)-pointsBalance)} more to unlock redemption.</p>}</section>}
        <section className="checkout-panel checkout-method"><h2>▣ &nbsp; Payment Method</h2><button type="button" className={`checkout-method-option ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}><span className="checkout-radio"/><span><b>Credit / Debit Card</b><small>Unavailable until a payment gateway is configured</small></span><strong>VISA &nbsp; ●●</strong></button><button type="button" className={`checkout-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}><span className="checkout-radio"/><span><b>Cash on Delivery</b><small>Pay when you receive your order</small></span><strong>💵</strong></button><button type="button" className="checkout-primary" onClick={continueToReview}>Proceed to Review <span>→</span></button></section>
      </div><aside className="checkout-side-note"><span>DELIVERY TO</span><b>{details.name}</b><p>{[details.address1, details.address2, details.address3, details.city, details.postalCode].filter(Boolean).join(', ')}</p><button type="button" onClick={() => setStep(1)}>Edit delivery details</button><small>Card payments unavailable · no charge will be made.</small></aside>
    </div>}
    {step === 3 && <div className="checkout-review-grid"><section className="checkout-panel checkout-review-card"><div className="checkout-review-heading"><span className="checkout-card-icon">▣</span><div><h2>{paymentMethod === 'card' ? 'Card Details' : 'Review Order'}</h2><p>{paymentMethod === 'card' ? 'Card payments are unavailable until a gateway is configured.' : 'Confirm your cash on delivery order.'}</p></div></div>
      {paymentMethod === 'card' && <><div className="checkout-saved-heading"><b>Saved Cards</b>{!isGuest && <button type="button" onClick={() => { setShowNewCard((value) => !value); setError('') }}>＋ Add New Card</button>}</div>{!isGuest && cards.map((card) => <CardSummary key={card.id} card={card} selected={selectedCardId === card.id && !showNewCard} onSelect={() => { setSelectedCardId(card.id); setShowNewCard(false); setError('') }} />)}{!isGuest && !cards.length && !showNewCard && <p className="checkout-no-cards">Card storage is unavailable until a gateway is configured.</p>}
        {!isGuest && selectedCardId === newCardId && Boolean(newCardId) && !showNewCard && <label className="checkout-checkbox"><input type="checkbox" checked={saveCard} onChange={(event) => setSaveCard(event.target.checked)} />Save this card summary to my account</label>}
        {(showNewCard || isGuest) && <form className="checkout-new-card" onSubmit={saveNewCard}><h3>▣ &nbsp; {isGuest ? 'Card Details' : 'Add a New Card'}</h3><p className="checkout-demo-notice">Card payments and storage are unavailable. Do not enter payment details. No payment is processed.</p><div className="checkout-fields"><label className="checkout-field"><span>Card type</span><select value={newCard.bank} onChange={(event) => setNewCard((card) => ({ ...card, bank: event.target.value }))}><option>Visa</option><option>Mastercard</option><option>American Express</option><option>Other</option></select></label><Field label="Cardholder Name" value={newCard.holder || details.name} onChange={(value) => setNewCard((card) => ({ ...card, holder: value }))} required /><Field label="Last Four Digits" value={newCard.last4} onChange={(value) => setNewCard((card) => ({ ...card, last4: value.replace(/\D/g, '').slice(0, 4) }))} required placeholder="Last four digits" /><Field label="Expiry Date" value={newCard.expiry} onChange={(value) => setNewCard((card) => ({ ...card, expiry: value }))} required placeholder="MM/YY" /></div><button className="checkout-secondary" type="submit">Card gateway unavailable</button></form>}
      </>}
      <div className="checkout-review-totals"><span>Total amount</span><b>{money(total)}</b></div><button className="checkout-primary" type="button" onClick={completeOrder} disabled={busy}>{paymentMethod === 'card' ? `Card payments unavailable · ${money(total)}` : `Place cash on delivery order · ${money(total)}`} <span>→</span></button><small className="checkout-safe-note">🔒 Card gateway unavailable. No payment is processed. Do not enter card details.</small>
      <button type="button" className="checkout-text-back" onClick={() => setStep(2)}>← Back to payment options</button></section>
      <aside className="checkout-panel checkout-review-summary"><h2>Order Summary</h2>{cart.map((item) => <p key={item.id}><span>{item.quantity} × {item.name}</span><b>{money(item.price * item.quantity)}</b></p>)}<hr/><p><span>Subtotal</span><b>{money(subtotal)}</b></p><p><span>Delivery fee</span><b>{money(deliveryFee)}</b></p>{offerDiscount > 0 && <p className="checkout-discount"><span>Offer discount</span><b>− {money(offerDiscount)}</b></p>}{pointsDiscount > 0 && <p className="checkout-discount"><span>Star points</span><b>− {money(pointsDiscount)}</b></p>}<p className="checkout-total"><b>Total</b><b>{money(total)}</b></p></aside>
    </div>}
  </section>
}
