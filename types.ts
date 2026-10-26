
export interface Product {
  id: string;
  name: string;
  categoryId?: string;
  price: number;
  downloadLink: string;
  date?: string;
  description: string;
  size: string;
  views?: number;
  downloads?: number;
  rating?: number;
  tags?: ('new' | 'featured' | 'paid' | 'free')[];
  isHiddenLink?: boolean;
  imageUrl?: string;
  subtitle?: string;
  downloadUrl?: string;
  category?: string;
  createdAt?: string;
  serviceType?: 'imei' | 'server' | 'remote' | 'file';
}

export interface ActivationCustomField {
    id: string;
    name: string;
    label: string;
    placeholder: string;
    type: 'text' | 'password' | 'email';
    enabled: boolean;
}

export interface ActivationFormConfig {
  enabled: boolean;
  title: string;
  pricePerUnit: number;
  deliveryTime: string;
  quantityRange: {
    min: number;
    max: number;
  };
  customFields: ActivationCustomField[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  parentId?: string;
  activationForm?: ActivationFormConfig;
  serviceType?: 'imei' | 'server' | 'remote' | 'file';
}

export interface DownloadRecord {
  productId: string;
  productName: string;
  downloadedAt: string; // ISO string for date and time
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  status?: 'pending' | 'processing' | 'approved' | 'rejected' | 'info';
  rejectionReason?: string;
  adminReply?: string; // For admin replies to user notifications/orders
  type?: 'order' | 'general';
  orderId?: string;
  orderDetails?: any;
  expiresAt?: string; // ISO string for when the notification should be hidden
}

export type TransactionType = 'purchase' | 'deposit' | 'admin_adjustment' | 'refund' | 'order';

export interface Transaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  amount: number; // positive for deposit/refund, negative for purchase/order
  description: string;
}

export interface InputField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email';
  placeholder: string;
  required: boolean;
}

export interface User {
  id:string;
  email: string;
  mobileNumber: string;
  password: string; // Storing plain text for simulation purposes
  profile: {
    name: string;
    bio: string;
    age?: number;
    emailNotifications?: {
      systemUpdates: boolean;
      newFileReleases: boolean;
    };
  };
  wallet: {
    balance: number;
  };
  purchasedProductIds: string[];
  favoriteProductIds: string[];
  visitedProductIds: string[];
  downloadTimers?: { [productId: string]: number };
  downloadHistory?: DownloadRecord[];
  registeredAt: string;
  isBlocked?: boolean;
  hwid?: string;
  notifications?: UserNotification[];
  transactionHistory?: Transaction[];
  lifetimePointsPurchased?: number;
  referralCode?: string;
  referredBy?: string;
  referredUsers?: { email: string; joinedAt: string; earned: number }[];
}

export interface AdminNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'order';
  userId?: string;
  status?: 'pending' | 'processing' | 'approved' | 'rejected';
  orderDetails?: any;
  rejectionReason?: string;
  isReplied?: boolean;
  adminReply?: string;
  repliedAt?: string;
  orderId?: string;
}

export interface BalancePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  bandwidth: string;
  downloads: string;
  dailyLimit: string;
  dailyBandwidth: string;
  devices: string;
  isBestSeller?: boolean;
  amount?: number;
}

export interface SocialLink {
  id: string;
  url: string;
  iconUrl: string;
}

export interface CartItem extends Product {}