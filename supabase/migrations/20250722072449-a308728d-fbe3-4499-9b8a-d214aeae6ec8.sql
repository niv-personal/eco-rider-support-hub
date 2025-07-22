-- Insert 5 default orders for demonstration
INSERT INTO public.orders (
  customer_id, 
  order_number, 
  product_name, 
  quantity, 
  price, 
  total_amount, 
  status, 
  order_date, 
  tracking_number,
  delivery_date
) VALUES 
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-001',
  'Premium Headphones',
  1,
  199.99,
  199.99,
  'delivered',
  '2024-01-15T10:30:00Z',
  'TRK123456789',
  '2024-01-20T14:00:00Z'
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-002', 
  'Wireless Mouse',
  2,
  49.99,
  99.98,
  'pending',
  '2024-01-20T09:15:00Z',
  'TRK987654321',
  NULL
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-003',
  'USB-C Cable',
  3,
  19.99,
  59.97,
  'shipped',
  '2024-01-22T16:45:00Z',
  'TRK456789123',
  '2024-01-25T12:00:00Z'
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-004',
  'Laptop Stand',
  1,
  79.99,
  79.99,
  'pending',
  '2024-01-25T11:20:00Z',
  'TRK789123456',
  NULL
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-005',
  'Bluetooth Speaker',
  1,
  129.99,
  129.99,
  'delivered',
  '2024-01-18T13:30:00Z',
  'TRK321654987',
  '2024-01-23T15:30:00Z'
);