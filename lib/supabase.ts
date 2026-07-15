import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: any = null;

// Only throw error if environment variables are missing in runtime (not build time)
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  supabase = createClient(supabaseUrl, supabaseKey);
} else if (supabaseUrl && supabaseKey) {
  // Server-side: only initialize if env vars are available
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

// Types
export interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  created_at?: string;
}

export interface Lead {
  id?: string;
  customer_id: string;
  status: 'contacted' | 'interested' | 'proposal' | 'closed' | 'cold';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Customer operations
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data || [];
}

export async function addCustomer(customer: Customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select();

  if (error) {
    console.error('Error adding customer:', error);
    return null;
  }
  return data?.[0] || null;
}

export async function addCustomers(customers: Customer[]) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customers)
    .select();

  if (error) {
    console.error('Error adding customers:', error);
    return [];
  }
  return data || [];
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
  return true;
}

export async function getCustomerByPhone(phone: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer by phone:', error);
  }
  return data || null;
}

// Lead operations
export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
  return data || [];
}

export async function addLead(lead: Lead) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select();

  if (error) {
    console.error('Error adding lead:', error);
    return null;
  }
  return data?.[0] || null;
}

export async function addLeads(leads: Lead[]) {
  const { data, error } = await supabase
    .from('leads')
    .insert(leads)
    .select();

  if (error) {
    console.error('Error adding leads:', error);
    return [];
  }
  return data || [];
}

export async function getLeadsByCustomerId(customerId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads for customer:', error);
    return [];
  }
  return data || [];
}
