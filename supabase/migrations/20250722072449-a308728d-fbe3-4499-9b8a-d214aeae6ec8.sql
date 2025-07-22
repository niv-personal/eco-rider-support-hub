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
  'Thunder Pro Electric Scooter',
  1,
  899.99,
  899.99,
  'delivered',
  '2024-01-15T10:30:00Z',
  'TRK123456789',
  '2024-01-20T14:00:00Z'
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-002', 
  'Swift Lite Electric Scooter',
  1,
  649.99,
  649.99,
  'pending',
  '2024-01-20T09:15:00Z',
  'TRK987654321',
  NULL
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-003',
  'Urban Max Electric Scooter',
  1,
  1199.99,
  1199.99,
  'shipped',
  '2024-01-22T16:45:00Z',
  'TRK456789123',
  '2024-01-25T12:00:00Z'
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-004',
  'Eco Rider Electric Scooter',
  1,
  549.99,
  549.99,
  'pending',
  '2024-01-25T11:20:00Z',
  'TRK789123456',
  NULL
),
(
  '514dfa36-27dc-479f-ad4c-e694e5654d9b'::uuid,
  'ORD-2024-005',
  'Storm Elite Electric Scooter',
  1,
  1499.99,
  1499.99,
  'delivered',
  '2024-01-18T13:30:00Z',
  'TRK321654987',
  '2024-01-23T15:30:00Z'
);