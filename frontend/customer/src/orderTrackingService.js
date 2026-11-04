import { api } from './api.js'
import { loadOrder } from './customerApi.js'
export function subscribeToOrder(orderId,onUpdate,onUnavailable){let active=true;async function refresh(){try{const order=await loadOrder(orderId);if(active)onUpdate({...order,status:order.deliveryStatus})}catch(error){if(active)onUnavailable?.(error)}}refresh();const timer=setInterval(refresh,4000);return()=>{active=false;clearInterval(timer)}}
export function mountTrackingMap(){return null}
export async function saveOrderUpdate(order){return {connected:true,result:await loadOrder(order.id)}}
export async function confirmDelivery(order){const current=await loadOrder(order.id);if(current.backendStatus!=='DELIVERED')throw new Error('Only the assigned driver can record delivery.');return {connected:true,result:current}}
