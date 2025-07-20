-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage predefined Q&A" ON public.predefined_qa;
DROP POLICY IF EXISTS "Admins can view and manage all queries" ON public.customer_queries;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate admin policies using security definer functions
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage predefined Q&A" ON public.predefined_qa
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view and manage all queries" ON public.customer_queries
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all conversations" ON public.chat_conversations
  FOR SELECT USING (public.is_admin());

-- Also allow admins to view messages from all conversations
CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT USING (public.is_admin());