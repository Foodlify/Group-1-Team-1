// Define all services related to Cart and their logic

/* -----place order---------------- Radwa --------------------
cash 

input 
customerId middleware
-- get cartId to get order order details--- cart service
-- valid quantity and price of menuitem in existing cart--- to check change

-- addressId ---> valid in address table---- customer service
-- payment method--- payment service--(method) pending
-- insert order 
-- insert order details
-- preferred date validation

-- return orderId + order summary

 */

/*
 --------- update order status ------- Sara----------
 pending--->proceed---->out for delivery---> delivered
 pending----> cancelled
 Design pattern---> state machine pattern
   input:
   -- order id
   -- status 
  check order id in orders table by customerId
  ok--- update

  if status--delivered----> insert summary
  return 
  orderId
  */

/*
 ---------cancel order------- Sara----------
input
orderId
order check in order table
check status---> all status can be cancelled except delivered

return 
orderId
  */

/*
 --------- track order status ----------- Zahra------

 listen status of order
 insert in track order

 input
 orderid
 order check in order table
 return 
 status list


  */


/*
 ------------view order details---------- Radwa -----
  input
 orderid
 order check in order table
 return 
 orderId
 order details list

  */
/*

/*
 ------------ list  all orders history by summary table ----------- Sara-----

  input
  customerId
 return 
   order summary list
  */

/*
 --------------- list customer orders used in query ---------- Sara-----
order,  order details by customer Id
//  query=?
 */

/*

  */
