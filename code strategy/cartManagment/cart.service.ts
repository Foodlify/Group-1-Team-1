// Define all services related to Cart and their logic

/* -----add to cart----------------------------------------
 1- find customer by customerId---- will be removed later when auth service added
 1- get customerId from token
 2- find restaurant by restaurantId
 3- find cart by customerId
      if cart found ----> enforce single restaurant rule
      if cart not found, create new empty cart
 4- then move to cart items that come from input
      check if the coming item id in menuItem table
         if found ---> i get the following info {restaurant id, quantity, price} from menuitem table and menu table
      check if the  returned restaurant id is same input restaurant id
      check if the  returned quantity is  > than input quantity
 5- insert cartItem to cartItems table
 6- return response data
 */


/*
restaurantId is critical for single restaurant enforce----> 
so it must added to cart table to avoid, its coming from frontend,
and multiple join between menuItem, menu tables ..... this for existing cart
but if cart is created for first time, we can add resturantId also as attribute in menuitem table,
so use only one get query from menuitem table using menuItem id that come in request body


*/

/*
 ---------view cart-----------------
   1- find cart by customerId
   2- return cart with its cartItems
  */

/*
 ------------update quantity----------------
   1- find cart by customerId
   2- find cartItem from cartItems table by its cartId and itemId
   3- find cartItem from menuItems table by its itemId
        if found ----> i get the following info {quantity}
        to compare with input quantity
   4- if quantity < menuItem quantity ---> update item in cartItems table
   5- return response data 
  */


/*
 --------delete Item----------------------
   1- find cart by customerId
   2- find cartItem from cartItems table by its cartId and itemId
       if found ---> delete item from cartItems table
   5- return response data 
 */


/*
 --------Calc Total Amount--------------
   1- find cart by customerId
   2- find all its cartItems from cartItems table by its cartId
       if found ---> make loop over them and calculate total price
   5- return  total price
 */

/*
 --------------Calc Total quantity ---------------------
   1- find cart by customerId
   2- find all its cartItems from cartItems table by its cartId
       if found ---> make loop over them and calculate total quantity
   5- return  total quantity
 */


  /*
  At end we define duplicate code and try to custom it
  */