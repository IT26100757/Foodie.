import { api } from './api.js'
export const stages = { NEW: 'Order Placed', PREPARING: 'Preparing', READY: 'Preparing', ASSIGNED: 'Preparing', ON_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', PICKED_UP: 'Delivered', CANCELLED: 'Cancelled' }
export function checkoutRequest(cart, details, payment = 'CASH', offer = null, redeemPoints = false) {
 const restaurantIds = [...new Set(cart.map(item => Number(item.restaurantId)))]
 if(restaurantIds.length!==1 || !restaurantIds[0]) throw new Error('Your cart must contain published items from one restaurant. Please add the items again.')
 return { restaurantId:restaurantIds[0], type:'DELIVERY', deliveryAddress: [details.address1,details.address2,details.address3,details.city,details.postalCode].filter(Boolean).join(', '), paymentMethod:payment, offerCode:offer?.code || null, redeemPoints, items:cart.map(item=>({menuItemId:Number(item.menuItemId),quantity:item.quantity,size:item.size || item.variants?.Size || null,specialInstructions:item.specialInstructions || null})) }
}
export function orderView(payload) {
 const o=payload.order || payload
 const items=(payload.items || []).map(item=>({...item,id:String(item.id),price:Number(item.unitPrice),restaurant:payload.restaurant?.name || ''}))
 return {...o,id:String(o.id),items,restaurant:payload.restaurant?.name || '',restaurantCuisine:payload.restaurant?.cuisine || '',total:Number(o.total),netTotal:Number(o.total),subtotal:Number(o.subtotal),additionalCharges:Number(o.deliveryFee)+Number(o.additionalCharge || 0)*(o.customerAgreed?1:0),deliveryStatus:stages[o.status] || o.status,backendStatus:o.status,paymentType:o.paymentMethod,paymentMethod:o.paymentMethod,paymentStatus:o.paymentStatus,points:['DELIVERED','PICKED_UP'].includes(o.status)?o.points:0,driver:payload.driver || null,address:{address1:o.deliveryAddress},deliveryAddress:{address1:o.deliveryAddress},customer:{name:o.contactName || '',phone:o.contactPhone || '',email:o.contactEmail || ''},date:o.createdAt?.slice(0,10),time:o.createdAt?new Date(o.createdAt).toLocaleTimeString():''}
}
export function guestReferences(){try{return JSON.parse(localStorage.getItem('foodie.guest.order-access') || '[]')}catch{return []}}
export async function loadOrder(id) {
 const guest=guestReferences().find(item=>String(item.id)===String(id))
 const payload=guest?await api('/api/guest/orders/'+id,{headers:{'X-Guest-Token':guest.token}}):await api('/api/orders/'+id+'/tracking')
 return orderView(payload)
}
export async function loadOrders(customer) {
 if(customer){const orders=await api('/api/orders');return Promise.all(orders.map(o=>loadOrder(o.id)))}
 return Promise.all(guestReferences().map(o=>loadOrder(o.id)))
}
export async function placeOrder(cart, details, offer, redeemPoints, customer, requestKey) {
 const body=checkoutRequest(cart,details.address,details.paymentMethod==='Cash on delivery'?'CASH':'CARD',offer,redeemPoints)
 body.contact=details.customer
 const payload=customer?await api('/api/orders',{method:'POST',headers:{'Idempotency-Key':requestKey},body}):await api('/api/guest/orders',{method:'POST',headers:{'Idempotency-Key':requestKey},body:{order:body,...details.customer}})
 const order=payload.order || payload
 if(payload.accessToken){const refs=guestReferences();refs.push({id:order.id,token:payload.accessToken});localStorage.setItem('foodie.guest.order-access',JSON.stringify(refs))}
 return loadOrder(order.id)
}

export function restaurantMenu(records,restaurantId){return records.filter(item=>item.restaurantId!=null && Number(item.restaurantId)===Number(restaurantId))}

export async function acceptAdditionalCharge(order) {
 const guest=guestReferences().find(item=>String(item.id)===String(order.id))
 const path=guest?'/api/guest/orders/'+order.id+'/additional-charge/consent':'/api/orders/'+order.id+'/additional-charge/consent'
 await api(path,{method:'POST',headers:guest?{'X-Guest-Token':guest.token}:{},body:{amount:Number(order.additionalCharge)}})
 return loadOrder(order.id)
}
