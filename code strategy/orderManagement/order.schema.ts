/*
------------------Sara-------------------------------------------------------------------
  order
  -- orderId
  -- customerId  FK
  -- restaurantId FK
  -- addressId    FK
  -- preferred date
  -- total price
  -- payment_type_Id  FK
  -- paid boolean
  -- timestamp


  order_details
  --orderDetailId
  -- orderId  FK
  -- menuItemId  FK
  -- price  
  -- quantity
  --Total price (add as column or calculate)

 order-tracking ------> events of order status----track page
 -- orderId,
 -- statusId FK
 -- status date

  order-summary
 -- restaurant name
 -- total amount
 -- total quantity
 -- order date
 -- orderId  FK

 */
/* 
==========================================================================================

------------------Zahraa-------------------------------------------------------------------

payment-configuration
-- pay-integrationId
-- config-details json


transaction
-- orderId
-- transaction_number
-- amount
-- statusId 
-- pay-integrationId

=========================================================================
 */

/*
------------------Radwa-------------------------------------------------------------------
seeders
1- order-status
2- transaction-status
3- payment-integration_types
4- address

 order status enum [
   pending
   confirmed, 
   processed,
   ready-to-pickup,
   outFor Delivery,
   delivered, 
   cancelled,
   refunded
 ]

 transaction-status  [ pending ,failed ,succeeded, refund]

 payment-integration_type [ CASH, CARD, WALLET, STRIPE, PAYPAL ]
 -- id
 -- name


 address
  -- customerId
  -- street     String
  -- city       String
  -- state      String?
  -- country    String
  -- postalCode String?
*/


/*
ask Eng Ahmed
==================================================================
transaction-details
What add here 
-- request
-- response
=================================================================


================================================================================================
 -- estimate-date (from 5:00 - 5:30) // info appear in track page, but in tracking-table
 will be repeated in all status, as we write the table as event sourcing style.
 Where put it?, is needed?

=============================================================================================
*/