import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from './api.js'

const blankItem = () => ({ name: '', category: '', description: '', image: '', sizesEnabled: false, sizes: { Small: { selected: false, price: '' }, Medium: { selected: false, price: '' }, Large: { selected: false, price: '' } }, price: '', available: true, zoom: 1, focalX: 50, focalY: 50 })
const sizeNames = ['Small', 'Medium', 'Large']
const filterIconPaths = {
  category: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  availability: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
  sort: <path d="M8 17V7m0 0L5 10m3-3 3 3M16 7v10m0 0 3-3m-3 3-3-3" />,
}
function Icon({ name, size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">{filterIconPaths[name]}</svg>
}

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [restaurantId,setRestaurantId]=useState(null)
  async function loadMenu(){const restaurants=await api('/api/restaurants/mine');const id=restaurants[0]?.id;if(!id)throw new Error('Restaurant profile required.');setRestaurantId(id);const rows=await api('/api/restaurants/'+id+'/menu/manage');setItems(rows.map(item=>({...blankItem(),...item,sizes:{...blankItem().sizes,...item.sizes}})))}
  useEffect(()=>{loadMenu().catch(error=>window.alert(error.message))},[])
  async function toggleAvailability(item){try{await api('/api/menu-items/'+item.id,{method:'POST',body:{...item,available:!item.available}});await loadMenu()}catch(error){window.alert(error.message)}}

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(blankItem)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [availabilityFilter, setAvailabilityFilter] = useState('All items')
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const availabilityFilterRef = useRef(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryFilterRef = useRef(null)
  const [sortBy, setSortBy] = useState('Recently added')
  const [sortOpen, setSortOpen] = useState(false)
  const sortFilterRef = useRef(null)
  const [imageError, setImageError] = useState('')
  const [formError, setFormError] = useState('')
  const fileRef = useRef(null)
  const firstField = useRef(null)

  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.activeElement
    firstField.current?.focus()
    function onKey(event) {
      if (event.key === 'Escape') closeDrawer()
      if (event.key === 'Tab') {
        const panel = document.querySelector('.menu-drawer')
        const focusable = panel?.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')
        if (!focusable?.length) return
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus() }
        else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('menu-drawer-open')
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('menu-drawer-open'); previous?.focus?.() }
    // Focus handling runs when the drawer opens/closes.
  }, [drawerOpen])

  useEffect(() => {
    if (!availabilityOpen) return
    function closeOutside(event) {
      if (!availabilityFilterRef.current?.contains(event.target)) setAvailabilityOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setAvailabilityOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [availabilityOpen])
  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items])
  useEffect(() => {
    if (!sortOpen) return
    function closeOutside(event) {
      if (!sortFilterRef.current?.contains(event.target)) setSortOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setSortOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [sortOpen])
  useEffect(() => {
    if (!categoryOpen) return
    function closeOutside(event) {
      if (!categoryFilterRef.current?.contains(event.target)) setCategoryOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setCategoryOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [categoryOpen])
  const categoryOptions = [...new Set(['All categories', 'Food', 'Beverages', 'Starters', 'Desserts', ...categories.filter((category) => !['Beverages', 'Desserts'].includes(category))])]
  const selectedQuickCategory = categoryFilter === 'All categories' ? 'All items' : ['Food', 'Beverages', 'Starters', 'Desserts'].includes(categoryFilter) ? categoryFilter : ['Appetizers', 'Sides'].includes(categoryFilter) ? 'Starters' : categoryFilter === 'Beverages' ? 'Beverages' : categoryFilter === 'Desserts' ? 'Desserts' : 'Food'
  const filtered = items.filter((item) => {
    const matchesText = `${item.name} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase())
    const category = item.category.toLowerCase()
    const matchesCategory = categoryFilter === 'All categories' || (categoryFilter === 'Food' && !['beverages', 'desserts'].includes(category)) || (categoryFilter === 'Beverages' && category === 'beverages') || (categoryFilter === 'Starters' && ['appetizers', 'sides'].includes(category)) || (categoryFilter === 'Desserts' && category === 'desserts') || item.category === categoryFilter
    return matchesText && matchesCategory && (availabilityFilter === 'All items' || (availabilityFilter === 'Available' ? item.available : !item.available))
  })
  const orderedItems = [...filtered]
  if (sortBy === 'Name A–Z') orderedItems.sort((a, b) => a.name.localeCompare(b.name))
  else orderedItems.reverse()

  function closeDrawer() { setDrawerOpen(false); setFormError('') }
  function openNew() { setEditingId(null); setDraft(blankItem()); setImageError(''); setFormError(''); setDrawerOpen(true) }
  function editItem(item) { setEditingId(item.id); setDraft({ ...item, sizes: { ...item.sizes } }); setImageError(''); setFormError(''); setDrawerOpen(true) }
  function change(key, value) { setDraft((current) => ({ ...current, [key]: value })) }
  function setSize(name, key, value) { setDraft((current) => ({ ...current, sizes: { ...current.sizes, [name]: { ...current.sizes[name], [key]: value } } })) }
  function loadImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setImageError('Choose an image file.'); return }
    if (file.size > 8 * 1024 * 1024) { setImageError('Choose an image smaller than 8 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { change('image', reader.result); setImageError('') }
    reader.onerror = () => setImageError('This image could not be opened. Try another file.')
    reader.readAsDataURL(file)
    event.target.value = ''
  }
  async function save(event) {
    event.preventDefault()
    const price = Number(draft.price)
    if (!draft.name.trim() || !draft.category) { setFormError('Enter an item name and choose a category.'); return }
    if (draft.sizesEnabled) {
      const selected = sizeNames.filter((size) => draft.sizes[size].selected)
      if (!selected.length || selected.some((size) => draft.sizes[size].price === '' || Number(draft.sizes[size].price) < 0)) { setFormError('Select at least one size and enter a price for each selected size.'); return }
    } else if (draft.price === '' || !Number.isFinite(price) || price < 0) { setFormError('Enter a valid standard price.'); return }
    try {
      const saved=await api('/api/menu-items/'+(editingId || crypto.randomUUID()),{method:'POST',body:{...draft,restaurantId,name:draft.name.trim(),description:draft.description.trim()}})
      if(!Number.isInteger(saved.id))throw new Error('Server did not return a database menu ID.')
      await loadMenu();closeDrawer()
    }catch(error){setFormError(error.message)}
  }

  return <div className="dashboard-content section-content menu-content">
    <div className="dashboard-heading-row menu-heading"><div><span className="dashboard-kicker">MENU MANAGEMENT</span><h1>Menu<span>.</span></h1><p>Manage the items customers can order from your restaurant.</p></div><button type="button" className="menu-add-button" onClick={openNew}><span aria-hidden="true">＋</span> Add Menu Item</button></div>
    <div className="menu-category-tabs" role="group" aria-label="Quick menu categories">{['All items', 'Food', 'Beverages', 'Starters', 'Desserts'].map((category) => <button type="button" key={category} className={selectedQuickCategory === category ? 'selected' : ''} aria-pressed={selectedQuickCategory === category} onClick={() => setCategoryFilter(category === 'All items' ? 'All categories' : category)}>{category}</button>)}</div>
    <section className="menu-toolbar" aria-label="Menu item filters"><label className="menu-search"><span className="menu-search-icon" aria-hidden="true">⌕</span><span className="sr-only">Search menu items</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu items..." /></label><div className="menu-filter-dropdown" ref={categoryFilterRef}><button className={`menu-filter-trigger ${categoryOpen ? 'open' : ''}`} type="button" aria-haspopup="listbox" aria-expanded={categoryOpen} aria-label={`Category filter: ${categoryFilter}`} onClick={() => setCategoryOpen((open) => !open)}><span className="menu-filter-icon" aria-hidden="true"><Icon name="category" size={15} /></span><span>{categoryFilter}</span><span className="menu-filter-chevron" aria-hidden="true">⌄</span></button>{categoryOpen && <div className="menu-filter-popover" role="listbox" aria-label="Filter by category">{categoryOptions.map((option) => <button className={`menu-filter-option ${categoryFilter === option ? 'selected' : ''}`} type="button" role="option" aria-selected={categoryFilter === option} key={option} onClick={() => { setCategoryFilter(option); setCategoryOpen(false) }}><span>{option}</span><i aria-hidden="true">{categoryFilter === option ? '✓' : ''}</i></button>)}</div>}</div><div className="menu-filter-dropdown" ref={availabilityFilterRef}><button className={`menu-filter-trigger ${availabilityOpen ? 'open' : ''}`} type="button" aria-haspopup="listbox" aria-expanded={availabilityOpen} aria-label={`Availability filter: ${availabilityFilter}`} onClick={() => setAvailabilityOpen((open) => !open)}><span className="menu-filter-icon" aria-hidden="true"><Icon name="availability" size={15} /></span><span>{availabilityFilter}</span><span className="menu-filter-chevron" aria-hidden="true">⌄</span></button>{availabilityOpen && <div className="menu-filter-popover" role="listbox" aria-label="Filter by availability">{['All items', 'Available', 'Unavailable'].map((option) => <button className={`menu-filter-option ${availabilityFilter === option ? 'selected' : ''}`} type="button" role="option" aria-selected={availabilityFilter === option} key={option} onClick={() => { setAvailabilityFilter(option); setAvailabilityOpen(false) }}><span>{option}</span><i aria-hidden="true">{availabilityFilter === option ? '✓' : ''}</i></button>)}</div>}</div><div className="menu-filter-dropdown menu-sort-filter" ref={sortFilterRef}><button className={`menu-filter-trigger ${sortOpen ? 'open' : ''}`} type="button" aria-haspopup="listbox" aria-expanded={sortOpen} aria-label={`Sort menu items: ${sortBy}`} onClick={() => setSortOpen((open) => !open)}><span className="menu-filter-icon" aria-hidden="true"><Icon name="sort" size={15} /></span><span>{sortBy}</span><span className="menu-filter-chevron" aria-hidden="true">⌄</span></button>{sortOpen && <div className="menu-filter-popover" role="listbox" aria-label="Sort menu items">{['Recently added', 'Name A–Z'].map((option) => <button className={`menu-filter-option ${sortBy === option ? 'selected' : ''}`} type="button" role="option" aria-selected={sortBy === option} key={option} onClick={() => { setSortBy(option); setSortOpen(false) }}><span>{option}</span><i aria-hidden="true">{sortBy === option ? '✓' : ''}</i></button>)}</div>}</div></section>
    <section className="menu-items-area" aria-live="polite">
      {items.length === 0 ? <div className="menu-empty dashboard-card"><span className="menu-empty-icon" aria-hidden="true">✳</span><h2>Your menu starts here</h2><p>Add your first menu item to begin building your restaurant’s menu.</p><button className="menu-add-button menu-empty-button" type="button" onClick={openNew}>＋ Add Menu Item</button></div> : filtered.length === 0 ? <div className="menu-no-results dashboard-card"><span className="menu-empty-icon" aria-hidden="true">⌕</span><h2>No matching items</h2><p>Try adjusting your search or filters.</p><button type="button" className="menu-text-button" onClick={() => { setQuery(''); setCategoryFilter('All categories'); setAvailabilityFilter('All items'); setSortBy('Recently added') }}>Clear filters</button></div> : <div className="menu-item-grid">{orderedItems.map((item) => <article className="menu-item-card dashboard-card" key={item.id}><div className="menu-item-image">{item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">✳</span>}<span className={`menu-availability ${item.available ? 'is-available' : ''}`}><i />{item.available ? 'Available' : 'Unavailable'}</span></div><div className="menu-item-copy"><div className="menu-item-title"><div><span className="menu-category-tag">{item.category}</span><h2>{item.name}</h2></div><button type="button" className="menu-edit-button" onClick={() => editItem(item)} aria-label={`Edit ${item.name}`}>Edit</button></div>{item.description && <p className="menu-item-description">{item.description}</p>}<div className="menu-item-footer"><span>{item.sizesEnabled ? sizeNames.filter((size) => item.sizes[size].selected).map((size) => `${size} · ${item.sizes[size].price}`).join('  /  ') : `Standard · ${item.price}`}</span><button type="button" className={`availability-toggle ${item.available ? 'on' : ''}`} role="switch" aria-checked={item.available} aria-label={`${item.available ? 'Mark' : 'Make'} ${item.name} ${item.available ? 'unavailable' : 'available'}`} onClick={()=>toggleAvailability(item)}><i /></button></div></div></article>)}</div>}
    </section>
    {drawerOpen && <div className="menu-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDrawer() }}><aside className="menu-drawer" role="dialog" aria-modal="true" aria-labelledby="menu-drawer-title"><header className="menu-drawer-header"><div><span className="dashboard-kicker">MENU MANAGEMENT</span><h2 id="menu-drawer-title">{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2><p>Add the details customers will see on your menu.</p></div><button type="button" className="menu-close-button" onClick={closeDrawer} aria-label="Close panel">×</button></header>
      <form className="menu-drawer-form" onSubmit={save} noValidate><div className="menu-drawer-fields">
        <section className="menu-form-section"><div className="menu-form-section-title"><span>1</span><div><h3>Item image</h3><p>Help customers see what they're ordering.</p></div></div><div className="menu-image-control"><button className="menu-image-crop" type="button" onClick={() => fileRef.current?.click()} aria-label={draft.image ? 'Choose a different item image' : 'Upload an item image'}>{draft.image ? <img src={draft.image} alt="Image crop preview" style={{ transform: `scale(${draft.zoom})`, objectPosition: `${draft.focalX}% ${draft.focalY}%` }} /> : <span className="menu-image-placeholder"><b>＋</b><small>Upload photo</small></span>}</button><div className="menu-image-actions"><button type="button" className="menu-upload-button" onClick={() => fileRef.current?.click()}>{draft.image ? 'Change photo' : 'Upload photo'}</button><span>PNG or JPG · up to 8 MB</span>{draft.image && <><label className="menu-zoom-control">Zoom<input type="range" min="1" max="2.5" step="0.05" value={draft.zoom} onChange={(event) => change('zoom', Number(event.target.value))} aria-label="Adjust image zoom" /></label><label className="menu-zoom-control">Reposition<input type="range" min="0" max="100" value={draft.focalX} onChange={(event) => change('focalX', Number(event.target.value))} aria-label="Reposition image horizontally" /></label><label className="menu-zoom-control"><span className="sr-only">Vertical position</span><input type="range" min="0" max="100" value={draft.focalY} onChange={(event) => change('focalY', Number(event.target.value))} aria-label="Reposition image vertically" /></label></>}{imageError && <span className="menu-inline-error" role="alert">{imageError}</span>}<input ref={fileRef} type="file" accept="image/*" onChange={loadImage} hidden /></div></div></section>
        <section className="menu-form-section"><div className="menu-form-section-title"><span>2</span><div><h3>Item details</h3><p>Give your dish a name and a little context.</p></div></div><label className="menu-field"><span>Item name <b>*</b></span><input ref={firstField} maxLength="80" value={draft.name} onChange={(event) => change('name', event.target.value)} placeholder="e.g. Classic Beef Burger" /></label><label className="menu-field"><span>Category <b>*</b></span><select value={draft.category} onChange={(event) => change('category', event.target.value)}><option value="">Select a category</option><option>Appetizers</option><option>Main course</option><option>Sides</option><option>Desserts</option><option>Beverages</option><option>Other</option></select></label><label className="menu-field"><span>Short description <small>Optional</small></span><textarea rows="3" maxLength="180" value={draft.description} onChange={(event) => change('description', event.target.value)} placeholder="A short description to help customers decide..." /><small className="menu-character-count">{draft.description.length}/180</small></label></section>
        <section className="menu-form-section"><div className="menu-form-section-title"><span>3</span><div><h3>Pricing &amp; sizes</h3><p>Set a standard price or offer size choices.</p></div></div><div className="menu-switch-row"><span><strong>Size variations</strong><small>Offer different sizes with individual prices</small></span><button type="button" className={`settings-switch ${draft.sizesEnabled ? 'on' : ''}`} role="switch" aria-checked={draft.sizesEnabled} aria-label="Enable size variations" onClick={() => change('sizesEnabled', !draft.sizesEnabled)}><span /></button></div>{draft.sizesEnabled ? <div className="menu-size-list">{sizeNames.map((size) => <div className={`menu-size-row ${draft.sizes[size].selected ? 'selected' : ''}`} key={size}><label><input type="checkbox" checked={draft.sizes[size].selected} onChange={(event) => setSize(size, 'selected', event.target.checked)} /><span className="menu-checkbox" />{size}</label>{draft.sizes[size].selected && <label className="menu-size-price"><span className="sr-only">{size} price</span><span>LKR</span><input type="number" min="0" step="0.01" value={draft.sizes[size].price} onChange={(event) => setSize(size, 'price', event.target.value)} placeholder="0.00" /></label>}</div>)}</div> : <label className="menu-field menu-standard-price"><span>Standard price <b>*</b></span><div className="menu-price-input"><span>LKR</span><input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => change('price', event.target.value)} placeholder="0.00" /></div></label>}</section>
        <section className="menu-form-section menu-availability-section"><div className="menu-form-section-title"><span>4</span><div><h3>Availability</h3><p>Control whether customers can order this item.</p></div></div><div className="menu-switch-row"><span><strong>Available to order</strong><small>{draft.available ? 'Customers can see and order this item.' : 'This item is hidden from ordering.'}</small></span><button type="button" className={`settings-switch ${draft.available ? 'on' : ''}`} role="switch" aria-checked={draft.available} aria-label="Item available to order" onClick={() => change('available', !draft.available)}><span /></button></div></section>
        {formError && <p className="menu-form-error" role="alert">{formError}</p>}
      </div><footer className="menu-drawer-footer"><button type="button" className="menu-cancel-button" onClick={closeDrawer}>Cancel</button><button type="submit" className="menu-save-button">{editingId ? 'Save Changes' : 'Save Menu Item'} <span aria-hidden="true">→</span></button></footer></form>
    </aside></div>}
  </div>
}
