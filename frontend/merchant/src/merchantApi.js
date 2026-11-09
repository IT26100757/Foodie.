import { api } from './api.js'
const orderItemsCache = new Map()
async function cachedOrderItems(orderId) {
  const cached = orderItemsCache.get(orderId)
  if (cached && Date.now() - cached.time < 60000) return cached.items
  const items = await api('/api/orders/' + orderId + '/items')
  orderItemsCache.set(orderId, { time: Date.now(), items })
  return items
}
export async function loadMerchantOrders(){const [orders,payments]=await Promise.all([api('/api/orders'),api('/api/payments')]);return Promise.all(orders.map(async order=>({...order,id:String(order.id),backendStatus:order.status,status:({NEW:'New',PREPARING:'Preparing',READY:'Ready',ON_DELIVERY:'Out for delivery',DELIVERED:'Completed',PICKED_UP:'Completed',CANCELLED:'Cancelled'})[order.status] || order.status,statusClass:['DELIVERED','PICKED_UP'].includes(order.status)?'completed':order.status==='CANCELLED'?'cancelled':order.status==='NEW'?'new':'processing',serviceCharge:Number(payments.find(payment=>payment.orderId===order.id)?.commission || 0),items:await cachedOrderItems(order.id),date:order.createdAt?.slice(0,10),time:order.createdAt?new Date(order.createdAt).toLocaleTimeString():'',paymentType:order.paymentMethod,total:Number(order.total)-(order.customerAgreed?Number(order.additionalCharge):0),additionalCharge:Number(order.additionalCharge),customerAgreedToAdditionalCharges:order.customerAgreed,netTotal:Number(order.total)})))}
