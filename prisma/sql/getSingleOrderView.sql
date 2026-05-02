CREATE MATERIALIZED VIEW single_order_details_MV AS
SELECT 
  o.id     AS order_id,
  o.customer_id,
  o.total_price,
  o.paid,
  o.timestamp,

  r.name        AS restaurant_name,
  pt.name       AS payment_method,
  a.state,
  a.city,
  a.street,
  os.name       AS order_status,

  od.menu_item_name As item_name,
  od.quantity,
  od.price

FROM "Order" o
JOIN "Restaurant" r ON o.restaurant_id = r.id
JOIN "PaymentIntegrationType" pt ON o.payment_type_id = pt.id
JOIN "Address" a ON o.address_id = a.id
JOIN "OrderStatus" os ON o.order_status_id = os.id
LEFT JOIN "OrderDetail" od ON od.order_id = o.id;