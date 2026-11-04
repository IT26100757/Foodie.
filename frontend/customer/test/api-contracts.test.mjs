import test from 'node:test'
import assert from 'node:assert/strict'
import { restaurantMenu, checkoutRequest, orderView } from '../src/customerApi.js'

test('same restaurant and product names do not merge different restaurant IDs or image references',()=>{
 const first={id:10,restaurantId:1,restaurant:'Same Kitchen',name:'Chicken Burger',price:1000,image:'https://res.cloudinary.com/test/image/upload/restaurant-1.png'}
 const second={id:20,restaurantId:2,restaurant:'Same Kitchen',name:'Chicken Burger',price:2000,image:'https://res.cloudinary.com/test/image/upload/restaurant-2.png'}
 assert.deepEqual(restaurantMenu([first,second],1),[first]);assert.deepEqual(restaurantMenu([first,second],2),[second]);assert.deepEqual(restaurantMenu([{name:'Chicken Burger',restaurant:'Same Kitchen'}],1),[])
})
test('cart submission uses permanent IDs and cannot combine restaurants',()=>{
 const line={id:'browser-local',menuItemId:10,restaurantId:1,quantity:2,price:0.01,size:'Large'}
 const request=checkoutRequest([line],{address1:'Test address'},'CASH')
 assert.deepEqual(request.items,[{menuItemId:10,quantity:2,size:'Large',specialInstructions:null}]);assert.equal(request.price,undefined);assert.equal(request.total,undefined)
 assert.throws(()=>checkoutRequest([line,{...line,restaurantId:2}],{address1:'Test address'}))
})
test('server fulfillment state controls displayed completion and earned rewards',()=>{
 const pending=orderView({order:{id:1,status:'NEW',points:5,deliveryFee:150,total:1150,subtotal:1000},items:[]})
 const completed=orderView({order:{id:1,status:'DELIVERED',points:5,deliveryFee:150,total:1150,subtotal:1000},items:[]})
 assert.equal(pending.points,0);assert.equal(pending.deliveryStatus,'Order Placed');assert.equal(completed.points,5);assert.equal(completed.deliveryStatus,'Delivered')
})
