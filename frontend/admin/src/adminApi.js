import { api } from './api.js'
export const statusLabel={NEW:'Confirmed',PREPARING:'Preparing',READY:'Ready',ON_DELIVERY:'Picked Up',DELIVERED:'Delivered',PICKED_UP:'Delivered',CANCELLED:'Cancelled'}

// Wait for completion before scheduling another refresh; hidden tabs do not poll.
export function pollWhileVisible(task, visibility=globalThis.document, delay=30000, clock=globalThis) {
 let stopped=false, running=false, timer=null
 const visible=()=>!visibility || visibility.visibilityState!=='hidden'
 const clear=()=>{if(timer!==null){clock.clearTimeout(timer);timer=null}}
 async function run(){
  if(stopped || running || !visible())return
  clear();running=true
  try{await task()}catch{/* Callers display their own request errors. */}
  finally{running=false;if(!stopped&&visible())timer=clock.setTimeout(run,delay)}
 }
 function changed(){clear();if(visible())void run()}
 visibility?.addEventListener('visibilitychange',changed)
 void run()
 return ()=>{stopped=true;clear();visibility?.removeEventListener('visibilitychange',changed)}
}

export async function platformData(view='Dashboard', previous={}, request=api){
 const paths={orders:'/api/admin/orders',restaurants:'/api/admin/restaurants',riders:'/api/admin/riders',users:'/api/admin/users',payments:'/api/admin/payments',refunds:'/api/admin/refunds',notifications:'/api/admin/notifications',statistics:'/api/admin/dashboard',account:'/api/account'}
 const screens={Dashboard:['orders','restaurants','riders','users','payments','statistics'],Orders:['orders','restaurants','users'],Customers:['users'],Restaurants:['restaurants'],'Delivery Riders':['riders'],Payments:['orders','users','payments'],Refunds:['orders','users','refunds']}
 const needed=[...new Set(['notifications',...(screens[view]||[])])]
 if(!previous.account)needed.push('account')
 const data={orders:previous._rawOrders||[],restaurants:previous.restaurants||[],riders:previous.riders||[],users:previous.users||[],payments:previous._payments||[],refunds:previous._refunds||[],notifications:[],statistics:previous.statistics||{},account:previous.account}
 // Bound concurrent reads instead of flooding the backend connection pool.
 for(let index=0;index<needed.length;index+=3)await Promise.all(needed.slice(index,index+3).map(async key=>{data[key]=await request(paths[key])}))
 const {orders,restaurants,riders,users,payments,refunds,notifications,statistics,account}=data
 const people=new Map(users.map(user=>[user.id,user]));const stores=new Map(restaurants.map(restaurant=>[restaurant.restaurantId,restaurant]));const rawOrders=new Map(orders.map(order=>[order.id,order]));
 const itemCache=new Map(previous._itemCache||[])
 const withItems=view==='Dashboard'||view==='Orders'?orders:[]
 for(const order of withItems){const entry=itemCache.get(order.id);if(!entry || Date.now()-entry.time>60000)itemCache.set(order.id,{time:Date.now(),items:await request('/api/orders/'+order.id+'/items')})}
 const validIds=new Set(orders.map(order=>order.id));for(const id of itemCache.keys())if(!validIds.has(id))itemCache.delete(id)
 const rows=orders.map(order=>{const user=people.get(order.customerId);const items=itemCache.get(order.id)?.items||[];return {...order,id:String(order.id),customer:user?[user.firstName,user.lastName].join(' '):order.contactName || '',restaurant:stores.get(order.restaurantId)?.restaurantName || '',items:items.map(item=>item.quantity+' × '+item.name).join(', '),amount:'Rs. '+Number(order.total).toLocaleString(),placedDate:order.createdAt?.slice(0,10),ago:new Date(order.createdAt).toLocaleString(),status:statusLabel[order.status] || order.status,backendStatus:order.status}})
 const paymentRows=payments.map(payment=>{const order=rawOrders.get(payment.orderId);const user=people.get(order?.customerId);return {...payment,id:String(payment.id),customer:user?[user.firstName,user.lastName].join(' '):order?.contactName || '',amount:Number(payment.amount),paidDate:(payment.collectedAt || order?.createdAt)?.slice(0,10),orderStatus:order?.status,status:payment.status==='COLLECTED'?'COMPLETED':payment.status}})
 const refundRows=refunds.map(refund=>{const user=people.get(refund.customerId),order=rawOrders.get(refund.orderId);return {...refund,id:String(refund.id),customer:user?[user.firstName,user.lastName].join(' '):'',email:user?.email || '',phone:user?.phone || '',amount:Number(order?.total || 0),method:order?.paymentMethod,requestedDate:refund.requestedAt?.slice(0,10)}})
 return {_view:view,_payments:payments,_refunds:refunds,_rawOrders:orders,_itemCache:itemCache,orders:rows,restaurants,riders,users,payments:paymentRows,refunds:refundRows,notifications:notifications.map(note=>({...note,unread:!note.read,time:new Date(note.createdAt).toLocaleString()})),statistics,account}
}
