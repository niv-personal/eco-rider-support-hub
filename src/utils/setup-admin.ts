import { supabase } from "@/integrations/supabase/client";

export const setupAdminAndSampleData = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('setup-admin', {
      method: 'POST'
    });

    if (error) throw error;

    console.log('Admin setup completed:', data);
    return data;
  } catch (error: any) {
    console.error('Setup error:', error);
    throw error;
  }
};