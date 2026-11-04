function normalizeOffer(offer) {
  const restaurant = offer.restaurant || {}
  const item = offer.menuItem || offer.item || {}
  return {
    ...offer,
    id: String(offer.id ?? offer.offerId ?? offer.code ?? crypto.randomUUID()),
    restaurantName: offer.restaurantName ?? restaurant.name ?? 'Restaurant',
    restaurantRating: offer.restaurantRating ?? restaurant.rating ?? '',
    cuisine: offer.cuisine ?? restaurant.cuisine ?? restaurant.type ?? '',
    itemName: offer.itemName ?? item.name ?? offer.targetName ?? 'Selected items',
    category: offer.category ?? item.category ?? offer.foodCategory ?? 'Others',
    title: offer.title ?? offer.name ?? offer.offerName ?? 'Special offer',
    description: offer.description ?? offer.detail ?? '',
    offerType: offer.offerType ?? offer.discountLabel ?? offer.discountType ?? 'Special offer',
    discountType: offer.discountType ?? offer.type ?? '',
    price: offer.price ?? item.price ?? null,
    originalPrice: offer.originalPrice ?? item.originalPrice ?? null,
    code: offer.code ?? offer.offerCode ?? '',
    conditions: offer.conditions ?? offer.terms ?? offer.description ?? '',
    image: offer.image ?? offer.imageUrl ?? item.imageUrl ?? restaurant.imageUrl ?? '',
    expiresAt: offer.expiresAt ?? offer.validUntil ?? offer.endDate ?? null,
    enabled: offer.enabled ?? offer.isEnabled ?? true,
    published: offer.published ?? offer.isPublished ?? offer.status === 'PUBLISHED',
  }
}

export async function loadCustomerOffers(signal) {
  const endpoint = import.meta.env.VITE_CUSTOMER_OFFERS_API_URL || '/api/customer/offers'
  try {
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, signal })
    if (!response.ok) throw new Error(`Offers request failed (${response.status})`)
    const payload = await response.json()
    const records = Array.isArray(payload) ? payload : payload.offers ?? payload.content ?? []
    return { source: 'api', offers: records.map(normalizeOffer).filter((offer) => offer.enabled && offer.published) }
  } catch (error) {
    if (signal?.aborted) throw error
    throw error
  }
}
