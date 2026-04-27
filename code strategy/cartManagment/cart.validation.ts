// Define all input validation methods name and logic

// Zod ()
// Example

/* will validate add to cart inputs which are 

  export interface AddToCartInput {
  customerId: number;
  items: AddToCartItemInput{};
}

*/

/* 

 will validate update quantity inputs which are 

export interface ModifyCartInput {
  customerId: number;
  itemId: number;
  itemQuantity: number;
}

*/


/*
there is common input validation between add to cart and update quantity
which are 
customerId, item quantity, item id
so make common method to avoid duplication
*/