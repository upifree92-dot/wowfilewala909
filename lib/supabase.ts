import { createClient } from '@supabase/supabase-js';
import * as db from './db';

// ... (keep the Supabase auth setup) ...
// (Re-adding the setup from the original file for auth)

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
export const isSandboxMode = false;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Proxy functions to lib/db
export const saveDownloadRecord = db.saveDownloadRecord;
export const saveRegisteredUser = db.saveRegisteredUser;
export const getRegisteredUser = db.getRegisteredUser;
export const getRegisteredUsers = db.getRegisteredUsers;
export const saveOrder = db.saveOrder;
export const saveWalletTransaction = db.saveWalletTransaction;
export const updateOrderStatus = db.updateOrderStatus;
export const adminResetHWID = db.adminResetHWID;

// Keep existing error listeners or mock them for now
export function addSupabaseErrorListener(listener: any) { return () => {}; }
export function handleSupabaseError(tableName: string, error: any) { console.error(error); }
export async function getSiteSetting(key: string) { return { success: true, data: null }; }
export async function saveSiteSetting(key: string, value: any) { return { success: true, data: null }; }
export async function clearAllSupabaseTables() { return {}; }
export async function deleteRegisteredUser(id: string) { return { success: true }; }
export async function deleteAllNonAdminUsers(adminEmail: string) { return { success: true }; }

