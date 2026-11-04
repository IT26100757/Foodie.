export const DEMO_RESTAURANTS = []
export function mapMerchantRestaurant(record) {
  const name = record.name || record.restaurantName || record.merchantName || 'Restaurant'
  const slug = record.slug || String(record.id ?? name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const rating = record.rating == null ? '' : String(record.rating)
  return {
    ...record,
    id: record.id ?? slug,
    name,
    slug,
    type: record.type || record.cuisine || record.category || record.description || '',
    bannerImage: record.bannerImage || record.coverImage || record.banner || record.cover || '',
    logoImage: record.logoImage || record.logoUrl || record.logo || '',
    rating,
    time: record.deliveryTime || record.estimatedDeliveryTime || record.time || '',
    price: record.deliveryFee != null ? `Rs. ${record.deliveryFee}` : record.price || '',
    icon: record.icon || '♨',
    color: record.color || 'coral',
  }
}

export async function fetchMerchantRestaurants() {
  const response = await fetch('/api/restaurants')
  if (!response.ok) throw new Error(`Restaurant API returned ${response.status}`)
  const records = await response.json()
  if (!Array.isArray(records)) throw new Error('Restaurant API must return a list')
  const policiesResponse=await fetch('/api/customer/policies');const policies=policiesResponse.ok?await policiesResponse.json():{}
  return Promise.all(records.map(async record=>{const response=await fetch('/api/reviews/restaurant/'+record.id);const reviews=response.ok?await response.json():[];return mapMerchantRestaurant({...record,deliveryFee:policies.delivery_fee,rating:reviews.length?(reviews.reduce((sum,review)=>sum+review.rating,0)/reviews.length).toFixed(1)+' ('+reviews.length+')':''})}))
}
