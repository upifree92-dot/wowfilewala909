export interface DownloadRecord {
  user_id: string;
  user_email: string;
  product_id: string;
  product_name: string;
  downloaded_at?: string;
  expiry_date?: string;
}

export interface UserData {
  id: string;
  email: string;
  mobile_number: string;
  name: string;
  bio: string;
  wallet_balance: number;
  hwid?: string;
}

export interface OrderData {
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

export interface TransactionData {
  transaction_id: string;
  user_id: string;
  user_email: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

async function apiCall(endpoint: string, method: string, body?: any) {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch {
    // Fallback to cloud-sync.php on Hostinger Apache/PHP
  }

  // Fallback for Hostinger PHP environment where /api/* Express routes are handled by /cloud-sync.php
  try {
    const actionName = endpoint.split('?')[0].replace(/-/g, '_');
    const phpRes = await fetch(`/cloud-sync.php?action=${actionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionName, ...(body || {}) }),
    });
    const ct = phpRes.headers.get('content-type') || '';
    if (phpRes.ok && ct.includes('application/json')) {
      return await phpRes.json();
    }
  } catch {
    // Ignore network fallback errors
  }

  return { success: false, data: null };
}

export async function saveDownloadRecord(data: DownloadRecord) {
  return apiCall('save-download-record', 'POST', data);
}

export async function saveRegisteredUser(data: UserData) {
  return apiCall('save-user', 'POST', data);
}

export async function getRegisteredUser(id: string) {
  return apiCall(`get-user?id=${encodeURIComponent(id)}`, 'GET');
}

export async function getRegisteredUsers() {
  return apiCall('get-users', 'GET');
}

export async function saveOrder(data: OrderData) {
  return apiCall('save-order', 'POST', data);
}

export async function saveWalletTransaction(data: TransactionData) {
  return apiCall('save-transaction', 'POST', data);
}

export async function updateOrderStatus(orderId: string, status: string) {
  return apiCall('update-order-status', 'POST', { orderId, status });
}

export async function adminResetHWID(userId: string) {
  return apiCall('admin-reset-hwid', 'POST', { userId });
}

