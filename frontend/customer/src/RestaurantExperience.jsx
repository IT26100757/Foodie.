import { useEffect, useState } from 'react'
import { api } from './api.js'
import { checkoutRequest, restaurantMenu } from './customerApi.js'
import './RestaurantExperience.css'

const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-LK')}`
const itemBasePrice = (item) => {
  const sizes = item.sizesEnabled && item.sizes ? Object.values(item.sizes).filter((size) => size.selected).map((size) => Number(size.price)).filter(Number.isFinite) : []
  return sizes.length ? Math.min(...sizes) : Number(item.price) || 0
}
const merchantVariants = (item) => {
  if (Array.isArray(item.variants)) return item.variants
  if (item.sizesEnabled && item.sizes) {
    const sizes = Object.entries(item.sizes).filter(([, value]) => value.selected)
    const basePrice = sizes.length ? Math.min(...sizes.map(([, value]) => Number(value.price) || 0)) : 0
    return [{ name: 'Size', required: true, options: sizes.map(([name, value]) => ({ name, price: Math.max(0, (Number(value.price) || 0) - basePrice) })) }]
  }
  return []
}
const merchantAddOns = (item) => item.addOns || item.addons || []

function adaptMerchantItem(item, index, restaurantName) {
  const variants = merchantVariants(item)
  const addOns = merchantAddOns(item)
  return { ...item, id: `merchant:${item.id ?? index}`, menuItemId:item.id, name: item.name || 'Menu item', description: item.description || '', image: item.image || item.imageUrl || '', category: item.category || 'Popular', price: itemBasePrice(item), rating: item.rating, variants, addOns, restaurant: item.restaurant || item.merchantName || restaurantName }
}

function ItemDetail({ item, restaurant, onClose, onAdd }) {
  const [variantChoice, setVariantChoice] = useState(() => Object.fromEntries(item.variants.map((variant) => [variant.name, variant.options[0]?.name || ''])))
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [notice, setNotice] = useState('')
  const optionsPrice = item.variants.reduce((sum, variant) => sum + Number(variant.options.find((option) => option.name === variantChoice[variant.name])?.price || 0), 0)
  const addOnsPrice = item.addOns.filter((addOn) => selectedAddOns.includes(addOn.name)).reduce((sum, addOn) => sum + Number(addOn.price || 0), 0)
  const unitPrice = item.price + optionsPrice + addOnsPrice

  function submit() {
    const missing = item.variants.find((variant) => variant.required && !variantChoice[variant.name])
    if (missing) { setNotice(`Please select ${missing.name.toLowerCase()}.`); return }
    onAdd({ menuItemId:item.menuItemId, restaurantId:restaurant.id, size:variantChoice.Size || null, id: `${item.id}:${JSON.stringify([variantChoice, [...selectedAddOns].sort()])}`, name: item.name, restaurant: restaurant.name, image: item.image, price: unitPrice, quantity, variants: variantChoice, addOns: item.addOns.filter((addOn) => selectedAddOns.includes(addOn.name)).map((addOn) => addOn.name), specialInstructions: '' })
    onClose()
  }

  return <div className="experience-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="item-dialog" role="dialog" aria-modal="true" aria-labelledby="item-detail-title">
    <button className="experience-close" type="button" aria-label="Close item details" onClick={onClose}>×</button>
    <img className="item-dialog-image" src={item.image} alt={item.name} />
    <div className="item-dialog-content"><div className="item-dialog-heading"><span>{item.category} · {restaurant.name}</span><h2 id="item-detail-title">{item.name}</h2><div><b>★ {item.rating!=null?Number(item.rating).toFixed(1):restaurant.rating?restaurant.rating.split(' ')[0]:'Not rated'}</b><strong>{money(item.price)}</strong></div></div>
      <p className="item-description">{item.description || 'Freshly prepared by the restaurant using quality ingredients.'}</p>
      {item.variants.map((variant) => <fieldset className="choice-group" key={variant.name}><legend>{variant.name} {variant.required && <small>Required</small>}</legend>{variant.options.map((option) => <label className="choice-option" key={option.name}><span><input type="radio" name={`${item.id}-${variant.name}`} checked={variantChoice[variant.name] === option.name} onChange={() => setVariantChoice((choices) => ({ ...choices, [variant.name]: option.name }))} /><b>{option.name}</b></span><strong>{Number(option.price) ? `+ ${money(option.price)}` : 'Included'}</strong></label>)}</fieldset>)}
      {!!item.addOns.length && <fieldset className="choice-group"><legend>Add-ons <small>Optional</small></legend>{item.addOns.map((addOn) => <label className="choice-option" key={addOn.name}><span><input type="checkbox" checked={selectedAddOns.includes(addOn.name)} onChange={() => setSelectedAddOns((values) => values.includes(addOn.name) ? values.filter((value) => value !== addOn.name) : [...values, addOn.name])} /><b>{addOn.name}</b></span><strong>+ {money(addOn.price)}</strong></label>)}</fieldset>}
      <div className="detail-footer"><div className="quantity-control"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>＋</button></div><button type="button" className="add-cart-button" onClick={submit}>Add to Cart <b>{money(unitPrice * quantity)}</b></button></div>{notice && <p className="item-notice" role="alert">{notice}</p>}
    </div>
  </section></div>
}

export default function RestaurantExperience({ restaurant, merchantItems = [], cart, setCart, onCheckout = () => {} }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [tab, setTab] = useState('Menu')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponMessage, setCouponMessage] = useState('')
  const [instructions, setInstructions] = useState({})
  const own = restaurantMenu(merchantItems,restaurant.id)
  const restaurantItems = own.map((item, index) => adaptMerchantItem(item, index, restaurant.name)).filter((item) => item.available !== false)
  const categories = ['All', ...new Set(restaurantItems.map((item) => item.category || 'Popular'))]
  const visibleItems = restaurantItems.filter((item) => (category === 'All' || item.category === category) && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
  const [quote,setQuote]=useState(null)
  const [reviews,setReviews]=useState([])
  const [reviewOrders,setReviewOrders]=useState([])
  const [reviewOrderId,setReviewOrderId]=useState('')
  const [reviewRating,setReviewRating]=useState('5')
  const [reviewComment,setReviewComment]=useState('')
  const [reviewNotice,setReviewNotice]=useState('')
  async function reloadReviews(){setReviews(await api('/api/reviews/restaurant/'+restaurant.id))}
  useEffect(()=>{api('/api/orders').then(orders=>{const completed=orders.filter(order=>order.restaurantId===restaurant.id&&['DELIVERED','PICKED_UP'].includes(order.status));setReviewOrders(completed);if(completed[0])setReviewOrderId(String(completed[0].id))}).catch(()=>{})},[restaurant.id,tab])
  const selectedReview=reviews.find(review=>String(review.orderId)===reviewOrderId)
  useEffect(()=>{setReviewRating(selectedReview?String(selectedReview.rating):'5');setReviewComment(selectedReview?.comment || '')},[selectedReview?.id,reviewOrderId])
  async function saveReview(event){event.preventDefault();try{await api('/api/reviews'+(selectedReview?'/'+selectedReview.id:''),{method:selectedReview?'PUT':'POST',body:{orderId:Number(reviewOrderId),rating:Number(reviewRating),comment:reviewComment}});await reloadReviews();setReviewNotice('Review saved.')}catch(error){setReviewNotice(error.message)}}
  async function deleteReview(){try{await api('/api/reviews/'+selectedReview.id,{method:'DELETE'});await reloadReviews();setReviewComment('');setReviewNotice('Review removed.')}catch(error){setReviewNotice(error.message)}}

  useEffect(()=>{let active=true;api('/api/reviews/restaurant/'+restaurant.id).then(value=>{if(active)setReviews(value)}).catch(()=>{});return()=>{active=false}},[restaurant.id])
  useEffect(()=>{if(!cart.length)return;let active=true;api('/api/guest/orders/quote',{method:'POST',body:checkoutRequest(cart,{address1:'Quote'},'CASH',couponApplied?{code:coupon}:null)}).then(value=>{if(active){setQuote(value);setCouponMessage('')}}).catch(error=>{if(active){setQuote(null);setCouponMessage(error.message)}});return()=>{active=false}},[cart,couponApplied])
  const deliveryFee = Number(quote?.deliveryFee || 0)
  const discount = Number(quote?.discount || 0)
  async function applyCoupon(){try{const value=await api('/api/guest/orders/quote',{method:'POST',body:checkoutRequest(cart,{address1:'Quote'},'CASH',{code:coupon})});setQuote(value);setCouponApplied(true);setCouponMessage('Offer applied.')}catch(error){setCouponApplied(false);setCouponMessage(error.message)}}
  const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK')}`

  function addItem(item) {
    setCart((items) => {
      const match = items.find((existing) => existing.id === item.id)
      return match ? items.map((existing) => existing.id === item.id ? { ...existing, quantity: existing.quantity + item.quantity } : existing) : [...items, item]
    })
  }
  function changeQuantity(id, delta) { setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)) }
  const isCartPage = window.location.pathname === '/cart'

  if (isCartPage) return <section className="standalone-page experience-page cart-page"><a className="store-back" href="/home">← Continue shopping</a><div className="page-heading"><span>YOUR ORDER</span><h1>Your <em>Cart.</em></h1><p>Review your dishes, choices and delivery total.</p></div>{cart.length ? <div className="cart-page-layout"><div className="cart-page-lines">{cart.map((item) => <article className="cart-page-item" key={item.id}><img src={item.image || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=240&q=80'} alt={item.name} /><div className="cart-page-item-copy"><small>{item.restaurant}</small><h2>{item.name}</h2>{Object.entries(item.variants || {}).map(([name, value]) => <p key={name}>{name}: {value}</p>)}{!!item.addOns?.length && <p>Add-ons: {item.addOns.join(', ')}</p>}<label className="special-instructions">Special instructions<textarea value={instructions[item.id] ?? item.specialInstructions ?? ''} onChange={(event) => { setInstructions((values) => ({ ...values, [item.id]: event.target.value })); setCart((items) => items.map((entry) => entry.id === item.id ? { ...entry, specialInstructions: event.target.value } : entry)) }} placeholder="Anything we should know? (optional)" maxLength={240} /></label><div className="cart-line-actions"><div className="quantity-control"><button type="button" aria-label={`Decrease ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>＋</button></div><button className="remove-cart-item" type="button" onClick={() => setCart((items) => items.filter((entry) => entry.id !== item.id))}>Remove</button><strong>{money(item.price * item.quantity)}</strong></div></div></article>)}</div><aside className="order-summary"><h2>Order Summary</h2><label className="coupon-row"><input value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponMessage('') }} placeholder="Enter coupon code" /><button type="button" onClick={applyCoupon}>Apply</button></label>{couponMessage && <p className="coupon-message" role="status">{couponMessage}</p>}<div className="summary-row"><span>Items subtotal</span><b>{money(subtotal)}</b></div><div className="summary-row"><span>Delivery fee</span><b>{money(deliveryFee)}</b></div>{discount > 0 && <div className="summary-row discount-row"><span>Discount</span><b>− {money(discount)}</b></div>}<div className="summary-total"><strong>Total</strong><strong>{money(subtotal + deliveryFee - discount)}</strong></div><button type="button" className="checkout-page-button" onClick={() => onCheckout(couponApplied ? { code: coupon.trim().toUpperCase(), discount } : null)}>Proceed to Checkout <b>→</b></button><small>Availability and totals are verified at checkout.</small></aside></div> : <div className="cart-page-empty"><span>🛍️</span><h2>Your cart is waiting</h2><p>Choose a restaurant and add something delicious.</p><a className="primary-cta" href="/home">Explore featured restaurants <b>→</b></a></div>}</section>

  return <section className="standalone-page experience-page restaurant-page"><a className="store-back" href="/home">← Back to Foodie</a><div className="restaurant-cover" style={{ backgroundImage: `linear-gradient(90deg,#18140c99,#18140c0a),url("${restaurant.bannerImage || ('')}")` }}><div className="restaurant-cover-mark"><span>{restaurant.logoImage ? <img src={restaurant.logoImage} alt="" /> : restaurant.icon}</span></div><div className="restaurant-cover-copy"><small>GOOD FOOD, CLOSE TO HOME</small><h1>{restaurant.name}</h1><p>{restaurant.type}</p></div></div><div className="restaurant-overview"><div className="overview-fact"><b>★ {restaurant.rating}</b><span>Customer rating</span></div><div className="overview-fact"><b>◷ {restaurant.time}</b><span>Delivery estimate</span></div><div className="overview-fact"><b>🛵 {restaurant.price}</b><span>Delivery fee</span></div><div className="restaurant-open"><i /> {restaurant.open ? 'Open now' : 'Closed'}</div>{count > 0 && <a className="store-cart-link" href="/cart">View cart <span>{count}</span> · {money(subtotal)} →</a>}</div><div className="restaurant-tabs" role="tablist" aria-label={`${restaurant.name} information`}>{['Menu', 'Reviews', 'About'].map((label) => <button type="button" role="tab" aria-selected={tab === label} className={tab === label ? 'active' : ''} key={label} onClick={() => setTab(label)}>{label}</button>)}</div>{tab === 'Menu' ? <div className="restaurant-menu-layout"><aside className="menu-categories"><h2>Menu</h2>{categories.map((name) => <button className={category === name ? 'active' : ''} type="button" key={name} onClick={() => setCategory(name)}>{name}<span>{name === 'All' ? restaurantItems.length : restaurantItems.filter((item) => item.category === name).length}</span></button>)}</aside><div className="restaurant-menu-content"><div className="menu-search"><span>⌕</span><input aria-label="Search menu" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${restaurant.name} menu`} /></div><h2>{category === 'All' ? 'Popular right now' : category}<small>{visibleItems.length} items</small></h2>{visibleItems.length ? <div className="restaurant-menu-list">{visibleItems.map((item) => <article className="restaurant-menu-card" key={item.id} onClick={() => setSelectedItem(item)}><img src={item.image || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80'} alt={item.name} /><div className="restaurant-menu-copy"><small>{item.category} {item.rating ? `· ★ ${Number(item.rating).toFixed(1)}` : ''}</small><h3>{item.name}</h3><p>{item.description}</p><strong>{money(item.price)}{item.variants?.length ? <small> · options available</small> : null}</strong></div><button type="button" aria-label={`Customize ${item.name}`} onClick={(event) => { event.stopPropagation(); setSelectedItem(item) }}>＋</button></article>)}</div> : <p className="menu-empty">No menu items match your search.</p>}</div></div> : tab === 'Reviews' ? <section className="store-info-panel"><h2>Customer reviews</h2><p><b>★ {restaurant.rating}</b> based on recent customer ratings.</p>{reviews.map(review=><article key={review.id}>{review.comment}<small>Customer rating · {'★'.repeat(review.rating)}</small></article>)}{!reviews.length && <article>No reviews yet.</article>}{reviewOrders.length>0&&<form className="customer-profile-form" onSubmit={saveReview}><h3>{selectedReview?'Edit your review':'Write a review'}</h3><label className="tracking-order-select">Completed order<select value={reviewOrderId} onChange={event=>setReviewOrderId(event.target.value)}>{reviewOrders.map(order=><option key={order.id} value={String(order.id)}>Order #{order.id}</option>)}</select></label><div className="customer-form-grid"><label>Rating (1–5)<input type="number" min="1" max="5" step="1" value={reviewRating} onChange={event=>setReviewRating(event.target.value)} required/></label><label>Review<textarea value={reviewComment} onChange={event=>setReviewComment(event.target.value)} required maxLength={1000}/></label></div><button className="account-primary" type="submit">Save review</button>{selectedReview&&<button className="account-secondary" type="button" onClick={deleteReview}>Delete review</button>}</form>}{reviewNotice&&<p className="account-center-notice" role="status">{reviewNotice}</p>}</section> : <section className="store-info-panel"><h2>About {restaurant.name}</h2><p>{restaurant.name} serves {restaurant.type.toLowerCase()} favourites, freshly prepared for your neighbourhood.</p><p><b>Delivery estimate</b> · {restaurant.time}<br /><b>Delivery fee</b> · {restaurant.price}<br /><b>Hours</b> · Open now</p>{restaurant.marketingOffer && <p className="restaurant-offer-note">✦ {restaurant.marketingOffer}</p>}</section>}{selectedItem && <ItemDetail item={selectedItem} restaurant={restaurant} onClose={() => setSelectedItem(null)} onAdd={addItem} />}</section>
}
