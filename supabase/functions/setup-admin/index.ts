import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create admin user
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@ecorider.com',
      password: 'admin1234',
      email_confirm: true,
      user_metadata: {
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin'
      }
    });

    if (adminError) {
      console.error('Admin creation error:', adminError);
      return new Response(
        JSON.stringify({ error: adminError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Admin user created:', adminUser.user?.id);

    // Create sample customer for demo
    const { data: customerUser, error: customerError } = await supabaseAdmin.auth.admin.createUser({
      email: 'customer@demo.com',
      password: 'demo1234',
      email_confirm: true,
      user_metadata: {
        first_name: 'Demo',
        last_name: 'Customer',
        mobile_number: '+1234567890',
        role: 'customer'
      }
    });

    if (customerError) {
      console.error('Customer creation error:', customerError);
    }

    // Insert sample orders for the demo customer
    if (customerUser?.user?.id) {
      const { error: ordersError } = await supabaseAdmin.from('orders').insert([
        {
          customer_id: customerUser.user.id,
          order_number: 'ECO-001',
          product_name: 'Eco Rider Pro X1',
          quantity: 1,
          price: 1299.99,
          total_amount: 1299.99,
          status: 'delivered',
          tracking_number: 'TR123456789',
          order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_id: customerUser.user.id,
          order_number: 'ECO-002',
          product_name: 'Eco Rider Urban Z2',
          quantity: 1,
          price: 899.99,
          total_amount: 899.99,
          status: 'shipped',
          tracking_number: 'TR987654321',
          order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          customer_id: customerUser.user.id,
          order_number: 'ECO-003',
          product_name: 'Eco Rider City S1',
          quantity: 1,
          price: 599.99,
          total_amount: 599.99,
          status: 'processing',
          order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      if (ordersError) {
        console.error('Orders insertion error:', ordersError);
      }

      // Insert sample customer queries
      const { error: queriesError } = await supabaseAdmin.from('customer_queries').insert([
        {
          customer_id: customerUser.user.id,
          query_text: 'How long does the battery last on the Pro X1?',
          response_text: 'The Eco Rider Pro X1 battery typically lasts 35-40 miles on a single charge, depending on riding conditions.',
          status: 'answered'
        },
        {
          customer_id: customerUser.user.id,
          query_text: 'What is the warranty coverage for my scooter?',
          response_text: 'Your scooter comes with a comprehensive 12-month warranty covering manufacturing defects.',
          status: 'answered'
        }
      ]);

      if (queriesError) {
        console.error('Queries insertion error:', queriesError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Admin setup completed successfully',
        adminId: adminUser.user?.id,
        customerId: customerUser?.user?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});