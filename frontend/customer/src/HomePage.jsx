import { useCallback, useEffect, useRef, useState } from 'react'
import './HomePage.css'
import AccountCenter from './AccountCenter.jsx'
import RestaurantExperience from './RestaurantExperience.jsx'
import CheckoutPage from './CheckoutPage.jsx'
import { DEMO_RESTAURANTS, fetchMerchantRestaurants } from './restaurantData.js'
import OrderTracking from './OrderTracking.jsx'
import OffersPage from './OffersPage.jsx'
import { api, profileView, accountView } from './api.js'
import { loadOrders, placeOrder } from './customerApi.js'

const slides = [
  { src: '/banners/good-food-together.jpg', alt: 'Friends sharing a meal', background: '#c8edfb', kicker: 'GOOD THINGS ARE CLOSE', titleFirst: 'GOOD FOOD.', titleAccent: 'BRINGS PEOPLE TOGETHER.', copy: 'Share meals, create moments and support local communities.', primaryLabel: 'Start Ordering', primaryHref: '/restaurants', secondaryLabel: 'Learn More', secondaryHref: '/offers' },
  { src: '/banners/discover-local-favorites.jpg', alt: 'Local meals and restaurant favourites', background: '#def4df', kicker: 'GOOD THINGS ARE CLOSE', titleFirst: 'DISCOVER', titleAccent: 'LOCAL FAVOURITES.', copy: 'From home-cooked meals to popular spots, find food you’ll love.', primaryLabel: 'Browse Restaurants', primaryHref: '/restaurants', secondaryLabel: 'See Popular Dishes', secondaryHref: '/restaurants' },
  { src: '/banners/faster-delivery.jpg', alt: 'Food courier delivering an order', background: '#fde5df', kicker: 'GOOD THINGS ARE CLOSE', titleFirst: 'YOUR FAVOURITE', titleAccent: 'FOOD, FASTER.', copy: 'Quick delivery from local restaurants straight to your door.', primaryLabel: 'Order Now', primaryHref: '/restaurants', secondaryLabel: 'Browse Menu', secondaryHref: '/restaurants' },
  { src: '/banners/local-food-love-delivered.jpg', alt: 'Courier bringing local food to a restaurant customer', background: '#fff5df', kicker: 'GOOD THINGS ARE CLOSE', titleFirst: 'LOCAL FOOD.', titleAccent: 'LOVE, DELIVERED.', copy: 'Support neighbourhood kitchens and enjoy something wonderful.', primaryLabel: 'Meet Local Kitchens', primaryHref: '/restaurants', secondaryLabel: 'See Today’s Menu', secondaryHref: '/restaurants' },
]
const categoryStyles = [
  ['Appetizers', '🥟', 'cat-peach'], ['Main course', '🍛', 'cat-green'], ['Sides', '🍟', 'cat-yellow'],
  ['Desserts', '🍰', 'cat-pink'], ['Beverages', '🧋', 'cat-cream'], ['Other', '🍜', 'cat-green'],
]
// The restaurant list comes from the shared API; DEMO_RESTAURANTS is a dev-only fallback.

function Brand() {
  return <a className="home-brand" href="/home" aria-label="Foodie home"><span className="brand-burger">🍔</span><strong>foodie<span>.</span></strong><small>CUSTOMER</small></a>
}
function NavigationIcon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    restaurants: <><path d="M4 21h16M6 21V8h12v13M9 8V4h6v4M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></>,
    track: <><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/></>,
    offers: <><path d="m20 13-7 7-10-10V4h6z"/><circle cx="7.5" cy="7.5" r="1"/><path d="m12 8 4 4m0-4-4 4"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function AccountMenuIcon({ name }) {
  const paths = {
    settings: <><circle cx="12" cy="8" r="3.3"/><path d="M5.8 20v-1.6a6.2 6.2 0 0 1 12.4 0V20z"/></>,
    orders: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6"/></>,
    wallet: <><rect x="3.5" y="6" width="17" height="14" rx="2"/><path d="M3.5 9h17M15.5 14h2"/><path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3H18"/></>,
    rewards: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></>,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l5 4-5 4M19 12H8"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function ProfileMenuRow({ icon, title, description, onClick, signOut = false }) {
  return <button className={'profile-menu-row' + (signOut ? ' profile-menu-row-signout' : '')} type="button" onClick={onClick}>
    <span className="profile-menu-row-icon"><AccountMenuIcon name={icon} /></span>
    <span className="profile-menu-row-copy"><strong>{title}</strong><small>{description}</small></span>
    <svg className="profile-menu-row-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
  </button>
}

function RestaurantArt({ name, color, icon }) {
  return <svg className={`restaurant-art art-${color}`} viewBox="0 0 360 112" aria-label={`${name} illustrated storefront`} role="img">
    <path d="M0 86h360v26H0z" fill="#d8c8aa"/><path d="M0 33 180 0l180 33v61H0z" fill="#628d65"/>
    <path d="M72 38h222v61H72z" fill="#f4d9a6"/><path d="M51 35h255v19H51z" fill="#a43e32"/><path d="M79 53h206v46H79z" fill="#fff1cf"/><path d="M102 61h54v38h-54zm78 0h73v38h-73z" fill="#c97c4b"/><path d="M0 73q45-22 88 2v37H0zm278-10q44-18 82 9v40h-82z" fill="#3e7750"/><path d="M34 35 47 10l13 25m274 2 11-26 14 28" stroke="#315c3e" strokeWidth="9" strokeLinecap="round"/><path d="M24 71v41m296-45v45" stroke="#76573a" strokeWidth="5"/><text x="180" y="49" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fontWeight="800" fill="white">{name.toUpperCase()}</text><text x="126" y="91" fontSize="21">{icon}</text><circle cx="38" cy="62" r="15" fill="#75a66d"/><circle cx="322" cy="70" r="17" fill="#79a86e"/>
  </svg>
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [restaurantsLoading, setRestaurantsLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(2)
  const [previousSlide, setPreviousSlide] = useState(null)
  const activeSlideRef = useRef(2)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const featuredTrackRef = useRef(null)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const searchRef = useRef(null)
  const [favoritePrompt, setFavoritePrompt] = useState(false)
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('foodie.cart') || '[]') } catch { return [] } })
  const [cartOpen, setCartOpen] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const categories=[...new Set(menuItems.map(item=>item.category).filter(Boolean))].map(name=>categoryStyles.find(category=>category[0]===name) || [name,'🍽️','cat-green'])
  const featuredRestaurants = restaurants.filter((restaurant) => restaurant.marketingEnabled)
  const [activeCategory, setActiveCategory] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [categorySearchOpen, setCategorySearchOpen] = useState(false)
  const [orderConfirmation, setOrderConfirmation] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [accountSection, setAccountSection] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('foodie.customer.theme') === 'dark' ? 'dark' : 'light')
  const [customer, setCustomer] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [profileData, setProfileData] = useState({name:'',email:'',phone:'',address1:'',address2:'',address3:'',city:'',postalCode:'',photo:''})
  const [orders, setOrders] = useState([])
  const [policy, setPolicy] = useState({})
  const [rewardBalance, setRewardBalance] = useState(0)
  useEffect(() => {
    let active = true
    async function refresh() {
      let account = null
      try { account=await api('/api/account'); if(account.role!=='CUSTOMER')account=null } catch(error) { if(error.status!==401 && error.status!==403) console.error(error.message) }
      if(!active)return
      setCustomer(account?accountView(account):null)
      if(account) {
        setProfileData(profileView(account))
        try { const [saved,rewards]=await Promise.all([api('/api/customer/favorites'),api('/api/customer/rewards')]);if(active){setFavorites(saved.map(r=>r.name));setRewardBalance(rewards.available)} } catch(error){console.error(error.message)}
      }
      try { const current=await loadOrders(account);if(active)setOrders(current) } catch(error){console.error(error.message)}
      try { const values=await api('/api/customer/policies');if(active)setPolicy(values) } catch(error){console.error(error.message)}
    }
    let timer

    async function poll() {
      try {
        await refresh()
      } finally {
        if (active) timer = window.setTimeout(poll, 30000)
      }
    }

    poll()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [])
  const [checkoutOffer] = useState(() => { try { return JSON.parse(sessionStorage.getItem('foodie.checkout.offer') || 'null') } catch { return null } })
  const handleTrackedOrderChange = useCallback((updatedOrder) => setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order)), [])
  const isGuest = new URLSearchParams(window.location.search).get('mode') === 'guest' || !customer
  const favoriteStorageKey = !isGuest && (customer?.identifier || customer?.displayName) ? 'foodie.customer.favorites.' + encodeURIComponent(String(customer.identifier || customer.displayName).trim().toLowerCase()) : ''

  const changeSlide = useCallback((nextSlide) => {
    const currentSlide = activeSlideRef.current
    if (nextSlide === currentSlide) return
    setPreviousSlide(currentSlide)
    activeSlideRef.current = nextSlide
    setActiveSlide(nextSlide)
  }, [])

  useEffect(() => {
    let active = true
    const loadRestaurants = async () => {
      try {
        const records = await fetchMerchantRestaurants()
        if (active) setRestaurants(records)
      } catch {
        if (active) setRestaurants([])
      } finally {
        if (active) setRestaurantsLoading(false)
      }
    }
    let restaurantsTimer

    async function pollRestaurants() {
      try {
        await loadRestaurants()
      } finally {
        if (active) {
          restaurantsTimer = window.setTimeout(pollRestaurants, 60000)
        }
      }
    }

    pollRestaurants()
    return () => {
      active = false
      window.clearTimeout(restaurantsTimer)
    }
  }, [])
  useEffect(() => {
    const timer = window.setInterval(() => changeSlide((activeSlideRef.current + 1) % slides.length), 6500)
    return () => window.clearInterval(timer)
  }, [changeSlide])
  useEffect(() => {
    if (previousSlide === null) return undefined
    const timer = window.setTimeout(() => setPreviousSlide(null), 680)
    return () => window.clearTimeout(timer)
  }, [previousSlide])
  useEffect(() => {
    if (featuredPaused || featuredRestaurants.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      const track = featuredTrackRef.current
      if (!track) return
      const nextIndex = (featuredIndex + 1) % featuredRestaurants.length
      const card = track.querySelector('[data-featured-card]')
      const styles = getComputedStyle(track)
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
      const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth
      track.scrollTo({ left: nextIndex === 0 ? 0 : step * nextIndex, behavior: 'smooth' })
      setFeaturedIndex(nextIndex)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [featuredIndex, featuredPaused, featuredRestaurants.length])
  useEffect(() => { localStorage.setItem('foodie.cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (!activeCategory) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function closeOnEscape(event) { if (event.key === 'Escape') setActiveCategory('') }
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape) }
  }, [activeCategory])
  useEffect(() => {
    let active = true
    const loadMenu = () => fetch('/api/menu-items').then((response) => response.ok ? response.json() : []).then((items) => { if (active && Array.isArray(items)) setMenuItems(items) }).catch(() => {})
    let timer

    async function pollMenu() {
      try {
        await loadMenu()
      } finally {
        if (active) timer = window.setTimeout(pollMenu, 60000)
      }
    }

    pollMenu()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => { localStorage.setItem('foodie.customer.theme', theme) }, [theme])
  useEffect(() => {
    function closeSuggestions(event) { if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', closeSuggestions)
    return () => document.removeEventListener('mousedown', closeSuggestions)
  }, [])

  const slide = slides[activeSlide]
  const customerName = (customer?.displayName && customer.displayName !== 'Foodie customer' ? customer.displayName : '') || profileData.name.trim() || (customer?.identifier && customer.identifier.includes('@') ? customer.identifier.split('@')[0] : 'Customer')
  const searchTerm = search.trim().toLowerCase()
  const matchingRestaurants = restaurants.filter((restaurant) => { const dish = menuItems.find((item) => String(item.restaurantId ?? item.restaurant ?? item.merchantName ?? '').toLowerCase() === String(restaurant.id ?? restaurant.name).toLowerCase()); return [restaurant.name, restaurant.type, dish?.name || ''].some((value) => value.toLowerCase().includes(searchTerm)) })
  const currentPage = ({ '/restaurants': 'restaurants', '/track-order': 'track', '/offers': 'offers', '/cart': 'cart', '/checkout': 'checkout' })[window.location.pathname] || 'home'
  const storeSlug = window.location.pathname.match(/^\/store\/([^/]+)\/?$/)?.[1]
  const storeRestaurant = storeSlug ? restaurants.find((restaurant) => restaurant.slug === storeSlug) : null
  const cartRestaurant = restaurants[0] || { name: 'Foodie', slug: 'cart', type: '', rating: '', time: '', price: '', icon: '🍽️' }
  const isHomePage = currentPage === 'home' && !storeSlug
  const shownRestaurants = matchingRestaurants
  const searchSuggestions = searchTerm ? matchingRestaurants.slice(0, 6) : []
  const favoriteRestaurants = restaurants.filter((restaurant) => favorites.includes(restaurant.name))
  const availableMenuItems = menuItems.filter((item) => item.available !== false)
  const normalizedDishSearch = categorySearch.trim().toLowerCase()
  const categoryMenuItems = availableMenuItems.filter((item) => normalizedDishSearch ? [item.name, item.description, item.restaurant, item.category].some((value) => String(value || '').toLowerCase().includes(normalizedDishSearch)) : String(item.category || '').toLowerCase() === activeCategory.toLowerCase())
  const categorySuggestions = normalizedDishSearch ? availableMenuItems.filter((item) => [item.name, item.description, item.restaurant, item.category].some((value) => String(value || '').toLowerCase().includes(normalizedDishSearch))) : []
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const pointsBalance = rewardBalance
  const money = (amount) => 'Rs. ' + amount.toLocaleString('en-LK')

  function beginCheckout(offer = null) {
    sessionStorage.setItem('foodie.checkout.offer', JSON.stringify(offer))
    window.location.assign('/checkout')
  }

  function addPublishedMenuItem(item) {
    const selectedPrices = item.sizesEnabled && item.sizes ? Object.values(item.sizes).filter((size) => size.selected && Number(size.price) >= 0).map((size) => Number(size.price)) : []
    const price = selectedPrices.length ? Math.min(...selectedPrices) : Number(item.price) || 0
    const id = 'menu:' + item.id
    setCart((items) => {
      const existing = items.find((entry) => entry.id === id)
      return existing ? items.map((entry) => entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...items, { id, menuItemId: item.id, restaurantId: item.restaurantId, size: item.sizesEnabled ? Object.keys(item.sizes || {}).find(key => item.sizes[key].selected && Number(item.sizes[key].price)===price) : null, name: item.name, restaurant: item.restaurant || '', price, quantity: 1 }]
    })
  }
  function selectSearchResult(restaurant) {
    setSearch(restaurant.name)
    setSearchOpen(false)
    setActiveSuggestion(0)
    window.location.assign('/restaurants?search=' + encodeURIComponent(restaurant.name))
  }
  async function toggleFavorite(name) {
    if (isGuest) { setFavoritePrompt(true); return }
    const restaurant=restaurants.find(item=>item.name===name)
    if(!restaurant)return
    try { await api('/api/customer/favorites/'+restaurant.id,{method:favorites.includes(name)?'DELETE':'PUT'});const saved=await api('/api/customer/favorites');setFavorites(saved.map(item=>item.name)) } catch(error){window.alert(error.message)}
  }
  function renderRestaurantCard(restaurant) {
    const saved = favorites.includes(restaurant.name)
    return <article className="restaurant-card" key={restaurant.name} role="link" tabIndex={0} aria-label={`Open ${restaurant.name} restaurant`} onClick={() => window.location.assign('/store/' + restaurant.slug)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.assign('/store/' + restaurant.slug) } }}>
      <div className="restaurant-picture">{restaurant.bannerImage ? <img className="restaurant-art restaurant-banner-image" src={restaurant.bannerImage} alt={`${restaurant.name} cover`} /> : <RestaurantArt name={restaurant.name} color={restaurant.color} icon={restaurant.icon} />}<button type="button" aria-label={(saved ? 'Remove ' : 'Save ') + restaurant.name + (isGuest ? ' (sign in required)' : ' to favourites')} aria-pressed={saved} className={'favorite' + (saved ? ' is-favorite' : '')} onClick={(event) => { event.stopPropagation(); toggleFavorite(restaurant.name) }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5-8.8 8.8-8.8 11s-8.8-6-8.8-11A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" /></svg></button></div>
      <div className="restaurant-details"><div className={'restaurant-avatar avatar-' + restaurant.color}>{restaurant.logoImage ? <img src={restaurant.logoImage} alt="" /> : restaurant.icon}</div><div className="restaurant-info"><strong>{restaurant.name}</strong><span>{restaurant.type}</span><div className="restaurant-meta"><span>◷ &nbsp;{restaurant.time}</span><span>🛵 &nbsp;{restaurant.price}</span></div></div><span className="rating">{restaurant.rating && <>★ <i>{restaurant.rating}</i></>}</span></div>
    </article>
  }
  function renderFeaturedCard(restaurant) {
    return <a className="featured-restaurant-card" data-featured-card href={'/store/' + restaurant.slug} key={restaurant.slug} aria-label={`Open ${restaurant.name} store`}>
      <div className="featured-restaurant-art">{restaurant.bannerImage ? <img className="restaurant-art restaurant-banner-image" src={restaurant.bannerImage} alt="" /> : <RestaurantArt name={restaurant.name} color={restaurant.color} icon={restaurant.icon} />}{restaurant.marketingOffer && <span className="marketing-badge">✦ {restaurant.marketingOffer}</span>}</div>
      <div className="featured-restaurant-info"><div><strong>{restaurant.name}</strong><span>{restaurant.type}</span></div><span className="featured-rating">★ {restaurant.rating.split(' ')[0]}</span></div>
      <div className="featured-restaurant-meta"><span>◷ {restaurant.time}</span><span>🛵 {restaurant.price} delivery</span></div>
    </a>
  }
  function changeQuantity(id, amount) {
    setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }
  async function updateProfile(nextProfile) {
    const account=await api('/api/account',{method:'PUT',body:nextProfile})
    if(nextProfile.photo && nextProfile.photo!==account.photo)await api('/api/account/photo',{method:'PUT',body:{photo:nextProfile.photo}})
    setProfileData({...profileView(account),photo:nextProfile.photo || account.photo || ''})
    setCustomer(accountView(account))
  }
  function openAccount(section) {
    setAccountSection(section)
    setProfileOpen(false)
  }
  async function completeCheckout(details, requestKey) {
    const order=await placeOrder(cart,details,checkoutOffer,details.redeemedPoints>0,isGuest?null:customer,requestKey)
    setOrders(current=>[...current.filter(item=>item.id!==order.id),order])
    setOrderConfirmation(order);setCart([]);sessionStorage.removeItem('foodie.checkout.offer');return order
  }
  async function signOut() {
    try {await api('/api/auth/logout',{method:'POST'});sessionStorage.removeItem('foodie.customer');setCustomer(null);setFavorites([]);setOrders([]);setProfileOpen(false);window.location.assign('/home?mode=guest')} catch(error){window.alert(error.message)}
  }

  return <main className={'food-home' + (theme === 'dark' ? ' theme-dark' : '')}>
    <header className="food-nav">
      <Brand />
      <nav aria-label="Main navigation">{[['home', 'Home', '/home'], ['restaurants', 'Restaurants', '/restaurants'], ['offers', 'Offers', '/offers'], ['track', 'Track Order', '/track-order']].map(([key, label, href]) => <a key={key} className={currentPage === key ? 'selected' : ''} href={href} aria-current={currentPage === key ? 'page' : undefined}><NavigationIcon name={key} /><span>{label}</span></a>)}</nav>
      <div className="nav-tools">
        <div className="search-autocomplete" ref={searchRef}>
          <div className="search-box"><svg className="search-lens" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); setActiveSuggestion(0) }} onKeyDown={(event) => { if (event.key === 'ArrowDown' && searchSuggestions.length) { event.preventDefault(); setActiveSuggestion((index) => (index + 1) % searchSuggestions.length) } else if (event.key === 'ArrowUp' && searchSuggestions.length) { event.preventDefault(); setActiveSuggestion((index) => (index + searchSuggestions.length - 1) % searchSuggestions.length) } else if (event.key === 'Enter' && searchSuggestions.length) { event.preventDefault(); selectSearchResult(searchSuggestions[activeSuggestion]) } else if (event.key === 'Escape') setSearchOpen(false) }} placeholder="Search restaurants, dishes..." aria-label="Search restaurants and dishes" aria-expanded={searchOpen && Boolean(searchTerm)} aria-controls="restaurant-search-suggestions" aria-autocomplete="list" />{search && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setSearch(''); setActiveSuggestion(0) }}>×</button>}</div>
          {searchOpen && searchTerm && <div className="search-suggestions" id="restaurant-search-suggestions" role="listbox"><small>RESTAURANTS & DISHES</small>{searchSuggestions.length ? searchSuggestions.map((restaurant, index) => <button type="button" role="option" aria-selected={activeSuggestion === index} id={'restaurant-suggestion-' + index} key={restaurant.name} onMouseDown={(event) => event.preventDefault()} onClick={() => selectSearchResult(restaurant)}><span className="suggestion-icon">{restaurant.icon}</span><span><strong>{restaurant.name}</strong><small>{restaurant.type}</small></span><b>↗</b></button>) : <p>No restaurant matches “{search}”. Try another name or dish.</p>}</div>}
        </div>
        <button className="basket" type="button" aria-label={'Shopping cart, ' + itemCount + ' items'} onClick={() => { window.location.assign('/cart'); setProfileOpen(false) }}>🛒{itemCount > 0 && <i>{itemCount}</i>}</button>
        {isGuest
          ? <a className="profile profile-guest" href="/login" aria-label="Sign in to your customer account"><span aria-hidden="true">●</span><b>Sign in</b></a>
          : <div className="profile-control">
            <button className="profile" type="button" aria-label="Open your account" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>{profileData.photo ? <img src={profileData.photo} alt="" /> : customerName.slice(0, 1).toUpperCase()}</button>
            {profileOpen && <div className="profile-menu" aria-label="Customer account menu">
              <div className="profile-menu-person">
                <span className="profile-menu-avatar">{profileData.photo ? <img src={profileData.photo} alt="" /> : customerName.slice(0, 1).toUpperCase()}</span>
                <div className="profile-menu-person-copy"><strong>{customerName}</strong><small>{profileData.email || profileData.phone || customer.identifier}</small><span className="profile-menu-points"><i aria-hidden="true">★</i>{pointsBalance} star points</span></div>
                <button className="profile-rewards-cta" type="button" onClick={() => openAccount('rewards')}><span aria-hidden="true">🎁</span>Rewards<b aria-hidden="true">›</b></button>
              </div>
              <div className="profile-menu-links">
                <ProfileMenuRow icon="settings" title="Account settings" description="Manage your profile and preferences" onClick={() => openAccount('settings')} />
                <ProfileMenuRow icon="orders" title="My orders" description="View your recent and past orders" onClick={() => openAccount('orders')} />
                <ProfileMenuRow icon="wallet" title="Wallet" description="Manage your payment methods" onClick={() => openAccount('wallet')} />
                <ProfileMenuRow icon="rewards" title="Rewards" description="Check your star points and offers" onClick={() => openAccount('rewards')} />
                <ProfileMenuRow icon="logout" title="Sign out" description="Log out from your account" onClick={signOut} signOut />
              </div>
            </div>}
          </div>}
      </div>
    </header>
    {isHomePage && <section className="food-hero" id="home" aria-label={'Featured promotion ' + (activeSlide + 1) + ' of ' + slides.length} style={{ '--banner-background': slide.background }}>
      {previousSlide !== null && <img className="hero-banner-image banner-exit" src={slides[previousSlide].src} alt="" aria-hidden="true" draggable="false" />}
      <img className={'hero-banner-image' + (previousSlide !== null ? ' banner-enter' : '')} key={slide.src} src={slide.src} alt={slide.alt} draggable="false" fetchPriority={activeSlide === 0 ? 'high' : 'auto'} />
      <div className="hero-copy" key={'copy-' + slide.src}>
        <span className="home-eyebrow"><i />{slide.kicker}</span>
        <h1>{slide.titleFirst}<br /><em>{slide.titleAccent}</em></h1>
        <p>{slide.copy}</p>
        <div className="hero-actions"><a className="primary-cta" href={slide.primaryHref}>{slide.primaryLabel}<b>→</b></a><a className="secondary-cta" href={slide.secondaryHref}>{slide.secondaryLabel}</a></div>
      </div>
      <button className="slide-arrow slide-prev" aria-label="Previous banner" onClick={() => changeSlide((activeSlideRef.current + slides.length - 1) % slides.length)}>‹</button>
      <button className="slide-arrow slide-next" aria-label="Next banner" onClick={() => changeSlide((activeSlideRef.current + 1) % slides.length)}>›</button>
      <div className="slide-dots" aria-label="Choose banner">{slides.map((item, index) => <button key={item.src} aria-label={'Show banner ' + (index + 1)} aria-current={activeSlide === index ? 'true' : undefined} className={activeSlide === index ? 'current' : ''} onClick={() => changeSlide(index)} />)}</div>
    </section>}
    <div className="home-content">
      {isHomePage && <section className="browse-row" id="categories"><div className="categories-area"><h2>Explore by Category</h2><div className="category-list">{categories.map(([name, icon, color]) => <button type="button" className={'category-card ' + color + (activeCategory === name ? ' category-selected' : '')} key={name} aria-pressed={activeCategory === name} onClick={() => { setCategorySearch(''); setCategorySearchOpen(false); setActiveCategory((current) => current === name ? '' : name) }}><span>{icon}</span><strong>{name}</strong></button>)}</div></div><aside className="offer-card"><div><span>A little treat for</span><strong>your next order</strong><p>Get special offers and discounts<br />on your favourite meals.</p><a href="/offers">View Offers <b>→</b></a></div><span className="offer-art" aria-hidden="true">🍕</span><i className="offer-spark">✦</i></aside></section>}
      {isHomePage && <section className="featured-section" aria-labelledby="featured-title" onMouseEnter={() => setFeaturedPaused(true)} onMouseLeave={() => setFeaturedPaused(false)} onFocusCapture={() => setFeaturedPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFeaturedPaused(false) }}>
        <div className="featured-heading"><div><span>MERCHANT SPOTLIGHT</span><h2 id="featured-title">Featured Restaurants <i>✦</i></h2><p>Local favourites, featured by their restaurant.</p></div><div className="featured-controls"><button type="button" aria-label="Previous featured restaurants" onClick={() => { const index = (featuredIndex + featuredRestaurants.length - 1) % featuredRestaurants.length; setFeaturedIndex(index); featuredTrackRef.current?.scrollTo({ left: index * ((featuredTrackRef.current.querySelector('[data-featured-card]')?.getBoundingClientRect().width || 0) + 16), behavior: 'smooth' }) }}>‹</button><button type="button" aria-label="Next featured restaurants" onClick={() => { const index = (featuredIndex + 1) % featuredRestaurants.length; setFeaturedIndex(index); featuredTrackRef.current?.scrollTo({ left: index * ((featuredTrackRef.current.querySelector('[data-featured-card]')?.getBoundingClientRect().width || 0) + 16), behavior: 'smooth' }) }}>›</button></div></div>
        {featuredRestaurants.length ? <div className="featured-track" ref={featuredTrackRef}>{featuredRestaurants.map(renderFeaturedCard)}</div> : <p className="featured-empty">Restaurants will appear here when they enable marketing.</p>}
        <small className="featured-demo-note">Featured listings shown when <code>marketingEnabled</code> is true.</small>
      </section>}
      {activeCategory && <div className="category-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveCategory('') }}><section className="category-results" role="dialog" aria-modal="true" aria-labelledby="category-results-title"><div className="category-results-heading"><div><span>{categorySearch.trim() ? 'DISH SEARCH' : 'MENU CATEGORY'}</span><h2 id="category-results-title">{categorySearch.trim() ? 'Search results' : activeCategory}</h2><p>{categorySearch.trim() ? 'Matching available dishes across all categories.' : 'Available dishes shared by our restaurants.'}</p></div><button type="button" onClick={() => setActiveCategory('')} aria-label="Close category results">×</button></div><div className="category-dish-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input value={categorySearch} onFocus={() => setCategorySearchOpen(true)} onChange={(event) => { setCategorySearch(event.target.value); setCategorySearchOpen(true) }} onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setCategorySearchOpen(false) } if (event.key === 'Enter' && categorySuggestions.length) { event.preventDefault(); setCategorySearch(categorySuggestions[0].name); setCategorySearchOpen(false) } }} placeholder={'Search ' + activeCategory.toLowerCase() + ' dishes...'} aria-label="Search all menu dishes" aria-expanded={categorySearchOpen && Boolean(categorySearch.trim())} aria-controls="category-dish-suggestions" />{categorySearch && <button type="button" aria-label="Clear dish search" onClick={() => { setCategorySearch(''); setCategorySearchOpen(true) }}>×</button>}{categorySearchOpen && categorySearch.trim() && <div className="category-dish-suggestions" id="category-dish-suggestions" role="listbox"><small>AVAILABLE DISHES</small>{categorySuggestions.length ? categorySuggestions.slice(0, 7).map((item) => <button type="button" role="option" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { setCategorySearch(item.name); setCategorySearchOpen(false) }}><span className="dish-suggestion-image">{item.image ? <img src={item.image} alt="" /> : '🍽️'}</span><span className="dish-suggestion-copy"><strong>{item.name}</strong><small>{item.restaurant || 'Local restaurant'} · {item.category}</small></span><span className="dish-suggestion-rating">{item.rating != null ? '★ ' + Number(item.rating).toFixed(1) : '☆ New'}</span></button>) : <p>No dishes match “{categorySearch}”.</p>}</div>}</div>{categoryMenuItems.length ? <div className="customer-menu-grid">{categoryMenuItems.map((item) => { const prices = item.sizesEnabled && item.sizes ? Object.values(item.sizes).filter((size) => size.selected).map((size) => Number(size.price)).filter(Number.isFinite) : []; const price = prices.length ? Math.min(...prices) : Number(item.price) || 0; return <article className="customer-menu-card" key={item.id}><div className="customer-menu-image">{item.image ? <img src={item.image} alt={item.name} /> : <span aria-hidden="true">{categories.find(([name]) => name === item.category)?.[1] || '🍽️'}</span>}</div><div className="customer-menu-copy"><small>{item.restaurant || 'Local restaurant'}</small><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}<div className="customer-menu-meta"><span className="dish-rating">{item.rating != null ? '★ ' + Number(item.rating).toFixed(1) + (item.ratingCount ? ' (' + item.ratingCount + ')' : '') : '☆ New'}</span><strong>Rs. {price.toLocaleString('en-LK')}</strong><button type="button" onClick={() => addPublishedMenuItem(item)}>＋ Add</button></div></div></article>})}</div> : <p className="category-empty">{categorySearch.trim() ? 'No available dishes match “' + categorySearch + '”.' : 'No available dishes in ' + activeCategory + ' yet. Menu items will appear here when a merchant publishes them.'}</p>}</section></div>}
      {storeSlug && (storeRestaurant ? <RestaurantExperience restaurant={storeRestaurant} merchantItems={menuItems} cart={cart} setCart={setCart} /> : restaurantsLoading ? <section className="standalone-page store-page"><p>Loading restaurant…</p></section> : <section className="standalone-page store-page"><h1>Restaurant not found</h1><p>This restaurant is unavailable.</p><a className="primary-cta" href="/home">Return home</a></section>)}
      {window.location.pathname === '/cart' && <RestaurantExperience restaurant={cartRestaurant} merchantItems={menuItems} cart={cart} setCart={setCart} onCheckout={(offer) => beginCheckout(offer)} />}
      {window.location.pathname === '/checkout' && ((cart.length || orderConfirmation) ? <CheckoutPage cart={cart} profile={profileData} onProfileChange={updateProfile} isGuest={isGuest} pointsBalance={pointsBalance} offer={checkoutOffer} onComplete={completeCheckout} onOpenRewards={() => openAccount('rewards')} /> : <section className="standalone-page experience-page cart-page"><div className="cart-page-empty"><span>🛍️</span><h2>Your cart is empty</h2><p>Add something delicious before checkout.</p><a className="primary-cta" href="/restaurants">Explore restaurants <b>→</b></a></div></section>)}
      {currentPage === 'restaurants' && !storeSlug && <><section className="page-heading"><span>GOOD THINGS ARE CLOSE</span><h1>Restaurants <em>near you.</em></h1><p>Explore every local favourite and choose something delicious.</p></section>{!isGuest && favoriteRestaurants.length > 0 && <section className="favorites-section" aria-labelledby="favorites-title"><div className="popular-heading"><div><h2 id="favorites-title">Your favourites <span>♥</span></h2><p>Your saved restaurants are ready for your next visit.</p></div></div><div className="restaurant-list">{favoriteRestaurants.map(renderRestaurantCard)}</div></section>}<section className="popular" id="restaurants"><div className="popular-heading"><div><h2 className="restaurant-list-title">{!searchTerm && <span className="restaurant-heading-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 10h18l-1.5-6h-15L3 10Z"/><path d="M4 10v10h16V10M9 20v-6h6v6"/><path d="M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>}{searchTerm ? 'Search results' : 'All restaurants'}</h2><p>{searchTerm ? 'Restaurants and dishes matching your search.' : 'Browse all restaurants delivering great food in your area.'}</p></div></div><div className="restaurant-list">{shownRestaurants.map(renderRestaurantCard)}</div>{shownRestaurants.length === 0 && <p className="empty-search">No restaurants found. Try another search.</p>}</section></>}
      {currentPage === 'offers' && <OffersPage />}
      {currentPage === 'track' && <OrderTracking orders={[...orders].reverse()} onOrderChange={handleTrackedOrderChange} />}
    </div>
    {favoritePrompt && <div className="feature-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setFavoritePrompt(false) }}><section className="favorite-signin-dialog" role="dialog" aria-modal="true" aria-labelledby="favorite-signin-title"><button type="button" className="favorite-dialog-close" aria-label="Close" onClick={() => setFavoritePrompt(false)}>×</button><span className="favorite-dialog-heart">♡</span><h2 id="favorite-signin-title">Save your favourites</h2><p>Sign in to a customer account to save restaurants and see them here next time.</p><a href="/login">Sign in to continue <b>→</b></a><button type="button" className="favorite-keep-browsing" onClick={() => setFavoritePrompt(false)}>Keep browsing</button></section></div>}
    {cartOpen && <div className="cart-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setCartOpen(false); setOrderConfirmation(null) } }}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <header className="cart-header"><div><span className="cart-kicker">FOODIE CART</span><h2 id="cart-title">{orderConfirmation ? 'Order placed' : 'Your order'} <small>({itemCount})</small></h2></div><button type="button" className="cart-close" aria-label="Close cart" onClick={() => { setCartOpen(false); setOrderConfirmation(null) }}>×</button></header>
      {orderConfirmation ? <div className="order-confirmation"><span>✓</span><h3>Thanks for your order</h3><p>Order ID <b>{orderConfirmation.id}</b></p><p>You earned <b>★ {orderConfirmation.points} stars</b>.</p><small>This order was saved and sent to the restaurant.</small><button type="button" onClick={() => { setOrderConfirmation(null); setCartOpen(false) }}>Continue browsing</button></div>
      : cart.length === 0 ? <div className="cart-empty"><span>🛍️</span><h3>Your cart is empty</h3><p>Add a dish from one of the restaurants to get started.</p><button type="button" onClick={() => setCartOpen(false)}>Explore restaurants</button></div> : <>
        <div className="cart-lines">{cart.map((item) => <article className="cart-line" key={item.id}><div className="cart-food-icon">{restaurants.find((restaurant) => restaurant.name === item.restaurant)?.icon || '🍽️'}</div><div className="cart-line-info"><strong>{item.name}</strong><small>{item.restaurant}</small><b>{money(item.price * item.quantity)}</b><div className="cart-quantity"><button type="button" aria-label={'Remove one ' + item.name} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={'Add one ' + item.name} onClick={() => changeQuantity(item.id, 1)}>＋</button></div></div><button type="button" className="cart-remove" aria-label={'Remove ' + item.name} onClick={() => setCart((items) => items.filter((entry) => entry.id !== item.id))}>×</button></article>)}</div>
        <div className="cart-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Additional charges</span><b>{money(Number(policy.delivery_fee || 0))}</b></div><div className="cart-total"><strong>Net total</strong><strong>{money(subtotal + Number(policy.delivery_fee || 0))}</strong></div><button type="button" className="cart-checkout" onClick={() => beginCheckout(null)}>Proceed to Checkout <span>→</span></button><p className="checkout-note">Prices and availability are checked by the server at checkout.</p></div>
      </>}
    </aside></div>}
    {accountSection && <AccountCenter pointsBalance={pointsBalance} policy={policy} section={accountSection} customer={customer} profile={profileData} onProfileChange={updateProfile} orders={orders} theme={theme} onThemeChange={setTheme} onClose={() => setAccountSection('')} />}
  </main>
}
