-- Supabase Database Schema Setup Queries
-- Copy and paste these statements into your Supabase SQL Editor (https://supabase.com)
-- to create the missing tables and enable full real-time database synchronization.

-- 1. Create APPOINTMENTS Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    device_model TEXT NOT NULL,
    service_needed TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    user_id TEXT DEFAULT 'anonymous',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create DOWNLOAD_HISTORY Table
CREATE TABLE IF NOT EXISTS download_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE
);

-- 3. Create REGISTERED_USERS Table
CREATE TABLE IF NOT EXISTS registered_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    mobile_number TEXT,
    name TEXT,
    bio TEXT,
    wallet_balance NUMERIC DEFAULT 0 NOT NULL,
    hwid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create ORDER_HISTORY Table
CREATE TABLE IF NOT EXISTS order_history (
    order_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    order_type TEXT NOT NULL, -- 'imei' or 'activation'
    title TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'processing', 'approved', 'rejected'
    order_details TEXT, -- stringified JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create WALLET_TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    transaction_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'credit', 'debit'
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create SITE_SETTINGS Table for Cloud Content Syncing
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) & ACCESS CONTROL SOLUTIONS FOR ERROR 42501
-- =========================================================================
-- If you see error code "42501" (new row violates row-level security policy), 
-- it means Supabase has enabled Row-Level Security on these tables by default.
-- You can resolve this easily using either OPTION A or OPTION B below.
-- Copy and paste the queries in your Supabase SQL Editor.

-- -------------------------------------------------------------------------
-- OPTION A: KEEP RLS ENABLED & CREATE PERMISSIVE POLICIES (Recommended)
-- -------------------------------------------------------------------------
-- Run these queries to keep RLS active but grant full access to guest (anon)
-- and authenticated users so client inserts, selects, and updates succeed.

-- 1. APPOINTMENTS POLICIES
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for appointments" ON appointments;
DROP POLICY IF EXISTS "Public insert access for appointments" ON appointments;
DROP POLICY IF EXISTS "Public update access for appointments" ON appointments;
DROP POLICY IF EXISTS "Public delete access for appointments" ON appointments;
DROP POLICY IF EXISTS "Public access policy for appointments" ON appointments;

CREATE POLICY "Public read access for appointments" ON appointments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for appointments" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for appointments" ON appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for appointments" ON appointments FOR DELETE TO anon, authenticated USING (true);

-- 2. DOWNLOAD_HISTORY POLICIES
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for download_history" ON download_history;
DROP POLICY IF EXISTS "Public insert access for download_history" ON download_history;
DROP POLICY IF EXISTS "Public update access for download_history" ON download_history;
DROP POLICY IF EXISTS "Public delete access for download_history" ON download_history;
DROP POLICY IF EXISTS "Public access policy for download_history" ON download_history;

CREATE POLICY "Public read access for download_history" ON download_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for download_history" ON download_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for download_history" ON download_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for download_history" ON download_history FOR DELETE TO anon, authenticated USING (true);

-- 3. REGISTERED_USERS POLICIES
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for registered_users" ON registered_users;
DROP POLICY IF EXISTS "Public insert access for registered_users" ON registered_users;
DROP POLICY IF EXISTS "Public update access for registered_users" ON registered_users;
DROP POLICY IF EXISTS "Public delete access for registered_users" ON registered_users;
DROP POLICY IF EXISTS "Public access policy for registered_users" ON registered_users;

CREATE POLICY "Public read access for registered_users" ON registered_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for registered_users" ON registered_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for registered_users" ON registered_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for registered_users" ON registered_users FOR DELETE TO anon, authenticated USING (true);

-- 4. ORDER_HISTORY POLICIES
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for order_history" ON order_history;
DROP POLICY IF EXISTS "Public insert access for order_history" ON order_history;
DROP POLICY IF EXISTS "Public update access for order_history" ON order_history;
DROP POLICY IF EXISTS "Public delete access for order_history" ON order_history;
DROP POLICY IF EXISTS "Public access policy for order_history" ON order_history;

CREATE POLICY "Public read access for order_history" ON order_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for order_history" ON order_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for order_history" ON order_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for order_history" ON order_history FOR DELETE TO anon, authenticated USING (true);

-- 5. WALLET_TRANSACTIONS POLICIES
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Public insert access for wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Public update access for wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Public delete access for wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Public access policy for wallet_transactions" ON wallet_transactions;

CREATE POLICY "Public read access for wallet_transactions" ON wallet_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for wallet_transactions" ON wallet_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for wallet_transactions" ON wallet_transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for wallet_transactions" ON wallet_transactions FOR DELETE TO anon, authenticated USING (true);

-- 6. SITE_SETTINGS POLICIES
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public insert access for site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public update access for site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public delete access for site_settings" ON site_settings;

CREATE POLICY "Public read access for site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for site_settings" ON site_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for site_settings" ON site_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access for site_settings" ON site_settings FOR DELETE TO anon, authenticated USING (true);


-- Ensure public access to schemas and execution permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;


-- -------------------------------------------------------------------------
-- OPTION B: COMPLETE DISABLE RLS (Alternative easiest way)
-- -------------------------------------------------------------------------
-- If you do not wish to use Row-Level Security at all, you can completely disable
-- it and grant absolute privileges to all roles. Run these queries:

ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE download_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE registered_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

GRANT ALL ON appointments TO anon, authenticated, service_role;
GRANT ALL ON download_history TO anon, authenticated, service_role;
GRANT ALL ON registered_users TO anon, authenticated, service_role;
GRANT ALL ON order_history TO anon, authenticated, service_role;
GRANT ALL ON wallet_transactions TO anon, authenticated, service_role;
GRANT ALL ON site_settings TO anon, authenticated, service_role;


-- -------------------------------------------------------------------------
-- OPTION C: ENABLE REALTIME FOR CLOUD SYNCHRONIZATION
-- -------------------------------------------------------------------------
-- Run this command to allow other connected users/tabs to receive
-- content updates in real-time when the admin makes changes:
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE registered_users;



