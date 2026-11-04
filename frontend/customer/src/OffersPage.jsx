import { useEffect, useMemo, useRef, useState } from 'react'
import { loadCustomerOffers } from './offersData.js'
import './OffersPage.css'

const categories = ['All Offers', 'Pizza', 'Burgers', 'Noodles', 'Rice & Curry', 'Desserts', 'Beverages', 'Others']
const categoryIcons = { 'All Offers': '♧', Pizza: '🍕', Burgers: '🍔', Noodles: '🍜', 'Rice & Curry': '🍛', Desserts: '🍰', Beverages: '🧋', Others: '💝' }
const sortOptions = [
  { value: 'latest', label: 'Latest Offers' },
  { value: 'ending', label: 'Ending Soon' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'price-low', label: 'Price: Low to High' },
]
const money = (value) => value == null ? '' : `Rs. ${Number(value).toLocaleString('en-LK')}`

function OfferSort({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const selected = sortOptions.find((option) => option.value === value) || sortOptions[0]

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return <div className="offer-sort" ref={rootRef}>
    <button className="offer-sort-trigger" ref={triggerRef} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`Sort offers: ${selected.label}`} onClick={() => setOpen((value) => !value)}>
      <span className="offer-sort-symbol" aria-hidden="true">↕</span><span>{selected.label}</span><span className={'offer-sort-chevron' + (open ? ' is-open' : '')} aria-hidden="true">⌄</span>
    </button>
    {open && <div className="offer-sort-menu" role="listbox" aria-label="Sort offers">
      {sortOptions.map((option) => <button className="offer-sort-option" key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => { onChange(option.value); setOpen(false); triggerRef.current?.focus() }}>
        <span>{option.label}</span><span className="offer-sort-check" aria-hidden="true">{value === option.value ? '✓' : ''}</span>
      </button>)}
    </div>}
  </div>
}

function Countdown({ expiresAt }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()))
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now())), 60_000)
    return () => window.clearInterval(timer)
  }, [expiresAt])
  if (!remaining) return null
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  return <span className="offer-countdown">◷ &nbsp;{days}d {hours}h {minutes}m</span>
}

function OfferDialog({ offer, onClose }) {
  const [notice, setNotice] = useState('')
  async function copyCode() {
    if (!offer.code) return
    try { await navigator.clipboard.writeText(offer.code); setNotice(`${offer.code} copied. Enter the code at checkout; the server checks eligibility.`) }
    catch { setNotice(`Offer code: ${offer.code}. Enter the code at checkout; the server checks eligibility.`) }
  }
  return <div className="offer-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="offer-modal" role="dialog" aria-modal="true" aria-labelledby="offer-modal-title">
      <button type="button" className="offer-modal-close" onClick={onClose} aria-label="Close offer details">×</button>
      <img src={offer.image} alt={offer.itemName} />
      <div className="offer-modal-copy"><span className="offer-modal-kicker">{offer.restaurantName} · {offer.cuisine}</span><h2 id="offer-modal-title">{offer.title}</h2><p>{offer.description}</p><dl><div><dt>Offer</dt><dd>{offer.offerType}</dd></div><div><dt>Eligible item</dt><dd>{offer.itemName}</dd></div>{offer.minimumOrder && <div><dt>Minimum order</dt><dd>{money(offer.minimumOrder)}</dd></div>}{offer.expiresAt && <div><dt>Valid until</dt><dd>{new Date(offer.expiresAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>}</dl>
        <div className="offer-conditions"><strong>Conditions</strong><p>{offer.conditions || 'See the restaurant for offer conditions.'}</p></div>
        {offer.code && <div className="offer-code-row"><span><small>OFFER CODE</small><b>{offer.code}</b></span><button type="button" onClick={copyCode}>Copy code</button></div>}
        {offer.code && <p className="offer-copy-notice">Copy this code for checkout. Eligibility and discounts are validated by the server.</p>}
        <a className="offer-menu-link" href={`/restaurants?search=${encodeURIComponent(offer.restaurantName)}`}>Browse {offer.restaurantName} menu <span>→</span></a>
        {notice && <p role="status" className="offer-copy-notice">{notice}</p>}
      </div>
    </section>
  </div>
}

export default function OffersPage() {
  const [result, setResult] = useState({ source: 'loading', offers: [] })
  const [category, setCategory] = useState('All Offers')
  const [sort, setSort] = useState('latest')
  const [selectedOffer, setSelectedOffer] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    loadCustomerOffers(controller.signal).then(setResult).catch(()=>setResult({source:'unavailable',offers:[]}))
    return () => controller.abort()
  }, [])
  const shownOffers = useMemo(() => {
    const filtered = result.offers.filter((offer) => category === 'All Offers' || offer.category.toLowerCase() === category.toLowerCase())
    if (sort === 'price-low') filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    if (sort === 'discount') filtered.sort((a, b) => (b.discountValue ?? 0) - (a.discountValue ?? 0))
    if (sort === 'ending') filtered.sort((a, b) => (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) - (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity))
    return filtered
  }, [result.offers, category, sort])

  return <section className="offers-page" aria-labelledby="offers-title">
    <header className="offers-hero"><div className="offers-hero-copy"><span>EXCLUSIVE OFFERS</span><h1 id="offers-title">Great Food, <em>Greater Savings!</em></h1><p>Discover special offers from your favourite restaurants.</p></div><div className="offers-hero-tag" aria-hidden="true">%</div><div className="offers-hero-food" role="img" aria-label="Freshly baked pizza" /></header>
    {result.source === 'preview' && <p className="offers-preview-note"><span aria-hidden="true">ⓘ</span> Preview offers · Sample content only. These are not live merchant offers.</p>}
    <div className="offers-toolbar"><div className="offer-category-list" role="group" aria-label="Filter offers by category">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={category === item ? 'active' : ''} aria-pressed={category === item}><span aria-hidden="true">{categoryIcons[item]}</span>{item}</button>)}</div><OfferSort value={sort} onChange={setSort} /></div>
    {result.source === 'loading' ? <p className="offers-empty">Loading offers…</p> : shownOffers.length ? <div className="offer-grid">{shownOffers.map((offer) => <article className="offer-product-card" key={offer.id}>
      <div className="offer-photo-wrap"><img className="offer-photo" src={offer.image || '/icons.svg'} alt={offer.itemName} loading="lazy" /><span className="offer-badge">{offer.offerType}</span>{offer.expiresAt && <Countdown expiresAt={offer.expiresAt} />}</div>
      <div className="offer-product-copy"><div className="offer-restaurant"><span className="offer-restaurant-avatar">{categoryIcons[offer.category] || '🍽️'}</span><span className="offer-restaurant-info"><b>{offer.restaurantName} <i>★</i> <small>{offer.restaurantRating}</small></b><small>{offer.cuisine}</small></span></div><h2>{offer.title}</h2><p>{offer.description}</p><div className="offer-card-bottom"><span>{offer.price != null ? <><b>{money(offer.price)}</b>{offer.originalPrice != null && <del>{money(offer.originalPrice)}</del>}</> : offer.minimumOrder ? <b className="offer-minimum">Min. Order: {money(offer.minimumOrder)}</b> : <b>{offer.offerType}</b>}</span><button type="button" onClick={() => setSelectedOffer(offer)}>View Offer <b aria-hidden="true">→</b></button></div></div>
    </article>)}</div> : <div className="offers-empty"><strong>No offers in this category yet.</strong><span>Choose another category to see available offers.</span></div>}
    {selectedOffer && <OfferDialog offer={selectedOffer} onClose={() => setSelectedOffer(null)} />}
  </section>
}
