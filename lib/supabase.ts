import { createClient } from '@supabase/supabase-js';

// Read any custom override secrets from localStorage to support adding a custom Supabase database
let customUrl = '';
let customAnonKey = '';
try {
  const saved = localStorage.getItem('custom_workspace_secrets');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      const urlItem = parsed.find((p: any) => p.name === 'VITE_SUPABASE_URL');
      const keyItem = parsed.find((p: any) => p.name === 'VITE_SUPABASE_ANON_KEY');
      
      if (urlItem && urlItem.value && urlItem.value.startsWith('sb_')) {
          console.warn("Detected swapped Supabase credentials in localStorage, clearing.");
          localStorage.removeItem('custom_workspace_secrets');
      } else {
        if (urlItem && urlItem.value && !urlItem.value.includes('ftsvistldjmzhjpmfevy') && !urlItem.value.includes('kxpzktsyacukckhiytfs')) {
          let u = urlItem.value.startsWith('http') ? urlItem.value : `https://${urlItem.value}.supabase.co`;
          customUrl = u.replace('.supabase.com', '.supabase.co');
        }
        if (keyItem && keyItem.value && !keyItem.value.includes('sb_publishable_vM07HdQ1vbVyxpVHkSDN8w_2rC_q0xI') && !keyItem.value.includes('sb_publishable_VDsN0cKMfCnkCYrIX9DEnA_nb7Ism3Y')) customAnonKey = keyItem.value;
      }
    }
  }
} catch (e) {
  console.warn("Failed to check for dynamic Supabase secret overrides", e);
}

let envUrl = import.meta.env.VITE_SUPABASE_URL || '';
let envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (envUrl.startsWith('sb_') && envAnonKey.startsWith('http')) {
  const temp = envUrl;
  envUrl = envAnonKey;
  envAnonKey = temp;
}

const rawUrl = (customUrl || envUrl || 'https://dhkerczpvttjbcueuukl.supabase.co').trim();
let SUPABASE_URL = rawUrl;
if (!SUPABASE_URL.startsWith('http')) {
  SUPABASE_URL = `https://${SUPABASE_URL}.supabase.co`;
}
// Normalize any accidental .supabase.com into .supabase.co
if (SUPABASE_URL.includes('.supabase.com')) {
  SUPABASE_URL = SUPABASE_URL.replace('.supabase.com', '.supabase.co');
}
const SUPABASE_ANON_KEY = (customAnonKey || envAnonKey || 'sb_publishable_ci83oLkpiAEJ-jq1G3ssUQ_PVkkmCiM').trim();

// Supabase disabled: Using Hostinger MySQL Database (u833687569_Wowfilewala) as the primary database
export const isSandboxMode = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Helper function to handle and log Supabase database errors (specifically RLS and missing tables)
type SupabaseErrorListener = (tableName: string, error: any) => void;
const errorListeners: SupabaseErrorListener[] = [];

export function addSupabaseErrorListener(listener: SupabaseErrorListener) {
  errorListeners.push(listener);
  return () => {
    const idx = errorListeners.indexOf(listener);
    if (idx !== -1) {
      errorListeners.splice(idx, 1);
    }
  };
}

export function handleSupabaseError(tableName: string, error: any) {
  if (!error) return;
  
  const errorMsg = error.message || String(error);
  const isNetworkError = errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('TypeError');
  
  if (isSandboxMode || isNetworkError) {
    return; // Silently ignore sandbox/offline mode
  }
  
  // Notify listeners first
  errorListeners.forEach(listener => {
    try {
      listener(tableName, error);
    } catch (e) {
      console.error('Error in Supabase listener:', e);
    }
  });
}

export interface AppointmentData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  device_model: string;
  service_needed: string;
  appointment_date: string;
  appointment_time: string;
  description: string;
  status?: string;
  created_at?: string;
  user_id?: string;
}

export interface SupabaseDownloadRecord {
  user_id: string;
  user_email: string;
  product_id: string;
  product_name: string;
  downloaded_at?: string;
  expiry_date?: string;
}

export interface SupabaseUserData {
  id: string;
  email: string;
  mobile_number: string;
  name: string;
  bio: string;
  wallet_balance: number;
  hwid?: string;
}

export interface SupabaseOrderData {
  order_id: string;
  user_id: string;
  user_email: string;
  order_type: 'imei' | 'activation';
  title: string;
  quantity: number;
  total_price: number;
  status: string;
  order_details: string; // stringified JSON
  created_at: string;
}

export interface SupabaseTransactionData {
  transaction_id: string;
  user_id: string;
  user_email: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export async function saveAppointment(data: AppointmentData) {
  if (isSandboxMode) return { success: true, data: [data] };
  try {
    const { data: result, error } = await supabase
      .from('appointments')
      .insert([
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          device_model: data.device_model,
          service_needed: data.service_needed,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          description: data.description,
          status: 'pending',
          user_id: data.user_id || 'anonymous'
        }
      ])
      .select();

    if (error) {
      handleSupabaseError('appointments', error);
      throw error;
    }
    return { success: true, data: result };
  } catch (err: any) {
    throw err;
  }
}

export async function saveDownloadRecord(data: SupabaseDownloadRecord) {
  if (isSandboxMode) return { success: true, data: [data] };
  try {
    const { data: result, error } = await supabase
      .from('download_history')
      .insert([
        {
          user_id: data.user_id,
          user_email: data.user_email,
          product_id: data.product_id,
          product_name: data.product_name,
          downloaded_at: data.downloaded_at || new Date().toISOString(),
          expiry_date: data.expiry_date || null
        }
      ])
      .select();

    if (error) {
      handleSupabaseError('download_history', error);
      return { success: false, error };
    }
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function saveRegisteredUser(data: SupabaseUserData) {
  if (isSandboxMode) return { success: true, data: [data] };
  try {
    const payload: any = {
      id: data.id,
      email: data.email,
      mobile_number: data.mobile_number,
      name: data.name,
      bio: data.bio,
      wallet_balance: data.wallet_balance
    };
    if (data.hwid !== undefined) {
      payload.hwid = data.hwid;
    }

    let { data: result, error } = await supabase
      .from('registered_users')
      .upsert([payload])
      .select();

    if (error && error.message && error.message.includes('column "hwid" does not exist')) {
      delete payload.hwid;
      const retryResult = await supabase
        .from('registered_users')
        .upsert([payload])
        .select();
      result = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      handleSupabaseError('registered_users', error);
      return { success: false, error };
    }
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function deleteAllNonAdminUsers(adminEmail: string) {
  if (isSandboxMode) return { success: true };
  try {
    const tables = ['appointments', 'download_history', 'order_history', 'wallet_transactions'];
    for (const table of tables) {
      const emailField = table === 'appointments' || table === 'registered_users' ? 'email' : 'user_email';
      await supabase.from(table).delete().neq(emailField, adminEmail);
    }

    const { error } = await supabase
      .from('registered_users')
      .delete()
      .neq('email', adminEmail);

    if (error) {
      handleSupabaseError('registered_users', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function deleteRegisteredUser(id: string) {
  if (isSandboxMode) return { success: true };
  try {
    const { error } = await supabase
      .from('registered_users')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError('registered_users', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function getRegisteredUser(id: string) {
  if (isSandboxMode) return { success: true, data: null };
  try {
    const { data, error } = await supabase
      .from('registered_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleSupabaseError('registered_users', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function getRegisteredUsers() {
  if (isSandboxMode) return { success: true, data: [] };
  try {
    const { data, error } = await supabase
      .from('registered_users')
      .select('*');

    if (error) {
      handleSupabaseError('registered_users', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function saveOrder(data: SupabaseOrderData) {
  if (isSandboxMode) return { success: true, data: [data] };
  try {
    const { data: result, error } = await supabase
      .from('order_history')
      .insert([
        {
          order_id: data.order_id,
          user_id: data.user_id,
          user_email: data.user_email,
          order_type: data.order_type,
          title: data.title,
          quantity: data.quantity,
          total_price: data.total_price,
          status: data.status,
          order_details: data.order_details,
          created_at: data.created_at
        }
      ])
      .select();

    if (error) {
      handleSupabaseError('order_history', error);
      return { success: false, error };
    }
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function saveWalletTransaction(data: SupabaseTransactionData) {
  if (isSandboxMode) return { success: true, data: [data] };
  try {
    const { data: result, error } = await supabase
      .from('wallet_transactions')
      .insert([
        {
          transaction_id: data.transaction_id,
          user_id: data.user_id,
          user_email: data.user_email,
          type: data.type,
          amount: data.amount,
          description: data.description,
          created_at: data.created_at
        }
      ])
      .select();

    if (error) {
      handleSupabaseError('wallet_transactions', error);
      return { success: false, error };
    }
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'approved' | 'rejected') {
  if (isSandboxMode) return { success: true, data: [] };
  try {
    const { data: result, error } = await supabase
      .from('order_history')
      .update({ status })
      .eq('order_id', orderId)
      .select();

    if (error) {
      handleSupabaseError('order_history', error);
      return { success: false, error };
    }
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function getSiteSetting(key: string) {
  if (isSandboxMode) return { success: true, data: null };
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      handleSupabaseError('site_settings', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function saveSiteSetting(key: string, value: any) {
  if (isSandboxMode) return { success: true, data: null };
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert([
        {
          key,
          value,
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      handleSupabaseError('site_settings', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function clearAllSupabaseTables() {
  const tables = ['appointments', 'download_history', 'registered_users', 'order_history', 'wallet_transactions', 'site_settings'];
  const results: Record<string, { success: boolean; error?: any }> = {};
  
  for (const table of tables) {
    try {
      let query = supabase.from(table).delete();
      
      if (table === 'appointments' || table === 'registered_users') {
        query = query.neq('id', '_non_existent_');
      } else if (table === 'site_settings') {
        query = query.neq('key', '_non_existent_');
      } else if (table === 'order_history') {
        query = query.neq('order_id', '_non_existent_');
      } else if (table === 'wallet_transactions') {
        query = query.neq('transaction_id', '_non_existent_');
      } else if (table === 'download_history') {
        query = query.neq('user_id', '_non_existent_');
      } else {
        query = query.neq('id', '_non_existent_');
      }
      
      const { error } = await query;
      if (error) {
        results[table] = { success: false, error };
      } else {
        results[table] = { success: true };
      }
    } catch (err: any) {
      results[table] = { success: false, error: err };
    }
  }
  return results;
}

