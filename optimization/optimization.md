# 📈 SQL Query Optimization Report – Foodlify App

This document outlines SQL query performance improvements implemented across various modules in the food delivery app. The results are based on performance tests run on a dataset simulating production-scale data.

## 🔢 Seeded Data Overview

| Table Name | Number of Records Seeded |
| ---------- | ------------------------ |
| USER       | 110,000                  |
| CUSTOMER   | 100,000                  |
| RESTAURANT | 10,000                   |
| MENU       | 10,000                   |
| MENUITEM   | 300,000                  |
| CART       | 100,000                  |
| CART_ITEM  | 300,000                  |

---

## 🛒 **CART Module**

### 🔹 Function Name: `findCartByCustomerId`

- **Query Description**: Fetch the latest cart with its cart Items for a customer
- **SQL Query**:

  ```sql
  SELECT
    c.id,
    ci.id AS cart_item_id,
    ci.quantity,
    ci.price,
    ci.name
  FROM "Cart" c
  LEFT JOIN "CartItem" ci
    ON c.id = ci.cart_id
  WHERE c.customer_id = $1;
  ```

- **Time Before Optimization**: 22.025 ms
- **Optimization Technique**:
  - Selected only required columns from both tables `cart` &`cartItem`
  - Created index : `CREATE INDEX idx_cart_customer_id ON cart(customer_id)`
  - Created composite index : `CREATE INDEX idx_cartitem_cart_id_menu_item_id ON cartItem(cart_id, menu_item_id)`

- **Time After Optimization**: 0.023 ms


[Cart Optimization Report](https://raw.githack.com/Foodlify/Group-1-Team-1/optimization/optimization/cart.optimization%20report.html)
