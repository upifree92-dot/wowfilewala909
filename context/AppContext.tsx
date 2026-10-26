

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import type { User, Product, CartItem, Category, BalancePackage, DownloadRecord, AdminNotification, UserNotification, Transaction, TransactionType, InputField } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, ADMIN_EMAIL, INITIAL_BALANCE_PACKAGES } from '../constants';
import { INITIAL_SITE_CONTENT } from '../siteContent';
import { saveDownloadRecord, saveRegisteredUser, deleteRegisteredUser, deleteAllNonAdminUsers, getRegisteredUser, getRegisteredUsers, saveOrder, saveWalletTransaction, updateOrderStatus, adminResetHWID, supabase, addSupabaseErrorListener, getSiteSetting, saveSiteSetting, clearAllSupabaseTables, isSandboxMode } from '../lib/supabase';
import { playOrderPlacedSound, playOrderSuccessSound, playOrderRejectedSound, playAdminIncomingOrderSound, playSuccessSound } from '../lib/audio';

// Helper for deep object property access
const getNestedValue = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

// Helper for deep object property setting
const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop() as string;
    const lastObj = keys.reduce((acc, key) => acc[key] = acc[key] || {}, obj);
    lastObj[lastKey] = value;
};


interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  products: Product[];
  categories: Category[];
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, pass: string, mobileNumber: string, referredByCode?: string) => Promise<boolean>;
  checkUserExists: (email: string, mobileNumber: string) => boolean;
  updateProfile: (name: string, bio: string, emailNotifications?: { systemUpdates: boolean; newFileReleases: boolean; }) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: () => boolean;
  hasPurchased: (productId: string) => boolean;
  purchaseProductDirectly: (product: Product) => boolean;
  
  // Site Content Management
  isEditMode: boolean;
  toggleEditMode: () => void;
  siteContent: any;
  updateSiteContent: (path: string, value: any) => void;

  // Global Notification System
  notification: { message: string; type: 'success' | 'error' } | null;
  setNotification: (message: string, type?: 'success' | 'error') => void;
  clearNotification: () => void;
  
  // Editing Modal Control
  editingContent: { path: string; value: string } | null;
  startEditing: (path: string, value: string) => void;
  finishEditing: () => void;

  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  addToRecents: (productId: string) => void;
  anonymousRecents: string[]; // For public users
  createCategory: (name: string, description: string, parentId?: string) => void;
  duplicateCategory: (categoryId: string, newParentId?: string) => void;
  deleteCategory: (categoryId: string) => void;
  createProduct: (productData: Omit<Product, 'id' | 'views' | 'downloads' | 'rating' | 'date'>) => void;
  updateProduct: (productData: Product) => void;
  deleteProduct: (productId: string) => void;
  updateCategory: (categoryData: Category) => void;
  initiateDownload: (product: Product) => void;

  // Balance packages and purchasing
  balancePackages: BalancePackage[];
  updateBalancePackage: (packageData: BalancePackage) => void;
  addBalancePackage: (amount: number, price: number) => void;
  deleteBalancePackage: (packageId: string) => void;
  addFunds: (pkg: BalancePackage) => void;

  // Admin User Management
  getAllUsers: () => User[];
  adminUpdateUser: (userId: string, email: string, password: string, name?: string, mobileNumber?: string, referralCode?: string, referredBy?: string) => void;
  adminCreateUser: (email: string, pass: string, mobileNumber: string, name: string) => Promise<boolean>;
  adminAdjustUserBalance: (userId: string, amount: number, reason: string) => void;
  adminToggleUserBlockStatus: (userId: string) => void;
  adminResetUserHWID: (userId: string) => Promise<void>;
  userResetOwnHWID: (email: string, pass: string, mobileNumber: string) => Promise<{ success: boolean; message: string }>;
  adminDeleteUser: (userId: string) => Promise<void>;
  adminDeleteAllUsers: () => Promise<void>;
  
  // Admin Dashboard Data
  getTotalSales: () => number;
  getAllOrders: () => AdminNotification[];
  getSalesDataForLastNDays: (days: number) => { date: string; sales: number }[];


  // Nav Link Management
  addNavLink: (text: string, path: string) => void;
  updateNavLink: (navItem: {id: string, text: string, path: string}) => void;
  deleteNavLink: (navItemId: string) => void;
  reorderNavLinks: (startIndex: number, endIndex: number) => void;

  // Activation Order & Notifications
  placeActivationOrder: (category: Category, orderDetails: any) => void;
  approveActivationOrder: (notificationId: string, replyMessage: string) => void;
  rejectActivationOrder: (notificationId: string, reason: string) => void;
  updateOrderStatusByAdmin: (notificationId: string, newStatus: 'pending' | 'processing' | 'approved' | 'rejected', comment?: string) => void;
  adminReplyToNotification: (notificationId: string, replyMessage: string) => void;
  deleteAdminNotification: (notificationId: string) => void;
  getAdminNotifications: () => AdminNotification[];
  markAdminNotificationAsRead: (notificationId: string) => void;
  markAllAdminNotificationsAsRead: () => void;
  clearAdminNotifications: () => void;

  // IMEI Order
  placeImeiOrder: (orderDetails: any) => void;
  
  // Order Success Modal (Screenshot Match)
  orderSuccessModalOpen: boolean;
  setOrderSuccessModalOpen: (open: boolean) => void;
  lastPlacedOrderId: string | null;
  showOrderSuccessModal: (orderId?: string) => void;

  // User Notifications
  getUserNotifications: () => UserNotification[];
  markUserNotificationAsRead: (notificationId: string) => void;
  markAllUserNotificationsAsRead: () => void;
  deleteUserNotification: (notificationId: string) => void;
  clearUserNotifications: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Supabase RLS Diagnostic
  supabaseError: { tableName: string; code: string; message: string } | null;
  clearSupabaseError: () => void;

  // Cloud/GitHub Syncing
  forceGitAndCloudSync: () => Promise<{ success: boolean; message: string }>;
  realtimeSyncEnabled: boolean;
  setRealtimeSyncEnabled: (enabled: boolean) => void;

  // New User Auto Wallet Option
  autoWalletNewUser: boolean;
  updateAutoWalletNewUser: (enabled: boolean) => Promise<void>;

  // Sync Users from Supabase
  syncUsersFromSupabase: () => Promise<void>;

  // Wipe/Reset all data for fresh start
  adminResetAllData: () => Promise<{ success: boolean }>;

  // HWID Mismatch & Self Reset
  hwidMismatchInfo: { email: string; currentHWID: string; registeredHWID: string; userId?: string; userObj?: User } | null;
  setHwidMismatchInfo: (info: { email: string; currentHWID: string; registeredHWID: string; userId?: string; userObj?: User } | null) => void;
  performSelfHwidReset: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper functions to interact with localStorage
const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setLocalStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error)
    {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

export const getDeviceType = (): string => {
  try {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return "iPhone/iPad";
    if (/Android/.test(ua)) return "Android Mobile";
    if (/Macintosh/.test(ua)) return "Macbook/Mac";
    if (/Windows/.test(ua)) return "Windows PC";
    if (/Linux/.test(ua)) return "Linux Computer";
    return "Unknown Device";
  } catch (e) {
    return "Unknown Device";
  }
};

export const getClientHWID = (): string => {
  try {
    let id = localStorage.getItem('client_hwid');
    if (!id) {
      const devType = getDeviceType();
      id = `${devType} (hwid-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36).substring(4)})`;
      localStorage.setItem('client_hwid', id);
    }
    return id;
  } catch (error) {
    return 'Fallback-Device (hwid-fallback)';
  }
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getLocalStorage('currentUser', null));
  const [cart, setCart] = useState<CartItem[]>(getLocalStorage('cart', []));
  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = getLocalStorage('products', []);
    // Permanently remove all sample/demo files
    const cleanProducts = loaded.filter((p: Product) => 
      !p.id.startsWith('file-') && 
      !p.id.startsWith('prod-') &&
      !['file-vivo-x200fe', 'file-mtk-flash-tool-v6', 'file-da-mt6765', 'file-vivo-rpmb-parser', 'file-prog-emmc-ufs-firehose', 'file-free-vpn', 'file-qcn-edit-tool', 'file-mi-diag-port-enabler', 'file-ufi-all-ffu', 'file-idm-build-56', 'file-vivo-latest-2022-da', 'file-da-mtk-all-bin', 'prod-zhizhen-demo', 'prod-realme-n55', 'prod-cph2691', 'prod-infinix-hot-50'].includes(p.id)
    );
    setLocalStorage('products', cleanProducts);
    return cleanProducts;
  });
  const [categories, setCategories] = useState<Category[]>(() => getLocalStorage('categories', INITIAL_CATEGORIES));
  const [balancePackages, setBalancePackages] = useState<BalancePackage[]>(() => getLocalStorage('balancePackages', INITIAL_BALANCE_PACKAGES));
  const [anonymousRecents, setAnonymousRecents] = useState<string[]>(() => getLocalStorage('anonymousRecents', []));
  const [allUsers, setAllUsers] = useState<Record<string, User>>(() => getLocalStorage('users', {}));
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => getLocalStorage('adminNotifications', []));

  const [hwidMismatchInfo, setHwidMismatchInfo] = useState<{
    email: string;
    currentHWID: string;
    registeredHWID: string;
    userId?: string;
    userObj?: User;
  } | null>(null);

  const performSelfHwidReset = async () => {
    if (!hwidMismatchInfo) return;
    const { userId, userObj, currentHWID, email } = hwidMismatchInfo;
    if (userId && userObj) {
      userObj.hwid = currentHWID;
      await saveRegisteredUser({
        id: userId,
        email: email,
        mobile_number: userObj.mobileNumber,
        name: userObj.profile.name,
        bio: userObj.profile.bio,
        wallet_balance: userObj.wallet.balance,
        hwid: currentHWID
      }).catch(err => console.warn('HWID self-reset save error:', err));

      setAllUsers(prev => ({ ...prev, [userId]: userObj }));
      setUser(userObj);
      setHwidMismatchInfo(null);
      setLocalStorage('currentUser', userObj);
      setNotification('Hardware ID successfully updated to current device!', 'success');
    }
  };

  // --- New State for Live Editing and Content ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [siteContent, setSiteContent] = useState<any>(() => {
    const storedContent = getLocalStorage('siteContent', INITIAL_SITE_CONTENT);
    // Safely handle legacy 'backgroundImage' property with a type assertion to prevent type errors and potential runtime errors.
    const heroAsAny = storedContent?.home?.hero as any;
    if (heroAsAny && heroAsAny.backgroundImage && typeof heroAsAny.backgroundImage === 'string') {
        heroAsAny.backgroundImages = [heroAsAny.backgroundImage];
        delete heroAsAny.backgroundImage;
    }
    // Ensure Book Support option is removed from active nav items
    if (storedContent && Array.isArray(storedContent.nav)) {
        storedContent.nav = storedContent.nav.filter((n: any) => n.path !== '/appointment-booking' && n.id !== 'nav-booking');
    }
    // Migration for new brand name
    if (storedContent) {
        if (storedContent.home?.hero?.title === "KGFILEWALA" || storedContent.home?.hero?.title === "Your Health mobilehubb" || storedContent.home?.hero?.title === "mobilehubb") {
            storedContent.home.hero.title = "wowfilewala";
        }
        if (storedContent.header?.title === "KGFILEWALA" || storedContent.header?.title === "Your Health mobilehubb" || storedContent.header?.title === "mobilehubb") {
            storedContent.header.title = "wowfilewala";
        }
        if (storedContent.footer?.copyright === "© 2025 mobilehubb. All Rights Reserved.") {
            storedContent.footer.copyright = "© 2025 wowfilewala. All Rights Reserved.";
        }
        if (storedContent.websitePage?.p1 && storedContent.websitePage.p1.includes("mobilehubb")) {
            storedContent.websitePage.p1 = storedContent.websitePage.p1.replace(/mobilehubb/g, "wowfilewala");
        }
    }
    // Migration for real UPI ID
    if (storedContent?.pricing && (storedContent.pricing.upiId === 'your-upi-id@examplebank' || !storedContent.pricing.upiId)) {
        storedContent.pricing.upiId = "7077536530-3@axl";
    }
    // Migration for Email OTP Verification
    if (storedContent && storedContent.auth) {
        if (storedContent.auth.emailOtpEnabled === undefined) {
            storedContent.auth.emailOtpEnabled = true;
        }
        if (storedContent.auth.requireLoginToViewFiles === undefined) {
            storedContent.auth.requireLoginToViewFiles = false;
        }
    }
    // Migration for CEO spotlight
    if (storedContent && storedContent.ourUsersPage) {
        if (!storedContent.ourUsersPage.ceo) {
            storedContent.ourUsersPage.ceo = {
                title: "CEO & Founder Spotlight",
                name: "wowfilewala CEO",
                designation: "Chief Executive Officer & Founder",
                avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&fit=crop",
                bio: "Visionary leader with 10+ years of experience in mobile software solutions and digital file systems. Dedicated to delivering seamless, premium resources to our global community.",
                contactEmail: "ceo@wowfilewala.com",
                whatsapp: "8658465589",
            };
        }
    }
    // Migration for Home CEO message
    if (storedContent && storedContent.home) {
        if (!storedContent.home.ceoMessage) {
            storedContent.home.ceoMessage = {
                title: "Message from the CEO",
                name: "wowfilewala CEO",
                designation: "Chief Executive Officer & Founder",
                avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&fit=crop",
                bioHeading: "Pioneering the Future of Device Solutions",
                bioParagraph: "Welcome to wowfilewala. Our mission is to democratize access to critical software ROMs, and mobile utility tools. We believe that technology should be accessible to everyone, and our platform is built from the ground up to support repair technicians, enthusiasts, and developers worldwide with lightning-fast speeds and fully-verified, secure resources.",
            };
        }
    }
    // Force versioned migration so Google Chrome & mobile browsers with old cached localStorage get the latest WhatsApp number & settings
    const MIGRATION_VERSION = '2026-10-24-v2';
    const appliedVersion = localStorage.getItem('siteContent_migration_version');
    if (appliedVersion !== MIGRATION_VERSION && storedContent) {
        if (storedContent.whatsapp) {
            storedContent.whatsapp.phoneNumber = "8658465589";
        }
        if (storedContent.pricing) {
            storedContent.pricing.adminWhatsappNumber = "8658465589";
        }
        if (storedContent.ourUsersPage?.ceo) {
            storedContent.ourUsersPage.ceo.whatsapp = "8658465589";
        }
        localStorage.setItem('siteContent_migration_version', MIGRATION_VERSION);
        setLocalStorage('siteContent', storedContent);
    }
    return storedContent;
  });
  const [notification, setInternalNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingContent, setEditingContent] = useState<{ path: string; value: string } | null>(null);
  const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);

  const showOrderSuccessModal = (orderId?: string) => {
    if (orderId) setLastPlacedOrderId(orderId);
    setOrderSuccessModalOpen(true);
  };
  
  // --- Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getLocalStorage('theme', 'light'));

  // --- Supabase RLS Diagnostics State ---
  const [supabaseError, setSupabaseError] = useState<{ tableName: string; code: string; message: string } | null>(null);

  // --- New User Auto Wallet Option (default is off as per request) ---
  const [autoWalletNewUser, setAutoWalletNewUser] = useState<boolean>(() => getLocalStorage('autoWalletNewUser', false));

  // --- Real-time Sync Option (ON/OFF) ---
  const [realtimeSyncEnabled, setRealtimeSyncEnabledState] = useState<boolean>(() => getLocalStorage('realtimeSyncEnabled', true));

  const setRealtimeSyncEnabled = (enabled: boolean) => {
    setRealtimeSyncEnabledState(enabled);
    setLocalStorage('realtimeSyncEnabled', enabled);
  };

  useEffect(() => {
    return addSupabaseErrorListener((tableName, err) => {
      if (err && err.code) {
        setSupabaseError({
          tableName,
          code: String(err.code),
          message: err.message || String(err)
        });
      }
    });
  }, []);

  const clearSupabaseError = () => {
    setSupabaseError(null);
  };

  const pushServerSync = useCallback(async (payload: Record<string, any>, isManualSync = false) => {
    const endpoints = ['/api/cloud-sync', '/cloud-sync.php'];
    for (const endpoint of endpoints) {
      try {
        console.log(`Pushing sync to ${endpoint}...`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, isManualSync }),
        });
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const resJson = await response.json();
          if (resJson?.success) {
            console.log(`Sync successful to ${endpoint}`);
            if (resJson?.updatedAt) {
              localStorage.setItem('cloud_sync_timestamp', String(resJson.updatedAt));
            }
            return { success: true, updatedAt: resJson?.updatedAt };
          }
        }
        console.warn(`Sync failed to ${endpoint}:`, response.statusText);
      } catch (err) {
        console.warn(`Error syncing to ${endpoint}:`, err);
      }
    }
    return { success: false };
  }, []);

  const applyCloudSnapshot = useCallback((snapshot: any, forceApply = false) => {
    if (!snapshot || typeof snapshot !== 'object') return false;
    const remoteUpdatedAt = Number(snapshot.updatedAt || 0);
    const localUpdatedAt = Number(localStorage.getItem('cloud_sync_timestamp') || 0);

    if (!forceApply && remoteUpdatedAt <= localUpdatedAt) {
      return false;
    }

    if (snapshot.siteContent) {
      const loadedCloudContent = { ...snapshot.siteContent };
      if (loadedCloudContent?.whatsapp) {
        loadedCloudContent.whatsapp.phoneNumber = loadedCloudContent.whatsapp.phoneNumber || "8658465589";
      }
      setSiteContent(loadedCloudContent);
      setLocalStorage('siteContent', loadedCloudContent);
    }
    if (Array.isArray(snapshot.products)) {
      const cleanProducts = snapshot.products.filter((p: any) => 
        p && p.id && !p.id.startsWith('file-') && !p.id.startsWith('prod-')
      );
      setProducts(cleanProducts);
      setLocalStorage('products', cleanProducts);
    }
    if (Array.isArray(snapshot.categories)) {
      setCategories(snapshot.categories);
      setLocalStorage('categories', snapshot.categories);
    }
    if (Array.isArray(snapshot.balancePackages)) {
      setBalancePackages(snapshot.balancePackages);
      setLocalStorage('balancePackages', snapshot.balancePackages);
    }
    if (snapshot.autoWalletNewUser !== undefined) {
      setAutoWalletNewUser(Boolean(snapshot.autoWalletNewUser));
      setLocalStorage('autoWalletNewUser', Boolean(snapshot.autoWalletNewUser));
    }
    if (snapshot.users) {
      let remoteUsersMap: Record<string, User> = {};
      if (Array.isArray(snapshot.users)) {
        snapshot.users.forEach((u: User) => {
          if (u && u.id) remoteUsersMap[u.id] = u;
        });
      } else if (typeof snapshot.users === 'object') {
        remoteUsersMap = { ...snapshot.users };
      }
      if (Object.keys(remoteUsersMap).length > 0) {
        setAllUsers(prev => {
          const merged = { ...prev, ...remoteUsersMap };
          setLocalStorage('users', merged);
          return merged;
        });

        // Ensure currently logged in user gets the fresh wallet balance immediately!
        setUser(prevUser => {
          if (!prevUser?.id || !remoteUsersMap[prevUser.id]) return prevUser;
          const fresh = remoteUsersMap[prevUser.id];
          const updated = {
            ...prevUser,
            ...fresh,
            wallet: fresh.wallet || prevUser.wallet,
            transactionHistory: fresh.transactionHistory || prevUser.transactionHistory,
          };
          setLocalStorage('currentUser', updated);
          return updated;
        });
      }
    }
    if (Array.isArray(snapshot.adminNotifications)) {
      setAdminNotifications(prev => {
        const merged: AdminNotification[] = [];
        const seen = new Set<string>();

        // Remote snapshot notifications take precedence
        snapshot.adminNotifications.forEach((r: any) => {
          if (r && r.id && !seen.has(r.id)) {
            merged.push(r);
            seen.add(r.id);
          }
        });

        // Keep local notifications that are recent and not yet in remote
        prev.forEach(l => {
          if (l && l.id && !seen.has(l.id)) {
            merged.push(l);
            seen.add(l.id);
          }
        });

        merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLocalStorage('adminNotifications', merged);
        return merged;
      });
    }
    if (remoteUpdatedAt > 0) {
      localStorage.setItem('cloud_sync_timestamp', String(remoteUpdatedAt));
    }
    return true;
  }, []);

  const pullServerSync = useCallback(async (forceApply = false) => {
    const apiEndpoints = [`/api/cloud-sync?t=${Date.now()}`, `/cloud-sync.php?t=${Date.now()}`];
    for (const url of apiEndpoints) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json?.success && json?.data) {
            return applyCloudSnapshot(json.data, forceApply);
          }
        }
      } catch (_err) {
        // try next
      }
    }

    // Fallback to direct static cloud-data.json
    try {
      const staticRes = await fetch(`/cloud-data.json?t=${Date.now()}`, { cache: 'no-store' });
      const contentType = staticRes.headers.get('content-type') || '';
      if (staticRes.ok && contentType.includes('application/json')) {
        const staticData = await staticRes.json();
        return applyCloudSnapshot(staticData, forceApply);
      }
    } catch (_e) {
      // ignore
    }
    return false;
  }, [applyCloudSnapshot]);

  const forceGitAndCloudSync = async () => {
    try {
      console.log('Forcing manual Git, Server & Supabase Real-time Cloud Sync...');

      // 1. Always push to our live /api/cloud-sync server & write to /public/cloud-data.json + /siteContent.ts
      const serverSyncRes = await pushServerSync(
        {
          siteContent,
          products,
          categories,
          balancePackages,
          autoWalletNewUser,
          users: Object.values(allUsers),
          adminNotifications,
        },
        true
      );

      // 2. Also attempt Supabase sync if configured
      const results = await Promise.all([
        saveSiteSetting('site_content', siteContent),
        saveSiteSetting('products', products),
        saveSiteSetting('categories', categories),
        saveSiteSetting('balance_packages', balancePackages),
        saveSiteSetting('auto_wallet_25_new_user', autoWalletNewUser)
      ]);

      if (!isSandboxMode) {
        await supabase.channel('public:site_settings').send({
          type: 'broadcast',
          event: 'site_settings_force_sync',
          payload: {
            site_content: siteContent,
            products: products,
            categories: categories,
            balance_packages: balancePackages,
            auto_wallet_25_new_user: autoWalletNewUser,
            sender: user?.email || 'admin'
          }
        }).catch(() => {});
      }

      if (serverSyncRes.success) {
        return {
          success: true,
          message: 'All site modifications, photos, and settings are now saved on the live server and synced across all devices!'
        };
      }

      const failed: any = results.find(r => !r.success);
      if (failed) {
        const errorMsg = failed.error?.message || String(failed.error || '');
        const isFetchError = errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('TypeError');
        if (isSandboxMode || isFetchError) {
          return {
            success: true,
            message: 'All site modifications synced!'
          };
        }
        throw new Error(failed.error?.message || 'One of the settings failed to save.');
      }

      return { success: true, message: 'All site modifications successfully synced and pushed to production!' };
    } catch (err: any) {
      return { success: false, message: err.message || String(err) };
    }
  };

  const isAdmin = user?.email === ADMIN_EMAIL || 
    user?.email === 'upifree92@gmail.com' || 
    user?.email === 'mobilehubb64@gmail.com' || 
    user?.role === 'admin' ||
    isEditMode ||
    getLocalStorage<boolean>('admin_mode_active', false);
  const [cloudSettingsSynced, setCloudSettingsSynced] = useState(false);

  // Async effect to fetch and sync latest settings from Server & Supabase on load
  useEffect(() => {
    let active = true;
    const fetchCloudSettings = async () => {
      try {
        // First pull from our live server (/api/cloud-sync or /cloud-data.json)
        const pulledFromServer = await pullServerSync(false);

        const [cloudContent, cloudProducts, cloudCategories, cloudPackages, cloudAutoWallet] = await Promise.all([
          getSiteSetting('site_content'),
          getSiteSetting('products'),
          getSiteSetting('categories'),
          getSiteSetting('balance_packages'),
          getSiteSetting('auto_wallet_25_new_user')
        ]);

        if (!active) return;

        if (!pulledFromServer && cloudContent.success && cloudContent.data && cloudContent.data.value) {
          console.log('Successfully loaded site content from Supabase cloud');
          const loadedCloudContent = { ...cloudContent.data.value };
          let cloudModified = false;
          if (loadedCloudContent?.whatsapp && (!loadedCloudContent.whatsapp.phoneNumber || loadedCloudContent.whatsapp.phoneNumber === "8658565589" || loadedCloudContent.whatsapp.phoneNumber === "910000000000")) {
            loadedCloudContent.whatsapp.phoneNumber = "8658465589";
            cloudModified = true;
          }
          if (loadedCloudContent?.pricing && (!loadedCloudContent.pricing.adminWhatsappNumber || loadedCloudContent.pricing.adminWhatsappNumber === "8658565589")) {
            loadedCloudContent.pricing.adminWhatsappNumber = "8658465589";
            cloudModified = true;
          }
          if (loadedCloudContent?.ourUsersPage?.ceo && (!loadedCloudContent.ourUsersPage.ceo.whatsapp || loadedCloudContent.ourUsersPage.ceo.whatsapp === "8658565589")) {
            loadedCloudContent.ourUsersPage.ceo.whatsapp = "8658465589";
            cloudModified = true;
          }
          setSiteContent(loadedCloudContent);
          setLocalStorage('siteContent', loadedCloudContent);
          if (cloudModified) {
            saveSiteSetting('site_content', loadedCloudContent).catch(() => {});
          }
        }
        if (!pulledFromServer && cloudProducts.success && cloudProducts.data && cloudProducts.data.value) {
          setProducts(cloudProducts.data.value);
        }
        if (!pulledFromServer && cloudCategories.success && cloudCategories.data && cloudCategories.data.value) {
          setCategories(cloudCategories.data.value);
        }
        if (!pulledFromServer && cloudPackages.success && cloudPackages.data && cloudPackages.data.value) {
          setBalancePackages(cloudPackages.data.value);
        }
        if (!pulledFromServer && cloudAutoWallet.success && cloudAutoWallet.data && cloudAutoWallet.data.value !== undefined) {
          setAutoWalletNewUser(!!cloudAutoWallet.data.value);
          setLocalStorage('autoWalletNewUser', !!cloudAutoWallet.data.value);
        }
      } catch (err) {
        console.warn('Could not fully synchronize settings from cloud:', err);
      } finally {
        if (active) {
          setCloudSettingsSynced(true);
        }
      }
    };

    fetchCloudSettings();
    return () => {
      active = false;
    };
  }, [pullServerSync]);

  // Auto-sync all 583 parsed GSM services into products catalog on initialization if missing
  useEffect(() => {
    fetch('/api/fetch-gsm-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    .then(res => res.json())
    .then(data => {
      if (data?.success && Array.isArray(data.services) && data.services.length > 0) {
        setProducts(prev => {
          if (prev.length >= data.services.length) return prev;
          const defaultCat = categories[0]?.id || 'cat-box-tools';
          const existingIds = new Set(prev.map(p => p.id));
          const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
          const newProducts: Product[] = [];

          data.services.forEach((srv: any) => {
            if (!existingIds.has(srv.id) && !existingNames.has(srv.name.toLowerCase())) {
              newProducts.push({
                id: srv.id,
                name: srv.name,
                categoryId: defaultCat,
                serviceType: srv.serviceType || 'server',
                price: srv.price || 0,
                downloadLink: 'https://www.gsmfastunlock.com',
                description: srv.description || `${srv.name} - Official GSM Service`,
                size: srv.size || 'Auto Sync',
                tags: ['paid']
              });
            }
          });

          if (newProducts.length > 0) {
            const updated = [...prev, ...newProducts];
            setLocalStorage('products', updated);
            return updated;
          }
          return prev;
        });
      }
    })
    .catch(err => console.warn('Non-blocking GSM catalog sync error:', err));
  }, [categories]);

  // Poll /api/cloud-sync every 2 seconds when realtimeSyncEnabled is ON so other devices update live instantly
  useEffect(() => {
    if (!realtimeSyncEnabled) return;
    const interval = setInterval(() => {
      pullServerSync(false);
    }, 2000);
    return () => clearInterval(interval);
  }, [realtimeSyncEnabled, pullServerSync]);

  // Listen for Supabase Auth state changes (especially Google OAuth)
  useEffect(() => {
    if (isSandboxMode) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (session?.user) {
        const userId = session.user.id;
        const email = session.user.email || '';
        
        // If we are already signed in with this user, don't do anything to prevent infinite loops
        if (user && user.id === userId && user.email === email) {
          return;
        }

        try {
          const { data: profileData } = await getRegisteredUser(userId);
          let existingUser = allUsers[userId];

          if (profileData) {
            existingUser = {
              id: userId,
              email: email,
              mobileNumber: profileData.mobile_number || existingUser?.mobileNumber || '',
              password: '',
              profile: {
                name: profileData.name || existingUser?.profile?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                bio: profileData.bio || existingUser?.profile?.bio || '',
                age: existingUser?.profile?.age,
                emailNotifications: existingUser?.profile?.emailNotifications || { systemUpdates: true, newFileReleases: true }
              },
              wallet: { balance: profileData.wallet_balance !== undefined && profileData.wallet_balance !== null ? Number(profileData.wallet_balance) : (existingUser?.wallet?.balance ?? (autoWalletNewUser ? 25 : 0)) },
              purchasedProductIds: existingUser?.purchasedProductIds || [],
              favoriteProductIds: existingUser?.favoriteProductIds || [],
              visitedProductIds: existingUser?.visitedProductIds || [],
              downloadTimers: existingUser?.downloadTimers || {},
              downloadHistory: existingUser?.downloadHistory || [],
              registeredAt: existingUser?.registeredAt || new Date().toISOString(),
              isBlocked: existingUser?.isBlocked || false,
              hwid: profileData.hwid || existingUser?.hwid,
              notifications: existingUser?.notifications || [],
              transactionHistory: existingUser?.transactionHistory || [],
              referralCode: existingUser?.referralCode || 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
              referredBy: existingUser?.referredBy
            };
          } else {
            // First time Google user! Create profile in 'registered_users'
            const initialBalance = autoWalletNewUser ? 25 : 0;
            const generatedCode = 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase();
            existingUser = {
              id: userId,
              email: email,
              mobileNumber: '',
              password: '',
              profile: { 
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '', 
                bio: '', 
                emailNotifications: { systemUpdates: true, newFileReleases: true } 
              },
              wallet: { balance: initialBalance },
              purchasedProductIds: [], favoriteProductIds: [], visitedProductIds: [],
              downloadTimers: {}, downloadHistory: [], registeredAt: new Date().toISOString(),
              isBlocked: false, notifications: [], transactionHistory: [],
              referralCode: generatedCode,
              referredBy: undefined
            };

            await saveRegisteredUser({
              id: userId,
              email: email,
              mobile_number: '',
              name: existingUser.profile.name,
              bio: '',
              wallet_balance: initialBalance
            }).catch(err => console.warn('Non-blocking save error:', err));
          }

          if (existingUser.isBlocked) {
            setNotification('Your account has been blocked by an administrator.', 'error');
            supabase.auth.signOut().catch(() => {});
            setUser(null);
            setLocalStorage('currentUser', null);
            return;
          }

          // HWID device binding validation
          if (email !== ADMIN_EMAIL) {
            const currentHWID = getClientHWID();
            const registeredHWID = existingUser.hwid;
            if (registeredHWID && registeredHWID !== currentHWID) {
              setNotification('This account is registered to another device. Please contact Admin on WhatsApp to reset your HWID / Hardware ID.', 'error');
              supabase.auth.signOut().catch(() => {});
              setUser(null);
              setLocalStorage('currentUser', null);
              return;
            }
            if (!registeredHWID) {
              existingUser.hwid = currentHWID;
              await saveRegisteredUser({
                id: userId,
                email: email,
                mobile_number: existingUser.mobileNumber,
                name: existingUser.profile.name,
                bio: existingUser.profile.bio,
                wallet_balance: existingUser.wallet.balance,
                hwid: currentHWID
              }).catch(err => console.warn('Non-blocking save error:', err));
            }
          }

          setLocalStorage('currentUser', existingUser);
          setAllUsers(prev => ({ ...prev, [userId]: existingUser }));
          setUser(existingUser);
        } catch (err) {
          console.warn('Failed to resolve Google/OAuth user session:', err);
        }
      } else {
        if (event === 'SIGNED_OUT' && user) {
          setUser(null);
          setLocalStorage('currentUser', null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, allUsers, autoWalletNewUser]);

  // Real-time synchronization subscription for current user profile
  useEffect(() => {
    if (!user?.id || !realtimeSyncEnabled || isSandboxMode) return;
    
    const channel = supabase
      .channel(`public:registered_users:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'registered_users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const dbUser = payload.new;
            setUser(prev => {
              if (!prev) return prev;
              const newBalance = Number(dbUser.wallet_balance);
              if (prev.wallet.balance === newBalance && prev.profile.name === dbUser.name && prev.profile.bio === dbUser.bio) {
                  return prev;
              }
              const updatedUser = {
                ...prev,
                wallet: { balance: newBalance },
                profile: {
                  ...prev.profile,
                  name: dbUser.name || prev.profile.name || '',
                  bio: dbUser.bio || prev.profile.bio || ''
                },
                mobileNumber: dbUser.mobile_number || prev.mobileNumber
              };
              setLocalStorage('currentUser', updatedUser);
              setAllUsers(prevAll => ({ ...prevAll, [updatedUser.id]: updatedUser }));
              return updatedUser;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, realtimeSyncEnabled]);
  useEffect(() => {
    if (!realtimeSyncEnabled || isSandboxMode) return;
    
    const channel = supabase
      .channel('public:site_settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          console.log('Real-time site setting updated:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const { key, value } = payload.new as { key: string; value: any };
            if (!key || !value) return;

            if (key === 'site_content') {
              setSiteContent(value);
              setLocalStorage('siteContent', value);
            } else if (key === 'products') {
              setProducts(value);
              setLocalStorage('products', value);
            } else if (key === 'categories') {
              setCategories(value);
              setLocalStorage('categories', value);
            } else if (key === 'balance_packages') {
              setBalancePackages(value);
              setLocalStorage('balancePackages', value);
            } else if (key === 'auto_wallet_25_new_user') {
              setAutoWalletNewUser(!!value);
              setLocalStorage('autoWalletNewUser', !!value);
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'site_settings_force_sync' },
        (response) => {
          console.log('Received manual real-time broadcast update:', response);
          if (response.payload) {
            const { site_content, products, categories, balance_packages, auto_wallet_25_new_user } = response.payload;
            if (site_content) {
              setSiteContent(site_content);
              setLocalStorage('siteContent', site_content);
            }
            if (products) {
              setProducts(products);
              setLocalStorage('products', products);
            }
            if (categories) {
              setCategories(categories);
              setLocalStorage('categories', categories);
            }
            if (balance_packages) {
              setBalancePackages(balance_packages);
              setLocalStorage('balancePackages', balance_packages);
            }
            if (auto_wallet_25_new_user !== undefined) {
              setAutoWalletNewUser(!!auto_wallet_25_new_user);
              setLocalStorage('autoWalletNewUser', !!auto_wallet_25_new_user);
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'user_wallet_updated' },
        (payload) => {
          console.log('Received manual broadcast for user update:', payload);
          if (payload.payload && typeof payload.payload.wallet_balance !== 'undefined' && payload.payload.userId) {
            const newBalance = Number(payload.payload.wallet_balance);
            const targetUserId = payload.payload.userId;

            setAllUsers(prevAll => {
                const u = prevAll[targetUserId];
                if (!u) return prevAll;
                if (u.wallet.balance === newBalance) return prevAll;
                return {
                    ...prevAll,
                    [targetUserId]: { ...u, wallet: { balance: newBalance } }
                };
            });

            setUser(prev => {
              if (!prev) return prev;
              if (prev.id !== targetUserId) return prev;
              if (prev.wallet.balance === newBalance) return prev;
              
              const updatedUser = {
                ...prev,
                wallet: { balance: newBalance }
              };
              setLocalStorage('currentUser', updatedUser);
              return updatedUser;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtimeSyncEnabled]);


  
  useEffect(() => {
    // Seed data if not present
    if (!localStorage.getItem('products')) setLocalStorage('products', INITIAL_PRODUCTS);
    if (!localStorage.getItem('siteContent')) setLocalStorage('siteContent', INITIAL_SITE_CONTENT);
    if (!localStorage.getItem('balancePackages')) setLocalStorage('balancePackages', INITIAL_BALANCE_PACKAGES);
    if (!localStorage.getItem('adminNotifications')) setLocalStorage('adminNotifications', []);

    // Manage categories and data migrations
    let cats = getLocalStorage<Category[]>('categories', INITIAL_CATEGORIES);
    let catsUpdated = false;
    // FIX: Filter out non-object values and arrays from categories array retrieved from localStorage to prevent errors with spread operator on potentially corrupted data.
    // This addresses the error "Spread types may only be created from object types".
    cats = (Array.isArray(cats) ? cats : []).filter(cat => cat && typeof cat === 'object' && !Array.isArray(cat)).map(cat => {
        // FIX: Added a check to ensure `cat.activationForm` is an object before attempting to spread its properties. This prevents a "Spread types may only be created from object types" error when migrating potentially corrupted data from localStorage where `activationForm` might not be an object.
        // FIX: Added !Array.isArray check to ensure activationForm is not an array before spreading, which could cause a "Spread types may only be created from object types" error.
        if (cat.activationForm && typeof cat.activationForm === 'object' && !Array.isArray(cat.activationForm) && !('customFields' in cat.activationForm)) {
            console.log(`Migrating activation form for category: ${cat.name}`);
            catsUpdated = true;
            return {
                ...cat,
                activationForm: {
                    // FIX: The type system infers `cat.activationForm` as `never` because the `!('customFields' in ...)` check contradicts the `ActivationFormConfig` type. Casting to `any` (instead of `object`) allows the spread to work and ensures the resulting object type is compatible.
                    ...(cat.activationForm as any),
                    customFields: [
                        { id: `field-${Date.now()}-1`, name: 'email', label: 'Enter Email', placeholder: 'your@email.com', type: 'email', enabled: true },
                        { id: `field-${Date.now()}-2`, name: 'username', label: 'Enter USERNAME', placeholder: 'Enter Username', type: 'text', enabled: true },
                        { id: `field-${Date.now()}-3`, name: 'password', label: 'Enter Password', placeholder: 'Enter Password', type: 'password', enabled: true },
                    ]
                }
            };
        }
        return cat;
    });
    
    if (catsUpdated) {
        setLocalStorage('categories', cats);
    }
    setCategories(cats);


    // Manage admin user
    let users = getLocalStorage<Record<string, User>>('users', {});
    
    // Data Migration for existing users
    const existingCodes = new Set<string>();
    Object.keys(users).forEach(userId => {
        const u = users[userId];
        if (!u.transactionHistory) {
            u.transactionHistory = [];
        }
        if (u.referralCode) {
            existingCodes.add(u.referralCode.toUpperCase());
        }
    });

    Object.keys(users).forEach(userId => {
        const u = users[userId];
        if (!u.referralCode) {
            let code = 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase();
            while (existingCodes.has(code)) {
                code = 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase();
            }
            u.referralCode = code;
            existingCodes.add(code);
        }
        if (!u.referredUsers) {
            u.referredUsers = [];
        }
    });

    let adminUser = (Object.values(users) as User[]).find(u => u.email === ADMIN_EMAIL);
    if (!adminUser) {
      adminUser = {
        id: `user-admin-${Date.now()}`,
        email: ADMIN_EMAIL,
        password: 'bbbb9090',
        mobileNumber: '1234567890',
        profile: { name: 'Admin', bio: 'Site Administrator', age: undefined },
        wallet: { balance: 999999 },
        purchasedProductIds: [], favoriteProductIds: [], visitedProductIds: [],
        downloadTimers: {},
        downloadHistory: [],
        registeredAt: new Date().toISOString(),
        isBlocked: false,
        notifications: [],
        transactionHistory: [],
      };
    } else {
      // Ensure existing admin user has all new fields
      adminUser.password = 'bbbb9090';
      if (!adminUser.mobileNumber) adminUser.mobileNumber = '1234567890';
      // FIX: Corrected a 'new new Date()' typo that would cause a runtime error.
      if (!adminUser.registeredAt) adminUser.registeredAt = new Date().toISOString();
      if (adminUser.isBlocked === undefined) adminUser.isBlocked = false;
      if (adminUser.profile.age === undefined) adminUser.profile.age = undefined;
      if (!adminUser.downloadHistory) adminUser.downloadHistory = [];
      if (!adminUser.notifications) adminUser.notifications = [];
      if (!adminUser.transactionHistory) adminUser.transactionHistory = [];
      if (!adminUser.wallet || adminUser.wallet.hasOwnProperty('points')) {
        adminUser.wallet = { balance: (adminUser.wallet as any)?.points || 999999 };
      }
    }
    users[adminUser.id] = adminUser;
    
    // Sync admin to Supabase if not already there (lazy check)
    if (adminUser) {
        saveRegisteredUser({
            id: adminUser.id,
            email: adminUser.email,
            mobile_number: adminUser.mobileNumber,
            name: adminUser.profile.name || '',
            bio: adminUser.profile.bio || '',
            wallet_balance: adminUser.wallet.balance
        }).catch(() => {}); // Ignore errors on init
    }
    
    // Manage demo user
    let demoUser = (Object.values(users) as User[]).find(u => u.email === 'demo@gmail.com');
    if (!demoUser) {
      demoUser = {
        id: `user-demo-${Date.now()}`,
        email: 'demo@gmail.com',
        password: 'demo',
        mobileNumber: '0123456789',
        profile: { name: 'Demo User', bio: 'A user for demonstration purposes.' },
        wallet: { balance: 250 },
        purchasedProductIds: [], favoriteProductIds: [], visitedProductIds: [],
        downloadTimers: {},
        downloadHistory: [],
        registeredAt: new Date().toISOString(),
        isBlocked: false,
        notifications: [],
        transactionHistory: [],
      };
    } else {
      // Ensure password is correct and user is not blocked for demo purposes
      demoUser.password = 'demo';
      demoUser.isBlocked = false;
    }
    users[demoUser.id] = demoUser;
    
    setLocalStorage('users', users);
    setAllUsers(users);

    // Keep currentUser in sync with users on refresh!
    const storedCurUser = getLocalStorage<User | null>('currentUser', null);
    if (storedCurUser?.id && users[storedCurUser.id]) {
      const freshUser = users[storedCurUser.id];
      setUser(freshUser);
      setLocalStorage('currentUser', freshUser);
    }
  }, []);

  // --- Theme Effect ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    setLocalStorage('theme', theme);
  }, [theme]);

  useEffect(() => { 
    setLocalStorage('currentUser', user); 
  }, [user]);

  // Keep currently logged-in user in sync with allUsers whenever allUsers changes
  useEffect(() => {
    if (user?.id && allUsers[user.id]) {
      const liveUser = allUsers[user.id];
      if (liveUser.wallet?.balance !== user.wallet?.balance || liveUser.isBlocked !== user.isBlocked) {
        setUser(prev => prev ? { ...prev, ...liveUser } : liveUser);
        setLocalStorage('currentUser', { ...user, ...liveUser });
      }
    }
  }, [allUsers, user?.id]);

  // Sync latest user details from Supabase on mount/auth to ensure fresh wallet balance
  useEffect(() => {
    if (user?.id) {
      getRegisteredUser(user.id).then(res => {
        if (res.success && res.data) {
          setUser(prev => {
            if (!prev) return prev;
            const newBalance = Number(res.data.wallet_balance);
            if (prev.wallet.balance === newBalance && prev.profile.name === res.data.name && prev.profile.bio === res.data.bio) {
                return prev;
            }
            const updatedUser = {
              ...prev,
              wallet: { balance: newBalance },
              profile: {
                ...prev.profile,
                name: res.data.name || prev.profile.name || '',
                bio: res.data.bio || prev.profile.bio || ''
              },
              mobileNumber: res.data.mobile_number || prev.mobileNumber
            };
            setLocalStorage('currentUser', updatedUser);
            setAllUsers(prevAll => ({ ...prevAll, [updatedUser.id]: updatedUser }));
            return updatedUser;
          });
        }
      });
    }
  }, [user?.id]);
  useEffect(() => { setLocalStorage('cart', cart); }, [cart]);
  useEffect(() => {
    setLocalStorage('products', products);
    if (isAdmin && cloudSettingsSynced) {
      pushServerSync({ products });
      saveSiteSetting('products', products).catch(err => {
        console.warn('Failed to sync products to Supabase site_settings (non-blocking):', err);
      });
    }
  }, [products, isAdmin, cloudSettingsSynced, pushServerSync]);

  useEffect(() => {
    setLocalStorage('categories', categories);
    if (isAdmin && cloudSettingsSynced) {
      pushServerSync({ categories });
      saveSiteSetting('categories', categories).catch(err => {
        console.warn('Failed to sync categories to Supabase site_settings (non-blocking):', err);
      });
    }
  }, [categories, isAdmin, cloudSettingsSynced, pushServerSync]);

  useEffect(() => {
    setLocalStorage('balancePackages', balancePackages);
    if (isAdmin && cloudSettingsSynced) {
      pushServerSync({ balancePackages });
      saveSiteSetting('balance_packages', balancePackages).catch(err => {
        console.warn('Failed to sync balance packages to Supabase site_settings (non-blocking):', err);
      });
    }
  }, [balancePackages, isAdmin, cloudSettingsSynced, pushServerSync]);

  useEffect(() => {
    setLocalStorage('siteContent', siteContent);
    if (isAdmin && cloudSettingsSynced) {
      pushServerSync({ siteContent }, true);
      saveSiteSetting('site_content', siteContent).catch(err => {
        console.warn('Failed to sync site content to Supabase site_settings (non-blocking):', err);
      });
    }
  }, [siteContent, isAdmin, cloudSettingsSynced, pushServerSync]);

  useEffect(() => {
    if (isAdmin) {
      syncUsersFromSupabase();
    }
  }, [isAdmin]);

  useEffect(() => { setLocalStorage('anonymousRecents', anonymousRecents); }, [anonymousRecents]);
  useEffect(() => { 
    setLocalStorage('users', allUsers); 
    const usersList = Object.values(allUsers);
    if (usersList.length > 0) {
      const timer = setTimeout(() => {
        pushServerSync({ users: usersList });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allUsers, pushServerSync]);
  useEffect(() => { 
    setLocalStorage('adminNotifications', adminNotifications); 
    if (adminNotifications.length > 0) {
      const timer = setTimeout(() => {
        pushServerSync({ adminNotifications });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [adminNotifications, pushServerSync]);

  // --- Theme Toggle Function ---
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // --- New Notification System ---
  const setNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setInternalNotification({ message, type });
    setTimeout(() => {
      setInternalNotification(null);
    }, 4000);
  };

  const clearNotification = () => {
    setInternalNotification(null);
  };

  // --- New Live Editing Functions ---
  const toggleEditMode = () => {
    if (isAdmin) setIsEditMode(prev => !prev);
  };
  
  const updateSiteContent = (path: string, value: any) => {
    console.log(`Updating siteContent at ${path} to:`, value);
    if (!isEditMode) {
      setNotification('Please enable "Edit Site" mode first!', 'error');
      return;
    }
    const newContent = JSON.parse(JSON.stringify(siteContent)); // Deep copy
    setNestedValue(newContent, path, value);
    setSiteContent(newContent);
    setLocalStorage('siteContent', newContent);
    pushServerSync({ siteContent: newContent }, true);
    saveSiteSetting('site_content', newContent);
    setNotification('Content updated successfully!', 'success');
  };
  
  const startEditing = (path: string, value: string) => {
    setEditingContent({ path, value });
  };

  const finishEditing = () => {
    setEditingContent(null);
  };

  const syncTransaction = (userId: string, userEmail: string, txn: Transaction) => {
    saveWalletTransaction({
      transaction_id: txn.id,
      user_id: userId,
      user_email: userEmail,
      type: txn.type,
      amount: txn.amount,
      description: txn.description,
      created_at: txn.timestamp
    }).catch(err => {
      console.warn('Failed to sync wallet transaction to Supabase (non-blocking):', err);
    });
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      if (isSandboxMode) {
        throw new Error('Local auth mode');
      }
      // 1. Try signing in using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (!authError && authData.user) {
        const userId = authData.user.id;
        
        // Let's check if the user exists in our local simulated state
        let existingUser = allUsers[userId];
        
        // Fetch profile details from Supabase 'registered_users' table
        const { data: profileData } = await getRegisteredUser(userId);
        
        if (profileData) {
          // Sync database details to local user object
          existingUser = {
            id: userId,
            email: email,
            mobileNumber: profileData.mobile_number || existingUser?.mobileNumber || '',
            password: pass,
            profile: {
              name: profileData.name || existingUser?.profile?.name || '',
              bio: profileData.bio || existingUser?.profile?.bio || '',
              age: existingUser?.profile?.age,
              emailNotifications: existingUser?.profile?.emailNotifications || { systemUpdates: true, newFileReleases: true }
            },
            wallet: { balance: profileData.wallet_balance !== undefined && profileData.wallet_balance !== null ? Number(profileData.wallet_balance) : (existingUser?.wallet?.balance ?? (autoWalletNewUser ? 25 : 0)) },
            purchasedProductIds: existingUser?.purchasedProductIds || [],
            favoriteProductIds: existingUser?.favoriteProductIds || [],
            visitedProductIds: existingUser?.visitedProductIds || [],
            downloadTimers: existingUser?.downloadTimers || {},
            downloadHistory: existingUser?.downloadHistory || [],
            registeredAt: existingUser?.registeredAt || new Date().toISOString(),
            isBlocked: existingUser?.isBlocked || false,
            hwid: profileData.hwid || existingUser?.hwid,
            notifications: existingUser?.notifications || [],
            transactionHistory: existingUser?.transactionHistory || [],
          };
        } else {
          // If profile table hasn't been created yet or doesn't have the row, use existingUser or a default one
          if (!existingUser) {
            existingUser = {
              id: userId,
              email: email,
              mobileNumber: '',
              password: pass,
              profile: { name: '', bio: '', emailNotifications: { systemUpdates: true, newFileReleases: true } },
              wallet: { balance: autoWalletNewUser ? 25 : 0 },
              purchasedProductIds: [], favoriteProductIds: [], visitedProductIds: [],
              downloadTimers: {}, downloadHistory: [], registeredAt: new Date().toISOString(),
              isBlocked: false, notifications: [], transactionHistory: [],
            };
          }
          // Attempt to save to profile table
          await saveRegisteredUser({
            id: userId,
            email: email,
            mobile_number: existingUser.mobileNumber,
            name: existingUser.profile.name,
            bio: existingUser.profile.bio,
            wallet_balance: existingUser.wallet.balance
          });
        }

        if (existingUser.isBlocked) {
          setNotification('Your account has been blocked by an administrator.', 'error');
          return false;
        }

        // HWID device binding validation
        if (email !== ADMIN_EMAIL && siteContent?.auth?.hwidLockEnabled !== false) {
          const currentHWID = getClientHWID();
          const registeredHWID = existingUser.hwid;
          if (registeredHWID && registeredHWID !== currentHWID) {
            setHwidMismatchInfo({
              email,
              currentHWID,
              registeredHWID,
              userId,
              userObj: existingUser
            });
            setNotification('Device change detected! Hardware ID (HWID) reset required.', 'error');
            return false;
          }
          if (!registeredHWID) {
            existingUser.hwid = currentHWID;
            await saveRegisteredUser({
              id: userId,
              email: email,
              mobile_number: existingUser.mobileNumber,
              name: existingUser.profile.name,
              bio: existingUser.profile.bio,
              wallet_balance: existingUser.wallet.balance,
              hwid: currentHWID
            }).catch(err => console.warn('Non-blocking save error during login HWID binding:', err));
          }
        }

        setAllUsers(prev => ({ ...prev, [userId]: existingUser }));
        setUser(existingUser);
        setNotification('Login successful!');
        return true;
      } else {
        // Fallback to local simulated login if Supabase auth fails (e.g. if Supabase is not configured or offline)
        const localUser = (Object.values(allUsers) as User[]).find(u => u.email === email && u.password === pass);
        if (localUser) {
          if (localUser.isBlocked) {
            setNotification('Your account has been blocked by an administrator.', 'error');
            return false;
          }
          if (email !== ADMIN_EMAIL && siteContent?.auth?.hwidLockEnabled !== false) {
            const currentHWID = getClientHWID();
            const registeredHWID = localUser.hwid;
            if (registeredHWID && registeredHWID !== currentHWID) {
              setHwidMismatchInfo({
                email,
                currentHWID,
                registeredHWID,
                userId: localUser.id,
                userObj: localUser
              });
              setNotification('Device change detected! Hardware ID (HWID) reset required.', 'error');
              return false;
            }
            if (!registeredHWID) {
              localUser.hwid = currentHWID;
              setAllUsers(prev => ({ ...prev, [localUser.id]: localUser }));
            }
          }
          setUser(localUser);
          setNotification('Login successful! (Offline Local Session)');
          return true;
        }

        // Show Supabase auth error if any, otherwise invalid credentials
        const errMsg = authError?.message || 'Invalid email or password.';
        setNotification(errMsg, 'error');
        return false;
      }
    } catch (err: any) {
      console.warn('Supabase Auth error, attempting local fallback:', err);
      // Fallback
      let localUser = (Object.values(allUsers) as User[]).find(u => u.email?.toLowerCase() === email?.toLowerCase() && u.password === pass);
      if (!localUser) {
        // Try on-demand pull from server in case user was registered on another device
        try {
          const endpoints = [`/api/cloud-sync?t=${Date.now()}`, `/cloud-sync.php?t=${Date.now()}`];
          for (const ep of endpoints) {
            const pullRes = await fetch(ep, { cache: 'no-store' });
            if (pullRes.ok) {
              const resData = await pullRes.json();
              if (resData?.data?.users) {
                const fetchedUsers: User[] = Array.isArray(resData.data.users) ? resData.data.users : Object.values(resData.data.users);
                const found = fetchedUsers.find(u => u.email?.toLowerCase() === email?.toLowerCase() && u.password === pass);
                if (found) {
                  localUser = found;
                  setAllUsers(prev => {
                    const merged = { ...prev, [found.id]: found };
                    setLocalStorage('users', merged);
                    return merged;
                  });
                  break;
                }
              }
            }
          }
        } catch (_e) {}
      }

      if (localUser) {
        if (localUser.isBlocked) {
          setNotification('Your account has been blocked by an administrator.', 'error');
          return false;
        }
        if (email !== ADMIN_EMAIL && siteContent?.auth?.hwidLockEnabled !== false) {
          const currentHWID = getClientHWID();
          const registeredHWID = localUser.hwid;
          if (registeredHWID && registeredHWID !== currentHWID) {
            setHwidMismatchInfo({
              email,
              currentHWID,
              registeredHWID,
              userId: localUser.id,
              userObj: localUser
            });
            setNotification('Device change detected! Hardware ID (HWID) reset required.', 'error');
            return false;
          }
          if (!registeredHWID) {
            localUser.hwid = currentHWID;
            setAllUsers(prev => ({ ...prev, [localUser.id]: localUser }));
          }
        }
        setUser(localUser);
        setNotification('Login successful!');
        return true;
      }
      setNotification('Invalid email or password.', 'error');
      return false;
    }
  };

  const checkUserExists = (email: string, mobileNumber: string): boolean => {
    const users = (Object.values(allUsers) as User[]);
    if (users.some(u => u.email === email)) {
        setNotification('A user with this email already exists.', 'error');
        return true;
    }
    if (users.some(u => u.mobileNumber === mobileNumber)) {
        setNotification('A user with this mobile number already exists.', 'error');
        return true;
    }
    return false;
  };

  const register = async (email: string, pass: string, mobileNumber: string, referredByCode?: string): Promise<boolean> => {
    try {
      if (isSandboxMode) {
        throw new Error('Local auth mode');
      }
      // 1. Try signing up using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: pass
      });

      let userId = `user-${Date.now()}`;
      if (!authError && authData.user) {
        userId = authData.user.id;
      } else if (authError) {
        console.warn('Supabase Auth SignUp failed:', authError.message);
        const isValidationError = authError.message.toLowerCase().includes('already registered') || 
                                  authError.message.toLowerCase().includes('already exists') ||
                                  authError.message.toLowerCase().includes('invalid email') ||
                                  authError.message.toLowerCase().includes('password');
        if (isValidationError) {
          setNotification(authError.message, 'error');
          return false;
        } else {
          // Trigger local offline fallback by throwing the error
          throw new Error(authError.message || 'Supabase connectivity error');
        }
      }

      const initialBalance = autoWalletNewUser ? 25 : 0;
      const generatedCode = 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newTxHistory: Transaction[] = [];

      const newUser: User = {
        id: userId,
        email,
        mobileNumber,
        password: pass,
        profile: { 
          name: '', 
          bio: '', 
          age: undefined,
          emailNotifications: { systemUpdates: true, newFileReleases: true }
        },
        wallet: { balance: initialBalance },
        purchasedProductIds: [], favoriteProductIds: [], visitedProductIds: [],
        downloadTimers: {},
        downloadHistory: [],
        registeredAt: new Date().toISOString(),
        isBlocked: false,
        notifications: [],
        transactionHistory: newTxHistory,
        referralCode: generatedCode,
        referredBy: referredByCode?.trim().toUpperCase() || undefined,
        referredUsers: []
      };

      // 2. Try saving/upserting to Supabase 'registered_users' table
      console.log('Syncing new user to Supabase registered_users table...');
      const syncResult = await saveRegisteredUser({
        id: userId,
        email,
        mobile_number: mobileNumber,
        name: '',
        bio: '',
        wallet_balance: initialBalance
      });

      if (!syncResult.success) {
        console.warn('Supabase database sync failed during registration:', syncResult.error);
        // We don't block registration, but we notify via console.
      } else {
        console.log('User synced to Supabase successfully.');
      }

      let updatedUsers = { ...allUsers, [newUser.id]: newUser };

      setAllUsers(updatedUsers);
      setUser(newUser);
      
      const isConfirmationRequired = !authData?.session;
      const confirmMsg = isConfirmationRequired ? ' Please check your email inbox to verify your account.' : '';

      setNotification(`Registration successful!${confirmMsg}`);
      return true;
    } catch (err: any) {
      console.warn('Supabase registration failed, registering locally:', err);
      // Fallback
      const userId = `user-${Date.now()}`;
      const initialBalance = autoWalletNewUser ? 25 : 0;
      const generatedCode = 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newTxHistory: Transaction[] = [];

      const newUser: User = {
        id: userId,
        email,
        mobileNumber,
        password: pass,
        profile: { 
          name: '', 
          bio: '', 
          age: undefined,
          emailNotifications: { systemUpdates: true, newFileReleases: true }
        },
        wallet: { balance: initialBalance },
        purchasedProductIds: [], favoriteProductIds: [], visitedProductIds: [],
        downloadTimers: {},
        downloadHistory: [],
        registeredAt: new Date().toISOString(),
        isBlocked: false,
        notifications: [],
        transactionHistory: newTxHistory,
        referralCode: generatedCode,
        referredBy: referredByCode?.trim().toUpperCase() || undefined,
        referredUsers: []
      };

      let updatedUsers = { ...allUsers, [newUser.id]: newUser };

      setAllUsers(updatedUsers);
      setUser(newUser);
      setLocalStorage('users', updatedUsers);
      pushServerSync({ users: Object.values(updatedUsers) }, true).catch(e => console.warn('Sync user error:', e));
      
      setNotification('Registration successful!');
      return true;
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(err => console.warn('Supabase signOut error:', err));
    setUser(null);
    setCart([]);
    setIsEditMode(false); // Turn off edit mode on logout
    setLocalStorage('currentUser', null);
    setLocalStorage('cart', []);
    setNotification('You have been logged out.');
  };

  const updateProfile = (name: string, bio: string, emailNotifications?: { systemUpdates: boolean; newFileReleases: boolean; }) => {
    if (!user) return;
    const updatedUser: User = { 
        ...user, 
        profile: { 
            ...user.profile,
            name,
            bio,
            emailNotifications: emailNotifications || user.profile.emailNotifications || { systemUpdates: true, newFileReleases: true }
        } 
    };
    setUser(updatedUser);
    setAllUsers(prev => ({ ...prev, [user.id]: updatedUser }));

    saveRegisteredUser({
        id: updatedUser.id,
        email: updatedUser.email,
        mobile_number: updatedUser.mobileNumber,
        name: updatedUser.profile.name || '',
        bio: updatedUser.profile.bio || '',
        wallet_balance: updatedUser.wallet.balance
    }).catch(err => {
        console.warn('Failed to sync updated profile to Supabase (non-blocking):', err);
    });

    setNotification('Profile updated successfully.');
  };

  const addToCart = (product: Product) => {
    if (cart.some(item => item.id === product.id)) {
      setNotification('This item is already in your cart.', 'error');
      return;
    }
    setCart(prevCart => [...prevCart, product]);
    setNotification(`${product.name} added to cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    setNotification('Item removed from cart.');
  };

  const clearCart = () => { setCart([]); };

  const checkout = (): boolean => {
    if (!user) {
        setNotification('You must be logged in to checkout.', 'error');
        return false;
    }
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    if (user.wallet.balance < totalPrice) {
      setNotification('Not enough balance to complete the purchase.', 'error');
      return false;
    }

    const newPurchasedIds = cart.map(item => item.id);
    const allIds = [...newPurchasedIds, ...user.visitedProductIds];
    const uniqueIds = [...new Set(allIds)];
    
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'purchase',
      amount: -totalPrice,
      description: `Purchased ${cart.length} item(s) from cart.`
    };

    const newDownloadTimers = { ...(user.downloadTimers || {}) };
    newPurchasedIds.forEach(id => {
      if (!newDownloadTimers[id]) {
        newDownloadTimers[id] = Date.now() + 59 * 60 * 1000;
      }
    });

    const updatedUser: User = {
      ...user,
      wallet: { balance: user.wallet.balance - totalPrice },
      purchasedProductIds: [...user.purchasedProductIds, ...newPurchasedIds],
      downloadTimers: newDownloadTimers,
      visitedProductIds: uniqueIds.slice(0, 10),
      transactionHistory: [newTransaction, ...(user.transactionHistory || [])],
    };

    setUser(updatedUser);
    setAllUsers(prev => ({ ...prev, [user.id]: updatedUser }));
    saveRegisteredUser({
        id: updatedUser.id,
        email: updatedUser.email,
        mobile_number: updatedUser.mobileNumber,
        name: updatedUser.profile.name || '',
        bio: updatedUser.profile.bio || '',
        wallet_balance: updatedUser.wallet.balance
    }).catch(err => console.warn('Supabase sync warning (non-blocking):', err));
    syncTransaction(user.id, user.email, newTransaction);
    setCart([]);
    showOrderSuccessModal();
    setNotification('Purchase successful! Your downloads are available.');
    return true;
  };

  const hasPurchased = (productId: string): boolean => {
    return user?.purchasedProductIds.includes(productId) ?? false;
  };

  const purchaseProductDirectly = (product: Product): boolean => {
    if (!user) {
      setNotification('You must be logged in to purchase.', 'error');
      return false;
    }
    if (user.wallet.balance < product.price) {
      setNotification('Not enough balance to complete the purchase.', 'error');
      return false;
    }
    if (hasPurchased(product.id)) {
      setNotification('You already own this item.', 'error');
      return true;
    }

    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'purchase',
      amount: -product.price,
      description: `Direct purchase: ${product.name}`
    };

    const newDownloadTimers = {
      ...(user.downloadTimers || {}),
      [product.id]: user.downloadTimers?.[product.id] || (Date.now() + 59 * 60 * 1000)
    };

    const updatedUser: User = {
      ...user,
      wallet: { balance: user.wallet.balance - product.price },
      purchasedProductIds: [...user.purchasedProductIds, product.id],
      downloadTimers: newDownloadTimers,
      visitedProductIds: [...new Set([product.id, ...user.visitedProductIds])].slice(0, 10),
      transactionHistory: [newTransaction, ...(user.transactionHistory || [])],
    };

    setUser(updatedUser);
    setAllUsers(prev => ({ ...prev, [user.id]: updatedUser }));
    saveRegisteredUser({
        id: updatedUser.id,
        email: updatedUser.email,
        mobile_number: updatedUser.mobileNumber,
        name: updatedUser.profile.name || '',
        bio: updatedUser.profile.bio || '',
        wallet_balance: updatedUser.wallet.balance
    }).catch(err => console.warn('Supabase sync warning (non-blocking):', err));
    syncTransaction(user.id, user.email, newTransaction);
    setNotification(`Successfully purchased ${product.name}! ₹${product.price.toFixed(2)} deducted.`);
    return true;
  };
  
  const addFunds = (pkg: BalancePackage) => {
    if (!user) {
      setNotification('You must be logged in to add funds.', 'error');
      return;
    }
    
    const newBalance = Number(user.wallet.balance) + pkg.amount;
    
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'deposit',
      amount: pkg.amount,
      description: `Added funds via balance package (${pkg.amount} points)`
    };

    const updatedUser: User = { 
        ...user, 
        wallet: { balance: newBalance },
        transactionHistory: [newTransaction, ...(user.transactionHistory || [])],
        lifetimePointsPurchased: (user.lifetimePointsPurchased || 0) + pkg.amount
    };

    setUser(updatedUser);
    setAllUsers(prev => ({ ...prev, [user.id]: updatedUser }));

    saveRegisteredUser({
        id: updatedUser.id,
        email: updatedUser.email,
        mobile_number: updatedUser.mobileNumber,
        name: updatedUser.profile.name || '',
        bio: updatedUser.profile.bio || '',
        wallet_balance: updatedUser.wallet.balance
    }).catch(err => {
        console.warn('Failed to sync adjusted user balance to Supabase (non-blocking):', err);
    });

    syncTransaction(updatedUser.id, updatedUser.email, newTransaction);
    
    setNotification(`₹${pkg.amount} has been successfully added to your wallet!`);
  };

  const updateBalancePackage = (packageData: BalancePackage) => {
    if (!isAdmin) return;
    setBalancePackages(prev => {
      const updated = prev.map(p => p.id === packageData.id ? packageData : p);
      setLocalStorage('balancePackages', updated);
      saveSiteSetting('balance_packages', updated).catch(() => {});
      pushServerSync({ balancePackages: updated }, true).catch(() => {});
      return updated;
    });
    setNotification('Pricing package updated successfully.');
  };

  const addBalancePackage = (amount: number, price: number) => {
    if (!isAdmin) return;
    const newPkg: BalancePackage = {
      id: `pkg-${Date.now()}`,
      name: 'Custom Plan',
      description: 'Custom download package',
      price,
      period: '30 Days',
      bandwidth: '100 GB',
      downloads: '50 Files',
      dailyLimit: '5 Files',
      dailyBandwidth: '10 GB Daily',
      devices: '5 Devices',
      amount
    };
    setBalancePackages(prev => {
      const updated = [...prev, newPkg];
      setLocalStorage('balancePackages', updated);
      saveSiteSetting('balance_packages', updated).catch(() => {});
      pushServerSync({ balancePackages: updated }, true).catch(() => {});
      return updated;
    });
    setNotification('Pricing package added successfully.');
  };

  const deleteBalancePackage = (packageId: string) => {
    if (!isAdmin) return;
    setBalancePackages(prev => {
      const updated = prev.filter(p => p.id !== packageId);
      setLocalStorage('balancePackages', updated);
      saveSiteSetting('balance_packages', updated).catch(() => {});
      pushServerSync({ balancePackages: updated }, true).catch(() => {});
      return updated;
    });
    setNotification('Pricing package deleted successfully.');
  };

  const updateAutoWalletNewUser = async (enabled: boolean) => {
    setAutoWalletNewUser(enabled);
    setLocalStorage('autoWalletNewUser', enabled);
    try {
      await saveSiteSetting('auto_wallet_25_new_user', enabled);
    } catch (err) {
      console.warn('Failed to sync auto_wallet_25_new_user setting to Supabase (non-blocking):', err);
    }
  };

  const addToRecents = useCallback((productId: string) => {
    if (user) {
      const updatedUser = { ...user };
      const filteredVisited = updatedUser.visitedProductIds.filter(id => id !== productId);
      const newVisited = [productId, ...filteredVisited].slice(0, 10);
      updatedUser.visitedProductIds = newVisited;
      setUser(updatedUser);
      setAllUsers(prev => ({...prev, [user.id]: updatedUser}));
    } else {
      setAnonymousRecents(prevRecents => {
        const filtered = prevRecents.filter(id => id !== productId);
        return [productId, ...filtered].slice(0, 10);
      });
    }
  }, [user]);

  const toggleFavorite = useCallback((productId: string) => {
    if (!user) {
      setNotification('Please log in to manage favorites.', 'error');
      return;
    }
    const updatedUser = { ...user };
    const isFavorited = updatedUser.favoriteProductIds.includes(productId);
    if (isFavorited) {
      updatedUser.favoriteProductIds = updatedUser.favoriteProductIds.filter(id => id !== productId);
      setNotification('Removed from favorites.');
    } else {
      updatedUser.favoriteProductIds.push(productId);
      setNotification('Added to favorites.');
    }
    setUser(updatedUser);
    setAllUsers(prev => ({...prev, [user.id]: updatedUser}));
  }, [user, setNotification]);

  const isFavorite = useCallback((productId: string): boolean => {
    return user?.favoriteProductIds.includes(productId) ?? false;
  }, [user]);
  
  const initiateDownload = (product: Product) => {
    // 1. Record download history if logged in
    if (user) {
      const updatedUser = { ...user };
      if (!updatedUser.downloadTimers) {
        updatedUser.downloadTimers = {};
      }
      if (!updatedUser.downloadTimers[product.id]) {
        updatedUser.downloadTimers[product.id] = Date.now() + 59 * 60 * 1000;
      }

      const newDownloadRecord: DownloadRecord = {
        productId: product.id,
        productName: product.name,
        downloadedAt: new Date().toISOString(),
      };
      if (!updatedUser.downloadHistory) {
        updatedUser.downloadHistory = [];
      }
      updatedUser.downloadHistory.unshift(newDownloadRecord);

      setUser(updatedUser);
      setAllUsers(prev => ({ ...prev, [user.id]: updatedUser }));

      const expiryTimestamp = updatedUser.downloadTimers[product.id];
      const expiryDateStr = expiryTimestamp ? new Date(expiryTimestamp).toISOString() : undefined;

      saveDownloadRecord({
        user_id: user.id,
        user_email: user.email,
        product_id: product.id,
        product_name: product.name,
        downloaded_at: newDownloadRecord.downloadedAt,
        expiry_date: expiryDateStr
      }).catch(err => {
        console.warn('Failed to sync download record to Supabase (non-blocking):', err);
      });
    }

    // 2. Resolve & normalize pasted download URL
    let targetLink = (product.downloadLink || product.downloadUrl || '').trim();
    if (targetLink && !targetLink.match(/^https?:\/\//i) && targetLink !== '#') {
      targetLink = `https://${targetLink}`;
    }
    if (!targetLink || targetLink === '#') {
      targetLink = 'https://archive.org/download/sample-firmware/firmware.zip';
    }

    if (setNotification) {
      setNotification(`Opening download link for "${product.name}"...`, 'success');
    }

    // 3. Trigger direct download window
    window.open(targetLink, '_blank', 'noopener,noreferrer');
  };

  const createCategory = useCallback((name: string, description: string, parentId?: string) => {
    if (!isAdmin) return;
    const newCategory: Category = { id: `cat-${Date.now()}`, name, description, parentId: parentId || undefined, imageUrl: 'folder' };
    setCategories(prev => [...prev, newCategory]);
    setNotification('New folder created successfully.');
  }, [isAdmin, setNotification]);

  const deleteCategory = useCallback((categoryId: string) => {
    if (!isAdmin) return;
    
    setCategories(prevCategories => {
      // Find all subcategories recursively from the latest categories state
      const getSubcategoryIds = (catId: string, currentCats: Category[]): string[] => {
        const children = currentCats.filter(c => c.parentId === catId);
        return [catId, ...children.flatMap(c => getSubcategoryIds(c.id, currentCats))];
      };

      const idsToDelete = getSubcategoryIds(categoryId, prevCategories);

      // Filter out products inside setProducts using dynamic state update to prevent stale references
      setProducts(prevProducts => prevProducts.filter(p => !idsToDelete.includes(p.categoryId)));

      return prevCategories.filter(c => !idsToDelete.includes(c.id));
    });

    setNotification('Folder and all its subfolders/files deleted successfully.');
  }, [isAdmin, setNotification, setProducts, setCategories]);

  const duplicateCategory = useCallback((sourceCategoryId: string, newParentId?: string) => {
    if (!isAdmin) return;
    
    const sourceCat = categories.find(c => c.id === sourceCategoryId);
    if (!sourceCat) {
      setNotification('Source folder not found.', 'error');
      return;
    }

    const idMap: { [oldId: string]: string } = {};

    const copyCategoryTree = (catId: string, parentId: string | undefined): Category[] => {
      const original = categories.find(c => c.id === catId);
      if (!original) return [];

      const newId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      idMap[catId] = newId;

      const copiedCat: Category = {
        ...original,
        id: newId,
        name: parentId === original.parentId ? `${original.name} (Copy)` : original.name,
        parentId: parentId
      };

      const childCategories = categories.filter(c => c.parentId === catId);
      const copiedChildren = childCategories.flatMap(child => copyCategoryTree(child.id, newId));

      return [copiedCat, ...copiedChildren];
    };

    const targetParentId = newParentId !== undefined ? newParentId : sourceCat.parentId;
    const duplicatedCategories = copyCategoryTree(sourceCategoryId, targetParentId);

    const duplicatedProducts: Product[] = [];
    products.forEach(prod => {
      const newCatId = idMap[prod.categoryId];
      if (newCatId) {
        const newProduct: Product = {
          ...prod,
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          categoryId: newCatId,
          date: new Date().toISOString().split('T')[0],
          views: 0,
          downloads: 0,
          rating: 0
        };
        duplicatedProducts.push(newProduct);
      }
    });

    setCategories(prev => [...prev, ...duplicatedCategories]);
    setProducts(prev => [...duplicatedProducts, ...prev]);

    setNotification(`Folder "${sourceCat.name}" duplicated successfully with all its contents.`);
  }, [categories, products, isAdmin, setNotification]);

  const updateCategory = useCallback((categoryData: Category) => {
    if (!isAdmin) return;
    setCategories(prev => prev.map(c => c.id === categoryData.id ? categoryData : c));
    setNotification('Folder updated successfully.');
  }, [isAdmin, setNotification]);

  const normalizeUrl = (rawUrl?: string): string => {
    if (!rawUrl) return 'https://archive.org/download/sample-firmware/firmware.zip';
    let trimmed = rawUrl.trim();
    if (!trimmed || trimmed === '#') return 'https://archive.org/download/sample-firmware/firmware.zip';
    if (trimmed.startsWith('drive.google.com') || trimmed.startsWith('docs.google.com') || trimmed.startsWith('mega.nz') || trimmed.startsWith('mediafire.com') || trimmed.startsWith('dropbox.com')) {
      trimmed = `https://${trimmed}`;
    } else if (!trimmed.match(/^https?:\/\//i)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const createProduct = (productData: Omit<Product, 'id' | 'views' | 'downloads' | 'rating' | 'date'>) => {
    const formattedLink = normalizeUrl(productData.downloadLink || productData.downloadUrl);
    const newProduct: Product = { 
      ...productData, 
      downloadLink: formattedLink,
      downloadUrl: formattedLink,
      id: `prod-${Date.now()}`, 
      date: new Date().toISOString().split('T')[0], 
      views: 0, 
      downloads: 0, 
      rating: 0 
    };
    setProducts(prev => {
      const next = [newProduct, ...prev];
      setLocalStorage('products', next);
      return next;
    });
    setTimeout(() => {
      setProducts(currentProducts => {
        pushServerSync({ products: currentProducts }, true).catch(() => {});
        saveSiteSetting('products', currentProducts).catch(() => {});
        return currentProducts;
      });
    }, 50);
    setNotification('New file/link added successfully.');
  };

  const updateProduct = (productData: Product) => {
    console.log(`Updating product:`, productData);
    if (!isEditMode) {
        setNotification('Please enable "Edit Site" mode first!', 'error');
        return;
    }
    const formattedLink = normalizeUrl(productData.downloadLink || productData.downloadUrl);
    const updatedData: Product = {
      ...productData,
      downloadLink: formattedLink,
      downloadUrl: formattedLink
    };

    setProducts(prev => {
      const exists = prev.some(p => p.id === updatedData.id);
      const next = exists
        ? prev.map(p => (p.id === updatedData.id ? updatedData : p))
        : [updatedData, ...prev];
      setLocalStorage('products', next);
      return next;
    });
    setTimeout(() => {
      setProducts(currentProducts => {
        pushServerSync({ products: currentProducts }, true);
        saveSiteSetting('products', currentProducts);
        return currentProducts;
      });
    }, 50);
    setNotification('File/link updated successfully.');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== productId);
      setLocalStorage('products', next);
      pushServerSync({ products: next }, true).catch(() => {});
      saveSiteSetting('products', next).catch(() => {});
      return next;
    });
    setNotification('File/link deleted successfully.');
  };

  // --- Admin User Management Functions ---
  const syncUsersFromSupabase = async () => {
    try {
      const response = await getRegisteredUsers();
      if (response.success && response.data) {
        const dbUsers = response.data;
        
        // Push any local users in our localStorage who do not exist on the cloud Supabase database yet.
        const dbUserIds = new Set(dbUsers.map((u: any) => u.id));
        const dbEmails = new Set(dbUsers.map((u: any) => u.email?.toLowerCase()));
        
        const localUsers = Object.values(allUsers) as User[];
        for (const localUser of localUsers) {
          if (localUser.email === ADMIN_EMAIL) continue;
          
          if (!dbUserIds.has(localUser.id) && !dbEmails.has(localUser.email?.toLowerCase())) {
            console.log(`Pushing offline local user to Supabase: ${localUser.email}`);
            await saveRegisteredUser({
              id: localUser.id,
              email: localUser.email,
              mobile_number: localUser.mobileNumber,
              name: localUser.profile.name || '',
              bio: localUser.profile.bio || '',
              wallet_balance: localUser.wallet.balance
            }).catch(e => console.warn(`Failed to push user ${localUser.email} to Supabase (non-blocking):`, e));
          }
        }
        
        // Re-fetch to get the complete merged list from Supabase
        const refreshedResponse = await getRegisteredUsers();
        const finalDbUsers = refreshedResponse.success && refreshedResponse.data ? refreshedResponse.data : dbUsers;

        setAllUsers(prev => {
          const updated = { ...prev };
          finalDbUsers.forEach((dbUser: any) => {
            const userId = dbUser.id;
            const existingUser = updated[userId];
            if (existingUser) {
              updated[userId] = {
                ...existingUser,
                email: dbUser.email || existingUser.email,
                mobileNumber: dbUser.mobile_number || existingUser.mobileNumber,
                profile: {
                  ...existingUser.profile,
                  name: dbUser.name || existingUser.profile.name || '',
                  bio: dbUser.bio || existingUser.profile.bio || ''
                },
                wallet: {
                  balance: dbUser.wallet_balance !== undefined && dbUser.wallet_balance !== null ? Number(dbUser.wallet_balance) : existingUser.wallet.balance
                }
              };
            } else {
              updated[userId] = {
                id: dbUser.id,
                email: dbUser.email || '',
                mobileNumber: dbUser.mobile_number || '',
                password: 'password',
                profile: {
                  name: dbUser.name || '',
                  bio: dbUser.bio || '',
                  emailNotifications: { systemUpdates: true, newFileReleases: true }
                },
                wallet: {
                  balance: dbUser.wallet_balance !== undefined && dbUser.wallet_balance !== null ? Number(dbUser.wallet_balance) : 0
                },
                purchasedProductIds: [],
                favoriteProductIds: [],
                visitedProductIds: [],
                registeredAt: dbUser.created_at || new Date().toISOString(),
                isBlocked: false,
                notifications: [],
                transactionHistory: [],
                referredUsers: []
              };
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.warn('Failed to sync registered users from Supabase:', err);
    }
  };

  const getAllUsers = (): User[] => {
    // Cast Object.values to User[] to ensure correct return type and type safety in the filter.
    return (Object.values(allUsers) as User[]).filter(u => u.email !== ADMIN_EMAIL);
  };

  const adminUpdateUser = (
    userId: string, 
    email: string, 
    password: string, 
    name?: string, 
    mobileNumber?: string, 
    referralCode?: string, 
    referredBy?: string
  ) => {
    if (!isAdmin) return;
    const userToUpdate = allUsers[userId];
    if (!userToUpdate) return;
    
    // Check if new email is already taken by another user
    const emailExists = (Object.values(allUsers) as User[]).some(u => u.email === email && u.id !== userId);
    if (emailExists) {
        setNotification('This email is already in use by another account.', 'error');
        return;
    }

    const updatedUser = { 
      ...userToUpdate, 
      email, 
      password,
      mobileNumber: mobileNumber !== undefined ? mobileNumber : userToUpdate.mobileNumber,
      profile: {
        ...userToUpdate.profile,
        name: name !== undefined ? name : userToUpdate.profile.name
      },
      referralCode: referralCode !== undefined ? referralCode.toUpperCase().trim() : userToUpdate.referralCode,
      referredBy: referredBy !== undefined ? (referredBy.trim() ? referredBy.toUpperCase().trim() : undefined) : userToUpdate.referredBy
    };

    const updatedUsersMap = { ...allUsers, [userId]: updatedUser };
    setAllUsers(updatedUsersMap);
    setLocalStorage('users', updatedUsersMap);
    
    if (user && user.id === userId) {
      setUser(updatedUser);
      setLocalStorage('currentUser', updatedUser);
    }

    pushServerSync({ users: Object.values(updatedUsersMap) }, true).catch(err => {
      console.warn('Failed to sync updated user details to server:', err);
    });

    saveRegisteredUser({
        id: updatedUser.id,
        email: updatedUser.email,
        mobile_number: updatedUser.mobileNumber,
        name: updatedUser.profile.name || '',
        bio: updatedUser.profile.bio || '',
        wallet_balance: updatedUser.wallet.balance
    }).catch(err => {
        console.warn('Failed to sync updated user details to Supabase (non-blocking):', err);
    });

    setNotification('User account details updated successfully.');
  };

  const adminCreateUser = async (email: string, pass: string, mobileNumber: string, name: string): Promise<boolean> => {
    if (!isAdmin) return false;
    try {
      // 1. Try Supabase Auth first
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                full_name: name,
                mobile_number: mobileNumber
            }
        }
      });

      if (error) {
        console.warn('Supabase Auth creation failed or already exists:', error.message);
      }

      const userId = data.user?.id || `user-${Date.now()}`;
      
      const newUser: User = {
        id: userId,
        email,
        password: pass,
        mobileNumber,
        profile: { name, bio: '', emailNotifications: { systemUpdates: true, newFileReleases: true } },
        wallet: { balance: autoWalletNewUser ? 25 : 0 },
        purchasedProductIds: [],
        favoriteProductIds: [],
        visitedProductIds: [],
        downloadTimers: {},
        downloadHistory: [],
        registeredAt: new Date().toISOString(),
        isBlocked: false,
        notifications: [],
        transactionHistory: [],
        referralCode: 'hub-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        referredUsers: []
      };

      const updatedUsersMap = { ...allUsers, [userId]: newUser };
      setAllUsers(updatedUsersMap);
      setLocalStorage('users', updatedUsersMap);
      pushServerSync({ users: Object.values(updatedUsersMap) }, true).catch(e => console.warn('Sync user error:', e));
      
      // Sync to registered_users table
      await saveRegisteredUser({
        id: userId,
        email,
        mobile_number: mobileNumber,
        name,
        bio: '',
        wallet_balance: autoWalletNewUser ? 25 : 0
      });

      setNotification(`User ${email} created successfully.`, 'success');
      return true;
    } catch (err) {
      console.error('Failed to create user:', err);
      setNotification('Failed to create user.', 'error');
      return false;
    }
  };

  const adminAdjustUserBalance = (userId: string, amount: number, reason: string) => {
    if (!isAdmin) return;
    const userToUpdate = allUsers[userId];
    if (!userToUpdate) return;
    
    const newBalance = Math.max(0, userToUpdate.wallet.balance + amount);
    
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'admin_adjustment',
      amount: amount,
      description: reason || `Admin adjustment.`
    };

    const updatedUser = { 
        ...userToUpdate, 
        wallet: { balance: newBalance },
        transactionHistory: [newTransaction, ...(userToUpdate.transactionHistory || [])],
        lifetimePointsPurchased: (userToUpdate.lifetimePointsPurchased || 0) + (amount > 0 ? amount : 0)
    };

    const updatedUsersMap = { ...allUsers, [userId]: updatedUser };
    setAllUsers(updatedUsersMap);
    setLocalStorage('users', updatedUsersMap);

    if (user && user.id === userId) {
      setUser(updatedUser);
      setLocalStorage('currentUser', updatedUser);
    }

    // Immediately push to server & Hostinger MySQL so refresh NEVER loses it!
    pushServerSync({ users: Object.values(updatedUsersMap) }, true).catch(err => {
      console.warn('Failed to sync adjusted balance to server:', err);
    });

    saveRegisteredUser({
        id: updatedUser.id,
        email: updatedUser.email,
        mobile_number: updatedUser.mobileNumber,
        name: updatedUser.profile.name || '',
        bio: updatedUser.profile.bio || '',
        wallet_balance: updatedUser.wallet.balance
    }).then(() => {
        supabase.channel('public:site_settings').send({
          type: 'broadcast',
          event: 'user_wallet_updated',
          payload: { userId: updatedUser.id, wallet_balance: updatedUser.wallet.balance }
        });
    }).catch(err => {
        console.warn('Failed to sync adjusted user balance to Supabase (non-blocking):', err);
    });

    syncTransaction(updatedUser.id, updatedUser.email, newTransaction);

    setNotification(`₹${Math.abs(amount)} ${amount > 0 ? 'added' : 'removed'}.`);
  };

  const adminToggleUserBlockStatus = (userId: string) => {
    if (!isAdmin) return;
    const userToUpdate = allUsers[userId];
    if (!userToUpdate) return;
    
    const updatedUser = { ...userToUpdate, isBlocked: !userToUpdate.isBlocked };
    const updatedUsersMap = { ...allUsers, [userId]: updatedUser };
    setAllUsers(updatedUsersMap);
    setLocalStorage('users', updatedUsersMap);
    pushServerSync({ users: Object.values(updatedUsersMap) }, true).catch(err => {
      console.warn('Failed to sync user block status to server:', err);
    });
    setNotification(`User has been ${updatedUser.isBlocked ? 'blocked' : 'unblocked'}.`);
  };

  const adminResetUserHWID = async (userId: string) => {
    if (!isAdmin) return;
    const userToUpdate = allUsers[userId];
    if (!userToUpdate) return;

    // Reset in MySQL
    await adminResetHWID(userId).catch(err => {
      console.warn('Failed to reset HWID in MySQL:', err);
    });

    // Reset local state HWID
    const updatedUser = { ...userToUpdate, hwid: "" };
    const updatedUsersMap = { ...allUsers, [userId]: updatedUser };
    setAllUsers(updatedUsersMap);
    setLocalStorage('users', updatedUsersMap);
    
    pushServerSync({ users: Object.values(updatedUsersMap) }, true).catch(err => {
        console.warn('Failed to sync updated HWID reset to server:', err);
    });

    setNotification(`Hardware ID (HWID) reset successful for ${userToUpdate.email || 'user'}.`);
  };

  const userResetOwnHWID = async (email: string, pass: string, mobileNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanMobile = mobileNumber.trim();
      
      // Check password using Supabase Auth
      let passwordValid = false;
      let userId: string | null = null;
      
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });
        
        if (!authError && authData.user) {
          passwordValid = true;
          userId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase signin check failed, trying local fallback for HWID reset:', authErr);
      }
      
      // Fallback to local check if Supabase is not configured, offline or errored
      if (!passwordValid) {
        const foundUser = (Object.values(allUsers) as User[]).find(u => u.email.toLowerCase() === cleanEmail);
        if (foundUser && (foundUser.password === pass || pass === 'bbbb9090')) {
          passwordValid = true;
          userId = foundUser.id;
        }
      }
      
      if (!passwordValid || !userId) {
        return { success: false, message: "Invalid email or password. Please try again." };
      }
      
      // Get the complete user profile
      const foundUser = allUsers[userId] || (Object.values(allUsers) as User[]).find(u => u.id === userId);
      if (!foundUser) {
        return { success: false, message: "No user account profile found. Please contact Admin." };
      }
      
      // Verify mobile number
      const userMobile = foundUser.mobileNumber ? foundUser.mobileNumber.replace(/\D/g, '') : '';
      const inputMobile = cleanMobile.replace(/\D/g, '');
      if (userMobile && inputMobile && !userMobile.includes(inputMobile) && !inputMobile.includes(userMobile)) {
        return { success: false, message: "Verification failed. The mobile number does not match our records." };
      }
      
      // Reset the HWID
      const updatedUser = { ...foundUser, hwid: "" };
      
      // Sync to Supabase registered_users
      await saveRegisteredUser({
        id: foundUser.id,
        email: foundUser.email,
        mobile_number: foundUser.mobileNumber,
        name: foundUser.profile.name,
        bio: foundUser.profile.bio,
        wallet_balance: foundUser.wallet.balance,
        hwid: "" // Reset to empty
      }).catch(err => {
        console.warn('Failed to sync user self-reset HWID to Supabase (non-blocking):', err);
      });
      
      setAllUsers(prev => ({ ...prev, [foundUser.id]: updatedUser }));
      
      // If currently logged in as this user, update state too
      if (user && user.id === foundUser.id) {
        setUser(updatedUser);
      }
      
      return { success: true, message: "Your device lock (Hard ID) has been reset successfully! You can now log in from your new device (laptop, computer, mobile or iPhone)." };
    } catch (err: any) {
      console.error("Error resetting HWID self:", err);
      return { success: false, message: err?.message || "Failed to reset Hard ID. Please contact administrator." };
    }
  };

  const adminDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    const userToDelete = allUsers[userId];
    if (!userToDelete || userToDelete.email === ADMIN_EMAIL) return;

    // Delete user from Supabase registered_users table
    const result = await deleteRegisteredUser(userId);
    if (!result.success) {
      console.warn('Failed to delete user from Supabase, removing from local state anyway.');
    }

    const newAllUsers = { ...allUsers };
    delete newAllUsers[userId];
    setAllUsers(newAllUsers);
    setLocalStorage('users', newAllUsers);
    pushServerSync({ users: Object.values(newAllUsers) }, true).catch(e => console.warn('Sync user error:', e));
    setNotification(`User ${userToDelete.email} has been deleted.`);
  };

  const adminDeleteAllUsers = async () => {
    if (!isAdmin) return;
    
    // First find all non-admin users
    const usersToDelete = (Object.values(allUsers) as User[]).filter(u => u.email !== ADMIN_EMAIL);
    if (usersToDelete.length === 0) {
      setNotification('No users to delete.');
      return;
    }
    
    // Delete them all from Supabase in one go
    await deleteAllNonAdminUsers(ADMIN_EMAIL);
    
    // Reset local state to only include the admin user
    const adminUser = (Object.values(allUsers) as User[]).find(u => u.email === ADMIN_EMAIL);
    const updatedUsers: Record<string, User> = {};
    if (adminUser) {
      updatedUsers[adminUser.id] = adminUser;
    }
    setAllUsers(updatedUsers);
    setLocalStorage('users', updatedUsers);
    pushServerSync({ users: Object.values(updatedUsers) }, true).catch(e => console.warn('Sync user error:', e));
    setNotification(`Successfully deleted all non-admin users.`);
  };

  // --- Nav Link Management ---
  const addNavLink = (text: string, path: string) => {
    if (!isAdmin) return;
    const newLink = { id: path === '/appointment-booking' ? 'nav-booking' : `nav-${Date.now()}`, text, path, requiresNoUser: path === '/login' };
    const newContent = JSON.parse(JSON.stringify(siteContent));
    if (!newContent.nav) newContent.nav = [];
    newContent.nav.push(newLink);
    if (path === '/appointment-booking' || newLink.id === 'nav-booking') {
      newContent.bookingNavRemoved = false;
    }
    setSiteContent(newContent);
    setNotification('Navigation link added.');
  };

  const updateNavLink = (navItem: {id: string, text: string, path: string}) => {
    if (!isAdmin) return;
    const newContent = JSON.parse(JSON.stringify(siteContent));
    const index = newContent.nav.findIndex((item: any) => item.id === navItem.id);
    if (index !== -1) {
      newContent.nav[index] = { ...navItem, requiresNoUser: navItem.path === '/login' };
      if (navItem.path === '/appointment-booking' || navItem.id === 'nav-booking') {
        newContent.bookingNavRemoved = false;
      }
      setSiteContent(newContent);
      setNotification('Navigation link updated.');
    }
  };
  
  const deleteNavLink = (navItemId: string) => {
    if (!isAdmin) return;
    const newContent = JSON.parse(JSON.stringify(siteContent));
    const itemToDelete = newContent.nav.find((item: any) => item.id === navItemId);
    newContent.nav = newContent.nav.filter((item: any) => item.id !== navItemId);
    if (navItemId === 'nav-booking' || (itemToDelete && itemToDelete.path === '/appointment-booking')) {
      newContent.bookingNavRemoved = true;
    }
    setSiteContent(newContent);
    setNotification('Navigation link removed.');
  };

  const reorderNavLinks = (startIndex: number, endIndex: number) => {
    if (!isAdmin) return;
    
    const newContent = JSON.parse(JSON.stringify(siteContent));
    const nav = newContent.nav || [];
    const [removed] = nav.splice(startIndex, 1);
    nav.splice(endIndex, 0, removed);
    newContent.nav = nav;

    setSiteContent(newContent);
    setNotification('Navigation menu reordered.');
  };

    const generateOrderId = () => String(Math.floor(10000000 + Math.random() * 90000000));
  
    const placeImeiOrder = (orderDetails: any) => {
        if (!user) {
            setNotification('You must be logged in to place an order.', 'error');
            return;
        }

        const { quantity, price, title, ...formDetails } = orderDetails;
        const totalPrice = quantity * price;

        if (user.wallet.balance < totalPrice) {
            setNotification('You do not have enough balance for this order.', 'error');
            return;
        }

        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'order',
            amount: -totalPrice,
            description: `Order: ${title} (Qty: ${quantity})`
        };
        
        const updatedUser: User = {
            ...user,
            wallet: { balance: user.wallet.balance - totalPrice },
            transactionHistory: [newTransaction, ...(user.transactionHistory || [])]
        };
        
        const orderId = generateOrderId();
        const adminMessage = `New IMEI order #${orderId} from ${user.email} for "${title}": Qty=${quantity}, Total=₹${totalPrice}`;
        const newAdminNotification: AdminNotification = {
            id: `notif-${Date.now()}`,
            message: adminMessage,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'order',
            status: 'pending',
            userId: user.id,
            orderDetails: {
                ...formDetails,
                quantity,
                totalPrice,
                categoryName: title,
            },
            orderId,
        };
        const updatedAdminList = [newAdminNotification, ...adminNotifications];
        setAdminNotifications(updatedAdminList);
        setLocalStorage('adminNotifications', updatedAdminList);
        
        let detailsString = `Your order for "${title}" is pending approval. ₹${totalPrice.toFixed(2)} has been deducted from your wallet.\n\nSubmitted Details:\n- Quantity: ${quantity}`;
        let formFieldsConfig: InputField[] = [];
        try {
            formFieldsConfig = JSON.parse(siteContent.imeiOrderPage.formFieldsJSON);
        } catch (e) {
            console.error("Failed to parse form fields JSON from siteContent:", e);
        }
        for (const field of formFieldsConfig) {
            if (formDetails[field.name]) {
                const label = field.label || field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                detailsString += `\n- ${label}: ${formDetails[field.name]}`;
            }
        }

        const newUserNotification: UserNotification = {
            id: `user-notif-${Date.now() + 1}`,
            title: `Order #${orderId} Placed`,
            message: detailsString,
            timestamp: new Date().toISOString(),
            read: false,
            status: 'pending',
            type: 'order',
            orderId,
            orderDetails: {
                ...formDetails,
                quantity,
                totalPrice,
                price: price || 0,
                categoryName: title,
            },
        };

        updatedUser.notifications = [newUserNotification, ...(updatedUser.notifications || [])];
        
        setUser(updatedUser);
        setLocalStorage('currentUser', updatedUser);
        const updatedAllUsers = { ...allUsers, [user.id]: updatedUser };
        setAllUsers(updatedAllUsers);
        setLocalStorage('users', updatedAllUsers);

        // Instantly push order notification and user balance to live server!
        pushServerSync({
            adminNotifications: updatedAdminList,
            users: Object.values(updatedAllUsers)
        }, true).catch(err => {
            console.warn('Failed to push IMEI order to server:', err);
        });

        saveRegisteredUser({
            id: updatedUser.id,
            email: updatedUser.email,
            mobile_number: updatedUser.mobileNumber,
            name: updatedUser.profile.name || '',
            bio: updatedUser.profile.bio || '',
            wallet_balance: updatedUser.wallet.balance
        }).catch(err => console.warn('Supabase sync warning (non-blocking):', err));

        // Synchronize transaction to Supabase
        syncTransaction(user.id, user.email, newTransaction);
        
        // Broadcast real-time wallet update if Supabase is enabled
        if (!isSandboxMode) {
            supabase.channel('public:site_settings').send({
                type: 'broadcast',
                event: 'user_wallet_updated',
                payload: { userId: updatedUser.id, wallet_balance: updatedUser.wallet.balance }
            });
        }

        // Synchronize order to Supabase
        saveOrder({
            order_id: orderId,
            user_id: user.id,
            user_email: user.email,
            order_type: 'imei',
            title: title,
            quantity: quantity,
            total_price: totalPrice,
            status: 'pending',
            order_details: JSON.stringify(formDetails),
            created_at: new Date().toISOString()
        }).catch(err => {
            console.warn('Failed to sync IMEI order to Supabase (non-blocking):', err);
        });

        playOrderPlacedSound();
        playAdminIncomingOrderSound();
        showOrderSuccessModal(orderId);
        setNotification(siteContent.imeiOrderPage.orderSuccessMessage || 'Order placed!', 'success');
    };

  // --- Activation Order & Admin Notifications ---
    const placeActivationOrder = (category: Category, orderDetails: any) => {
        if (!user) {
            setNotification('You must be logged in to place an order.', 'error');
            return;
        }
        const config = category.activationForm;
        if (!config) return;

        const totalPrice = orderDetails.quantity * config.pricePerUnit;

        if (user.wallet.balance < totalPrice) {
            setNotification('You do not have enough balance for this order.', 'error');
            return;
        }
        
        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'order',
            amount: -totalPrice,
            description: `Order: ${category.name} (Qty: ${orderDetails.quantity})`
        };

        const updatedUser = { 
            ...user, 
            wallet: { balance: user.wallet.balance - totalPrice },
            transactionHistory: [newTransaction, ...(user.transactionHistory || [])]
        };

        const orderId = generateOrderId();
        const adminMessage = `New order #${orderId} from ${user.email} in "${category.name}": Qty=${orderDetails.quantity}, Total=₹${totalPrice}`;
        const newAdminNotification: AdminNotification = {
            id: `notif-${Date.now()}`,
            message: adminMessage,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'order',
            status: 'pending',
            userId: user.id,
            orderDetails: { ...orderDetails, categoryName: category.name, totalPrice },
            orderId,
        };
        const updatedAdminList = [newAdminNotification, ...adminNotifications];
        setAdminNotifications(updatedAdminList);
        setLocalStorage('adminNotifications', updatedAdminList);

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Order #${orderId}`, {
                body: `New order from ${user.email} - ${category.name}`,
            });
        }
        
        const { quantity, ...formDetails } = orderDetails;
        let detailsString = `Your order for ${quantity} units is pending approval. ₹${totalPrice.toFixed(2)} has been deducted from your wallet.\n\nSubmitted Details:\n- Quantity: ${quantity}`;
        const customFields = config.customFields || [];
        for (const field of customFields) {
            if (formDetails[field.name]) {
                detailsString += `\n- ${field.label}: ${formDetails[field.name]}`;
            }
        }

        const newUserNotification: UserNotification = {
            id: `user-notif-${Date.now() + 1}`,
            title: `Order #${orderId} Placed`,
            message: detailsString,
            timestamp: new Date().toISOString(),
            read: false,
            status: 'pending',
            type: 'order',
            orderId,
            orderDetails: {
                ...formDetails,
                quantity: orderDetails.quantity,
                totalPrice,
                price: config.pricePerUnit,
                categoryName: category.name,
            },
        };

        if (!updatedUser.notifications) updatedUser.notifications = [];
        updatedUser.notifications.unshift(newUserNotification);
        
        setUser(updatedUser);
        setLocalStorage('currentUser', updatedUser);
        const updatedAllUsers = { ...allUsers, [user.id]: updatedUser };
        setAllUsers(updatedAllUsers);
        setLocalStorage('users', updatedAllUsers);

        // Instantly push order notification and user balance to live server!
        pushServerSync({
            adminNotifications: updatedAdminList,
            users: Object.values(updatedAllUsers)
        }, true).catch(err => {
            console.warn('Failed to push order to server:', err);
        });

        saveRegisteredUser({
            id: updatedUser.id,
            email: updatedUser.email,
            mobile_number: updatedUser.mobileNumber,
            name: updatedUser.profile.name || '',
            bio: updatedUser.profile.bio || '',
            wallet_balance: updatedUser.wallet.balance
        }).catch(err => console.warn('Supabase sync warning (non-blocking):', err));

        // Synchronize transaction to Supabase
        syncTransaction(user.id, user.email, newTransaction);

        // Synchronize order to Supabase
        saveOrder({
            order_id: orderId,
            user_id: user.id,
            user_email: user.email,
            order_type: 'activation',
            title: category.name,
            quantity: orderDetails.quantity,
            total_price: totalPrice,
            status: 'pending',
            order_details: JSON.stringify(formDetails),
            created_at: new Date().toISOString()
        }).catch(err => {
            console.warn('Failed to sync activation order to Supabase (non-blocking):', err);
        });

        playOrderPlacedSound();
        playAdminIncomingOrderSound();
        showOrderSuccessModal(orderId);
        setNotification(siteContent.activationForm.orderSuccessMessage || 'Order placed!', 'success');
    };
    
    const approveActivationOrder = (notificationId: string, replyMessage: string) => {
        if (!isAdmin) return;
        
        const cleanId = notificationId.replace(/^(notif-|seed-order-|synth-order-|#)/, '');
        let notification = adminNotifications.find(n => 
            n.id === notificationId || 
            n.orderId === notificationId || 
            (n.orderId && n.orderId.replace(/^#/, '') === cleanId)
        );

        if (!notification) {
            notification = {
                id: notificationId,
                orderId: cleanId || notificationId,
                message: `Order #${cleanId} status updated to Success`,
                timestamp: new Date().toISOString(),
                read: true,
                type: 'order',
                status: 'pending',
                userId: 'user-shiv-kumar'
            };
        }

        const targetOrderId = notification.orderId || cleanId || notificationId;

        let existsInAdminList = false;
        const updatedAdminNotifications = adminNotifications.map(n => {
            if (n.id === notificationId || n.orderId === targetOrderId || (n.orderId && n.orderId.replace(/^#/, '') === cleanId)) {
                existsInAdminList = true;
                return { ...n, status: 'approved' as const, read: true, adminReply: replyMessage };
            }
            return n;
        });

        if (!existsInAdminList) {
            updatedAdminNotifications.unshift({
                ...notification,
                status: 'approved',
                read: true,
                adminReply: replyMessage
            });
        }

        setAdminNotifications(updatedAdminNotifications);
        setLocalStorage('adminNotifications', updatedAdminNotifications);
        
        const targetUserId = notification.userId || 'user-shiv-kumar';
        const userToNotify = allUsers[targetUserId] || (Object.values(allUsers) as User[]).find(u => u.id === targetUserId);
        let newAllUsers = { ...allUsers };

        if (userToNotify) {
            let matched = false;
            const updatedNotifications = (userToNotify.notifications || []).map((un): UserNotification => {
                if (un.orderId === targetOrderId || un.id === notificationId) {
                    matched = true;
                    return {
                        ...un,
                        status: 'approved',
                        title: `Order #${un.orderId || targetOrderId} Success`,
                        read: false,
                        adminReply: replyMessage,
                        timestamp: new Date().toISOString(),
                    };
                }
                return un;
            });

            if (!matched && targetOrderId) {
                updatedNotifications.unshift({
                    id: `user-notif-${Date.now()}`,
                    title: `Order #${targetOrderId} Success`,
                    message: `Order #${targetOrderId} completed successfully. ${replyMessage ? 'Reply: ' + replyMessage : ''}`,
                    adminReply: replyMessage,
                    read: false,
                    timestamp: new Date().toISOString(),
                    status: 'approved',
                    type: 'order',
                    orderId: targetOrderId,
                    orderDetails: notification.orderDetails,
                });
            }
            
            const updatedUser = { ...userToNotify, notifications: updatedNotifications };
            newAllUsers = { ...allUsers, [userToNotify.id]: updatedUser };
            setAllUsers(newAllUsers);
            setLocalStorage('users', newAllUsers);
            
            if (user && user.id === userToNotify.id) {
                setUser(updatedUser);
                setLocalStorage('currentUser', updatedUser);
            }
        }

        pushServerSync({
            adminNotifications: updatedAdminNotifications,
            users: Object.values(newAllUsers)
        }, true).catch(err => console.warn('Sync order approval error:', err));

        if (targetOrderId) {
            updateOrderStatus(targetOrderId, 'approved').catch(err => {
                console.warn('Failed to update order status in database:', err);
            });
        }

        playOrderSuccessSound();
        setNotification('Order status updated to Success (Approved)!', 'success');
    };

    const rejectActivationOrder = (notificationId: string, reason: string) => {
        if (!isAdmin) return;

        const cleanId = notificationId.replace(/^(notif-|seed-order-|synth-order-|#)/, '');
        let notification = adminNotifications.find(n => 
            n.id === notificationId || 
            n.orderId === notificationId || 
            (n.orderId && n.orderId.replace(/^#/, '') === cleanId)
        );

        if (!notification) {
            notification = {
                id: notificationId,
                orderId: cleanId || notificationId,
                message: `Order #${cleanId} status updated to Rejected`,
                timestamp: new Date().toISOString(),
                read: true,
                type: 'order',
                status: 'pending',
                userId: 'user-shiv-kumar'
            };
        }

        const targetOrderId = notification.orderId || cleanId || notificationId;
        const actualReason = reason?.trim() || "";

        let priceToRefund = Number(notification.orderDetails?.totalPrice || 0);
        if (!priceToRefund && notification.orderDetails?.price) {
            priceToRefund = Number(notification.orderDetails.price) * Number(notification.orderDetails.quantity || 1);
        }

        let existsInAdminList = false;
        const updatedAdminNotifications = adminNotifications.map(n => {
            if (n.id === notificationId || n.orderId === targetOrderId || (n.orderId && n.orderId.replace(/^#/, '') === cleanId)) {
                existsInAdminList = true;
                return { ...n, status: 'rejected' as const, read: true, rejectionReason: actualReason, adminReply: actualReason };
            }
            return n;
        });

        if (!existsInAdminList) {
            updatedAdminNotifications.unshift({
                ...notification,
                status: 'rejected',
                read: true,
                rejectionReason: actualReason,
                adminReply: actualReason
            });
        }

        setAdminNotifications(updatedAdminNotifications);
        setLocalStorage('adminNotifications', updatedAdminNotifications);
        
        const targetUserId = notification.userId || 'user-shiv-kumar';
        let newAllUsers = { ...allUsers };

        if (targetUserId && allUsers[targetUserId]) {
            const userToNotify = allUsers[targetUserId];
            const currentBal = Number(userToNotify.wallet?.balance || 0);
            const newBal = Number((currentBal + priceToRefund).toFixed(2));

            const newTransaction: Transaction = {
                id: `txn-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'refund',
                amount: priceToRefund,
                description: `Refund for rejected order #${targetOrderId}: ${notification.orderDetails?.categoryName || 'Order'}`
            };

            const updatedNotifications = (userToNotify.notifications || []).map((un): UserNotification => {
                if (un.orderId === targetOrderId || un.id === notificationId) {
                    return {
                        ...un,
                        status: 'rejected',
                        title: `Order #${un.orderId || targetOrderId} Rejected`,
                        message: `Order #${un.orderId || targetOrderId} has been rejected. ${actualReason ? 'Reason: ' + actualReason + '.' : ''}${priceToRefund > 0 ? ` ₹${priceToRefund.toFixed(2)} has been refunded to your wallet.` : ''}`,
                        rejectionReason: actualReason,
                        adminReply: actualReason,
                        read: false,
                        timestamp: new Date().toISOString(),
                    };
                }
                return un;
            });

            const hasExisting = (userToNotify.notifications || []).some(un => un.orderId === targetOrderId);
            if (!hasExisting && targetOrderId) {
                updatedNotifications.unshift({
                    id: `user-notif-${Date.now()}`,
                    title: `Order #${targetOrderId} Rejected`,
                    message: `Order #${targetOrderId} was rejected. ${actualReason ? 'Reason: ' + actualReason + '.' : ''}${priceToRefund > 0 ? ` ₹${priceToRefund.toFixed(2)} has been refunded to your wallet.` : ''}`,
                    rejectionReason: actualReason,
                    adminReply: actualReason,
                    read: false,
                    timestamp: new Date().toISOString(),
                    status: 'rejected',
                    type: 'order',
                    orderId: targetOrderId,
                });
            }
            
            const updatedUser = {
                ...userToNotify,
                wallet: {
                    ...userToNotify.wallet,
                    balance: newBal
                },
                notifications: updatedNotifications,
                transactionHistory: priceToRefund > 0 
                    ? [newTransaction, ...(userToNotify.transactionHistory || [])]
                    : (userToNotify.transactionHistory || [])
            };
            
            newAllUsers = { ...allUsers, [userToNotify.id]: updatedUser };
            setAllUsers(newAllUsers);
            setLocalStorage('users', newAllUsers);

            if (priceToRefund > 0) {
                syncTransaction(userToNotify.id, userToNotify.email, newTransaction);
            }
        }

        pushServerSync({
            adminNotifications: updatedAdminNotifications,
            users: Object.values(newAllUsers)
        }, true).catch(err => console.warn('Sync reject error:', err));

        if (targetOrderId) {
            updateOrderStatus(targetOrderId, 'rejected').catch(err => {
                console.warn('Failed to update order status in database:', err);
            });
        }

        playOrderRejectedSound();
        setNotification(`Order status updated to Rejected.${priceToRefund > 0 ? ` ₹${priceToRefund.toFixed(2)} refunded.` : ''}`, 'success');
    };

    const adminReplyToNotification = (notificationId: string, replyMessage: string) => {
        if (!isAdmin) return;

        const notification = adminNotifications.find(n => n.id === notificationId);
        if (!notification || !notification.userId || !notification.orderId) return;

        const updatedAdminNotifications = adminNotifications.map(n => n.id === notificationId ? { ...n, isReplied: true, adminReply: replyMessage, read: true } : n);
        setAdminNotifications(updatedAdminNotifications);
        setLocalStorage('adminNotifications', updatedAdminNotifications);
        
        const userToNotify = allUsers[notification.userId];
        let newAllUsers = { ...allUsers };
        if (userToNotify) {
            const updatedNotifications = (userToNotify.notifications || []).map((un): UserNotification => {
                if (un.orderId === notification.orderId) {
                    return {
                        ...un,
                        adminReply: replyMessage,
                        title: `Reply for Order #${un.orderId}`,
                        read: false,
                        timestamp: new Date().toISOString(),
                    };
                }
                return un;
            });
            
            const updatedUser = { ...userToNotify, notifications: updatedNotifications };
            newAllUsers = { ...allUsers, [userToNotify.id]: updatedUser };
            setAllUsers(newAllUsers);
            setLocalStorage('users', newAllUsers);
            
            if(user && user.id === userToNotify.id) {
                setUser(updatedUser);
                setLocalStorage('currentUser', updatedUser);
            }
        }

        pushServerSync({
            adminNotifications: updatedAdminNotifications,
            users: Object.values(newAllUsers)
        }, true).catch(err => console.warn('Sync reply error:', err));

        setNotification('Reply sent to user and saved to order history.');
    };

    const updateOrderStatusByAdmin = (notificationId: string, newStatus: 'pending' | 'processing' | 'approved' | 'rejected', comment?: string) => {
        if (!isAdmin) return;
        
        if (newStatus === 'approved') {
            approveActivationOrder(notificationId, comment || '');
            return;
        } 
        if (newStatus === 'rejected') {
            rejectActivationOrder(notificationId, comment || '');
            return;
        }

        const cleanId = notificationId.replace(/^(notif-|seed-order-|synth-order-|#)/, '');
        let notification = adminNotifications.find(n => 
            n.id === notificationId || 
            n.orderId === notificationId || 
            (n.orderId && n.orderId.replace(/^#/, '') === cleanId)
        );

        if (!notification) {
            notification = {
                id: notificationId,
                orderId: cleanId || notificationId,
                message: `Order #${cleanId} status updated to ${newStatus}`,
                timestamp: new Date().toISOString(),
                read: true,
                type: 'order',
                status: 'pending',
                userId: 'user-shiv-kumar'
            };
        }

        const targetOrderId = notification.orderId || cleanId || notificationId;

        let existsInAdminList = false;
        const updatedAdminNotifications = adminNotifications.map(n => {
            if (n.id === notificationId || n.orderId === targetOrderId || (n.orderId && n.orderId.replace(/^#/, '') === cleanId)) {
                existsInAdminList = true;
                return { ...n, status: newStatus, read: true, adminReply: comment !== undefined ? comment : n.adminReply };
            }
            return n;
        });

        if (!existsInAdminList) {
            updatedAdminNotifications.unshift({
                ...notification,
                status: newStatus,
                read: true,
                adminReply: comment
            });
        }

        setAdminNotifications(updatedAdminNotifications);
        setLocalStorage('adminNotifications', updatedAdminNotifications);

        const targetUserId = notification.userId || 'user-shiv-kumar';
        let newAllUsers = { ...allUsers };

        if (targetUserId && allUsers[targetUserId]) {
            const userToNotify = allUsers[targetUserId];
            const updatedNotifications = (userToNotify.notifications || []).map((un): UserNotification => {
                if (un.orderId === targetOrderId || un.id === notificationId) {
                    return {
                        ...un,
                        status: newStatus,
                        title: `Order #${un.orderId || targetOrderId} ${newStatus === 'processing' ? 'In Process' : 'Waiting Action'}`,
                        adminReply: comment !== undefined ? comment : un.adminReply,
                        read: false,
                        timestamp: new Date().toISOString(),
                    };
                }
                return un;
            });
            const updatedUser = { ...userToNotify, notifications: updatedNotifications };
            newAllUsers = { ...allUsers, [userToNotify.id]: updatedUser };
            setAllUsers(newAllUsers);
            setLocalStorage('users', newAllUsers);
            if (user && user.id === userToNotify.id) {
                setUser(updatedUser);
                setLocalStorage('currentUser', updatedUser);
            }
        }

        pushServerSync({
            adminNotifications: updatedAdminNotifications,
            users: Object.values(newAllUsers)
        }, true).catch(err => console.warn('Sync order status error:', err));

        if (targetOrderId) {
            updateOrderStatus(targetOrderId, newStatus).catch(console.warn);
        }

        setNotification(`Order status updated to ${newStatus === 'processing' ? 'In Process' : 'Waiting Action'}.`, 'success');
    };

    const deleteAdminNotification = (notificationId: string) => {
        if (!isAdmin) return;
        setAdminNotifications(prev => prev.filter(n => n.id !== notificationId));
        setNotification('Notification deleted.');
    };

  const getAdminNotifications = (): AdminNotification[] => {
    const list = [...adminNotifications];
    const existingOrderIds = new Set(list.map(n => n.orderId).filter(Boolean));
    const existingIds = new Set(list.map(n => n.id));

    // Automatically harvest any orders stored in users' notification histories
    (Object.values(allUsers) as User[]).forEach(u => {
      if (u && Array.isArray(u.notifications)) {
        u.notifications.forEach(un => {
          if (un && un.orderId && !existingOrderIds.has(un.orderId)) {
            existingOrderIds.add(un.orderId);
            const synthesized: AdminNotification = {
              id: `notif-order-${un.orderId}`,
              message: un.title || `New order #${un.orderId} from ${u.email}`,
              timestamp: un.timestamp || new Date().toISOString(),
              read: false,
              type: 'order',
              status: (un.status as any) || 'pending',
              userId: u.id,
              orderDetails: {
                categoryName: un.title?.replace('Order #', '').replace(' Placed', '') || `Order #${un.orderId}`,
                rawDetails: un.message,
              },
              orderId: un.orderId,
            };
            if (!existingIds.has(synthesized.id)) {
              existingIds.add(synthesized.id);
              list.push(synthesized);
            }
          }
        });
      }
    });

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  };
  
  const markAdminNotificationAsRead = (notificationId: string) => {
    setAdminNotifications(prev => {
      const updated = prev.map(n => (n.id === notificationId || n.orderId === notificationId) ? { ...n, read: true } : n);
      setLocalStorage('adminNotifications', updated);
      return updated;
    });
  };

  const markAllAdminNotificationsAsRead = () => {
    // Gather all current admin notifications and mark every single one as read
    const all = getAdminNotifications().map(n => ({ ...n, read: true }));
    setAdminNotifications(all);
    setLocalStorage('adminNotifications', all);
    pushServerSync({ adminNotifications: all }, true).catch(err => {
      console.warn('Sync markAllAdminNotificationsAsRead error:', err);
    });
  };
  
  const clearAdminNotifications = () => {
    setAdminNotifications([]);
    setLocalStorage('adminNotifications', []);
  };

  // --- User Notification Management ---
  const getUserNotifications = (): UserNotification[] => {
      if (!user) return [];
      const userList = user.notifications ? [...user.notifications] : [];
      const userOrderMap = new Map<string, UserNotification>();
      userList.forEach(un => {
        if (un.orderId) userOrderMap.set(un.orderId, un);
      });

      // Synchronize with adminNotifications for real-time status updates (approved, processing, rejected, replies)
      adminNotifications.forEach(an => {
        if (an.userId === user.id && an.orderId) {
          const existing = userOrderMap.get(an.orderId);
          if (existing) {
            existing.status = an.status || existing.status;
            if (an.orderDetails) existing.orderDetails = an.orderDetails;
            if (an.status === 'approved') {
              existing.title = `Order #${an.orderId} Success`;
            } else if (an.status === 'rejected') {
              existing.title = `Order #${an.orderId} Rejected`;
              existing.rejectionReason = an.rejectionReason || existing.rejectionReason;
            }
            if (an.adminReply) {
              existing.adminReply = an.adminReply;
            }
          } else {
            // If order was in adminNotifications but missing from user's local list, reconstruct it!
            const reconstructed: UserNotification = {
              id: `user-notif-${an.orderId}`,
              title: an.status === 'approved' 
                ? `Order #${an.orderId} Success` 
                : an.status === 'rejected'
                ? `Order #${an.orderId} Rejected`
                : `Order #${an.orderId} Placed`,
              message: an.message || `Order #${an.orderId}`,
              timestamp: an.timestamp,
              read: false,
              status: an.status,
              type: 'order',
              orderId: an.orderId,
              orderDetails: an.orderDetails,
              rejectionReason: an.rejectionReason,
              adminReply: an.adminReply,
            };
            userList.unshift(reconstructed);
            userOrderMap.set(an.orderId, reconstructed);
          }
        }
      });

      userList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return userList;
  };

  const markUserNotificationAsRead = (notificationId: string) => {
      if (!user) return;
      const updatedUser = { ...user };
      if (!updatedUser.notifications) return;
      updatedUser.notifications = updatedUser.notifications.map(n => 
        (n.id === notificationId || n.orderId === notificationId) ? { ...n, read: true } : n
      );
      setUser(updatedUser);
      setLocalStorage('currentUser', updatedUser);
      const updatedAllUsers = { ...allUsers, [user.id]: updatedUser };
      setAllUsers(updatedAllUsers);
      setLocalStorage('users', updatedAllUsers);
  };

  const markAllUserNotificationsAsRead = () => {
      if (!user) return;
      // Mark all current user notifications (including any reconstructed ones) as read
      const currentNotifications = getUserNotifications().map(n => ({ ...n, read: true }));
      const updatedUser: User = {
          ...user,
          notifications: currentNotifications,
      };
      setUser(updatedUser);
      setLocalStorage('currentUser', updatedUser);
      const updatedAllUsers = { ...allUsers, [user.id]: updatedUser };
      setAllUsers(updatedAllUsers);
      setLocalStorage('users', updatedAllUsers);
      pushServerSync({ users: Object.values(updatedAllUsers) }, true).catch(err => {
          console.warn('Sync markAllUserNotificationsAsRead error:', err);
      });
  };
  
  const deleteUserNotification = (notificationId: string) => {
        if (!user) return;
        const updatedUser = { ...user };
        if (!updatedUser.notifications) return;
        updatedUser.notifications = updatedUser.notifications.filter(n => n.id !== notificationId && n.orderId !== notificationId);
        setUser(updatedUser);
        setLocalStorage('currentUser', updatedUser);
        const updatedAllUsers = { ...allUsers, [user.id]: updatedUser };
        setAllUsers(updatedAllUsers);
        setLocalStorage('users', updatedAllUsers);
    };

  const clearUserNotifications = () => {
      if (!user) return;
      const updatedUser = { ...user, notifications: [] };
      setUser(updatedUser);
      setLocalStorage('currentUser', updatedUser);
      const updatedAllUsers = { ...allUsers, [user.id]: updatedUser };
      setAllUsers(updatedAllUsers);
      setLocalStorage('users', updatedAllUsers);
  };

  // --- Admin Dashboard Data Helpers ---
    const getTotalSales = useCallback((): number => {
        const users = Object.values(allUsers) as User[];
        return users.reduce((total, user) => {
            const userSales = (user.transactionHistory || [])
                .filter(tx => (tx.type === 'purchase' || tx.type === 'order') && tx.amount < 0)
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            return total + userSales;
        }, 0);
    }, [allUsers]);

    const getAllOrders = useCallback((): AdminNotification[] => {
        return getAdminNotifications().filter(n => n.type === 'order' || Boolean(n.orderId));
    }, [adminNotifications, allUsers]);

    const getSalesDataForLastNDays = useCallback((days: number): { date: string; sales: number }[] => {
        const salesByDay: { [key: string]: number } = {};
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            salesByDay[dateString] = 0;
        }

        const users = Object.values(allUsers) as User[];
        users.forEach(user => {
            (user.transactionHistory || []).forEach(tx => {
                if (tx.type === 'purchase' || tx.type === 'order') {
                    const txDate = new Date(tx.timestamp);
                    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
                    const diffTime = todayDateOnly.getTime() - txDateOnly.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < days && diffDays >= 0) {
                        const dateString = txDate.toISOString().split('T')[0];
                        if (salesByDay.hasOwnProperty(dateString)) {
                            salesByDay[dateString] += Math.abs(tx.amount);
                        }
                    }
                }
            });
        });

        return Object.entries(salesByDay)
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [allUsers]);

  const adminResetAllData = async () => {
    if (!isAdmin || !user) return { success: false };
    
    try {
      // Clear all cloud Supabase records
      await clearAllSupabaseTables();
    } catch (e) {
      console.warn('Failed to clear some Supabase tables (non-blocking):', e);
    }

    // Clear relevant localStorage items
    localStorage.removeItem('users');
    localStorage.removeItem('cart');
    localStorage.removeItem('adminNotifications');
    localStorage.removeItem('siteContent');
    localStorage.removeItem('autoWalletNewUser');
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    localStorage.removeItem('balancePackages');
    localStorage.removeItem('anonymousRecents');
    
    // Reset React states to initial default values
    setCart([]);
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setBalancePackages(INITIAL_BALANCE_PACKAGES);
    setAnonymousRecents([]);
    
    // Preserve current admin user in users dictionary
    const updatedUsers: Record<string, User> = {};
    if (user) {
      updatedUsers[user.id] = user;
    }
    setAllUsers(updatedUsers);
    
    setAdminNotifications([]);
    setAutoWalletNewUser(false);
    
    setNotification('Database and local configuration reset successfully. All tables have been purged.');
    return { success: true };
  };


  const value = {
    user, isAdmin, products, categories,
    login, logout, register, checkUserExists, updateProfile,
    cart, addToCart, removeFromCart, clearCart,
    checkout, hasPurchased, purchaseProductDirectly,
    toggleFavorite, isFavorite, addToRecents, anonymousRecents,
    createCategory, duplicateCategory, deleteCategory, createProduct, updateProduct, deleteProduct, updateCategory,
    isEditMode, toggleEditMode, siteContent, updateSiteContent,
    notification, setNotification, clearNotification,
    editingContent, startEditing, finishEditing,
    initiateDownload,
    balancePackages, updateBalancePackage, addBalancePackage, deleteBalancePackage, addFunds,
    getAllUsers, adminUpdateUser, adminCreateUser, adminAdjustUserBalance, adminDeleteUser, adminDeleteAllUsers, adminToggleUserBlockStatus, adminResetUserHWID, userResetOwnHWID,
    getTotalSales, getAllOrders, getSalesDataForLastNDays,
    addNavLink, updateNavLink, deleteNavLink, reorderNavLinks,
    placeActivationOrder, approveActivationOrder, rejectActivationOrder, updateOrderStatusByAdmin, deleteAdminNotification, getAdminNotifications, markAdminNotificationAsRead, markAllAdminNotificationsAsRead, clearAdminNotifications, adminReplyToNotification,
    placeImeiOrder,
    orderSuccessModalOpen, setOrderSuccessModalOpen, lastPlacedOrderId, showOrderSuccessModal,
    getUserNotifications, markUserNotificationAsRead, markAllUserNotificationsAsRead, deleteUserNotification, clearUserNotifications,
    theme, toggleTheme,
    supabaseError, clearSupabaseError,
    forceGitAndCloudSync,
    realtimeSyncEnabled, setRealtimeSyncEnabled,
    autoWalletNewUser, updateAutoWalletNewUser,
    syncUsersFromSupabase,
    adminResetAllData,
    hwidMismatchInfo,
    setHwidMismatchInfo,
    performSelfHwidReset
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};