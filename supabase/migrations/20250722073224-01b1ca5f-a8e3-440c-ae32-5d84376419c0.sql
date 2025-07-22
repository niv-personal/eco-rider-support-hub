-- Update existing orders to reflect scooter orders
UPDATE public.orders SET
  product_name = CASE 
    WHEN order_number = 'ORD-2024-001' THEN 'Eco Rider Pro Electric Scooter'
    WHEN order_number = 'ORD-2024-002' THEN 'Eco Rider Urban Electric Scooter'
    WHEN order_number = 'ORD-2024-003' THEN 'Eco Rider Compact Electric Scooter'
    WHEN order_number = 'ORD-2024-004' THEN 'Eco Rider Sport Electric Scooter'
    WHEN order_number = 'ORD-2024-005' THEN 'Eco Rider Classic Electric Scooter'
  END,
  price = CASE 
    WHEN order_number = 'ORD-2024-001' THEN 899.99
    WHEN order_number = 'ORD-2024-002' THEN 649.99
    WHEN order_number = 'ORD-2024-003' THEN 449.99
    WHEN order_number = 'ORD-2024-004' THEN 799.99
    WHEN order_number = 'ORD-2024-005' THEN 599.99
  END,
  total_amount = CASE 
    WHEN order_number = 'ORD-2024-001' THEN 899.99
    WHEN order_number = 'ORD-2024-002' THEN 1299.98  -- quantity 2
    WHEN order_number = 'ORD-2024-003' THEN 1349.97  -- quantity 3
    WHEN order_number = 'ORD-2024-004' THEN 799.99
    WHEN order_number = 'ORD-2024-005' THEN 599.99
  END
WHERE order_number IN ('ORD-2024-001', 'ORD-2024-002', 'ORD-2024-003', 'ORD-2024-004', 'ORD-2024-005');