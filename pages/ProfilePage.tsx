import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getLifetimePointsPurchased, getUserLoyaltyTier, getNextTierDetails, LOYALTY_TIERS, LoyaltyTier } from '../lib/loyalty';
import BackButton from '../components/BackButton';
import Editable from '../components/Editable';
import DownloadItem from '../components/DownloadItem';
import CopyButton from '../components/CopyButton';
import { useSEO } from '../hooks/useSEO';
import {
  LayoutDashboard,
  User as UserIcon,
  Settings,
  ShoppingCart,
  CreditCard,
  FolderDown,
  Coins,
  Link2,
  FileText,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Download,
  Share2,
  Trophy,
  CheckCircle2,
  Printer,
  Copy,
  PlusCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { User, Transaction } from '../types';

const maskHwid = (hwidString: string | undefined): string => {
  if (!hwidString) return '';
  const match = hwidString.match(/^(.*?)\s*\((hwid-.*?)\)$/);
  if (match) {
    const deviceType = match[1];
    return `${deviceType} (••••••••)`;
  }
  if (hwidString.toLowerCase().includes('fallback')) {
    return 'Fallback Device (••••••••)';
  }
  return 'Authorized Device (••••••••)';
};

const ProfilePage = () => {
  useSEO('My Profile Panel', 'Manage your user account, subscriptions, downloads, and billing.');
  const { user, updateProfile, notification, siteContent, products, isAdmin, logout, getUserNotifications } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'orders' | 'subscriptions' | 'downloads' | 'paid_files' | 'invoices'>(
    (tabParam && ['dashboard', 'profile', 'orders', 'subscriptions', 'downloads', 'paid_files', 'invoices'].includes(tabParam))
      ? (tabParam as any)
      : 'dashboard'
  );

  useEffect(() => {
    if (tabParam && ['dashboard', 'profile', 'orders', 'subscriptions', 'downloads', 'paid_files', 'invoices'].includes(tabParam)) {
      setActiveTab(tabParam as any);
      setShowMenuOnMobile(false);
    }
  }, [tabParam]);
  
  // Mobile navigation state
  const [showMenuOnMobile, setShowMenuOnMobile] = useState<boolean>(!tabParam);

  // Profile forms state
  const [name, setName] = useState(user?.profile.name || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [systemUpdates, setSystemUpdates] = useState(user?.profile.emailNotifications?.systemUpdates ?? true);
  const [newFileReleases, setNewFileReleases] = useState(user?.profile.emailNotifications?.newFileReleases ?? true);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  // Order history search state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.profile.name || '');
      setBio(user.profile.bio || '');
      setSystemUpdates(user.profile.emailNotifications?.systemUpdates ?? true);
      setNewFileReleases(user.profile.emailNotifications?.newFileReleases ?? true);
    }
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile(name, bio, { systemUpdates, newFileReleases });
  };

  if (!user) {
    return <div className="text-center text-2xl p-8">Loading...</div>;
  }

  const transactions = user.transactionHistory || [];
  const tier = getUserLoyaltyTier(user);
  const lifetimePurchases = getLifetimePointsPurchased(user);
  const nextTierInfo = getNextTierDetails(lifetimePurchases);

  // Dynamic subscription / plan details mimicking the uploaded design
  const getSubscriptionDetails = (tierId: string) => {
    const detailsMap: { [key: string]: { name: string; dailyFiles: number; dailyBandwidth: string; totalBandwidth: string; dailyFilesNum: number; dailyBandwidthNum: number; totalBandwidthNum: number; totalBandwidthStr: string; } } = {
      bronze: {
        name: '1. BRONZE PLAN (STARTER)',
        dailyFiles: 5,
        dailyBandwidth: '5 GB',
        totalBandwidth: '200 GB',
        dailyFilesNum: 5,
        dailyBandwidthNum: 5,
        totalBandwidthNum: 200,
        totalBandwidthStr: '200 GB'
      },
      silver: {
        name: '2. SILVER PLAN (OFFER)',
        dailyFiles: 10,
        dailyBandwidth: '20 GB',
        totalBandwidth: '500 GB',
        dailyFilesNum: 10,
        dailyBandwidthNum: 20,
        totalBandwidthNum: 500,
        totalBandwidthStr: '500 GB'
      },
      gold: {
        name: '3. GOLD PLAN (VIP)',
        dailyFiles: 25,
        dailyBandwidth: '50 GB',
        totalBandwidth: '1000 GB',
        dailyFilesNum: 25,
        dailyBandwidthNum: 50,
        totalBandwidthNum: 1000,
        totalBandwidthStr: '1000 GB'
      },
      platinum: {
        name: '4. PLATINUM PLAN (PRO)',
        dailyFiles: 50,
        dailyBandwidth: '100 GB',
        totalBandwidth: '2000 GB',
        dailyFilesNum: 50,
        dailyBandwidthNum: 100,
        totalBandwidthNum: 2000,
        totalBandwidthStr: '2000 GB'
      },
      diamond: {
        name: '5. DIAMOND PLAN (ELITE)',
        dailyFiles: 100,
        dailyBandwidth: '200 GB',
        totalBandwidth: '5000 GB',
        dailyFilesNum: 100,
        dailyBandwidthNum: 200,
        totalBandwidthNum: 5000,
        totalBandwidthStr: '5000 GB'
      }
    };

    return detailsMap[tierId] || detailsMap['bronze'];
  };

  const planDetails = getSubscriptionDetails(tier.id);

  // Dynamic start and end dates of active plan based on registration
  const getSubscriptionDates = () => {
    const regDate = user.registeredAt ? new Date(user.registeredAt) : new Date('2025-08-21');
    const expDate = new Date(regDate);
    expDate.setFullYear(regDate.getFullYear() + 1);

    const formatDate = (d: Date) => {
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    };

    return {
      start: formatDate(regDate),
      end: formatDate(expDate)
    };
  };

  const planDates = getSubscriptionDates();

  // Handle active navigation click
  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setShowMenuOnMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <BackButton />
          {/* Admin Backlinks */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/settings"
                className="py-1.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-black text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm uppercase tracking-wider"
              >
                <span>⚙️ Website Settings</span>
              </Link>
              <Link
                to="/admin"
                className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm uppercase tracking-wider"
              >
                <span>📊 Admin Panel</span>
              </Link>
            </div>
          )}
        </div>

        {notification && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl mb-6 flex items-center gap-2 animate-pulse shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <p className="text-sm font-semibold">{notification.message}</p>
          </div>
        )}

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR (Matching uploaded design exactly) */}
          {/* ========================================================================= */}
          <div className={`lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-6 ${showMenuOnMobile ? 'block' : 'hidden lg:block'}`}>
            
            {/* Dynamic Active Subscription Plan Card (Mimics Screenshot exactly) */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 rounded-2xl p-4.5 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Download className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                    {planDetails.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Active: {planDates.start} – {planDates.end}
                  </p>
                </div>
              </div>

              {/* Progress bars matching image */}
              <div className="space-y-3 pt-1">
                {/* Daily files */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Daily files</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">0 / {planDetails.dailyFiles}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                  </div>
                </div>

                {/* Daily bandwidth */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Daily bandwidth</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">0 B / {planDetails.dailyBandwidth}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                  </div>
                </div>

                {/* Total bandwidth */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Total bandwidth</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      {(planDetails.totalBandwidthNum * 0.75).toFixed(2)} GB / {planDetails.totalBandwidthStr}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              {/* Click to manage subscription button */}
              <button
                type="button"
                onClick={() => handleNavClick('subscriptions')}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium hover:underline transition-all pt-1.5 border-t border-amber-200/30 dark:border-amber-800/20 block"
              >
                Click to manage subscription
              </button>
            </div>

            {/* Sidebar Navigation Options List (Exactly as in uploaded photo) */}
            <nav className="space-y-1 pt-2">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'profile'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className={`w-5 h-5 ${activeTab === 'profile' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={() => handleNavClick('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'orders'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShoppingCart className={`w-5 h-5 ${activeTab === 'orders' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Orders</span>
              </button>

              <button
                onClick={() => handleNavClick('subscriptions')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'subscriptions'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${activeTab === 'subscriptions' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Subscriptions</span>
              </button>

              <button
                onClick={() => handleNavClick('downloads')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'downloads'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FolderDown className={`w-5 h-5 ${activeTab === 'downloads' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Downloads</span>
              </button>

              <button
                onClick={() => handleNavClick('paid_files')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'paid_files'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Link2 className={`w-5 h-5 ${activeTab === 'paid_files' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Paid Files</span>
              </button>

              <button
                onClick={() => handleNavClick('invoices')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === 'invoices'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className={`w-5 h-5 ${activeTab === 'invoices' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Invoices</span>
              </button>
            </nav>

            {/* Logout button at bottom */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to log out?")) {
                    logout();
                    navigate('/');
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-sm transition-all text-left"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                <span>Log out</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT VIEW / ACTIVE TAB CONTENT */}
          {/* ========================================================================= */}
          <div className={`lg:col-span-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 ${!showMenuOnMobile ? 'block' : 'hidden lg:block'}`}>
            
            {/* Mobile "Back to menu" bar */}
            {!showMenuOnMobile && (
              <button
                onClick={() => setShowMenuOnMobile(true)}
                className="lg:hidden flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest pb-4 mb-4 border-b border-slate-100 dark:border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Panel Menu</span>
              </button>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: DASHBOARD */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Custom Welcome Banner with Flag */}
                <div className="flex flex-col sm:flex-row gap-6 items-center bg-slate-100/60 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                  <div className="relative w-28 h-28 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full rounded-full border-4 border-cyan-500 shadow-md bg-white">
                      <rect x="0" y="0" width="100" height="33.3" fill="#FF9933" />
                      <rect x="0" y="33.3" width="100" height="33.4" fill="#FFFFFF" />
                      <rect x="0" y="66.7" width="100" height="33.3" fill="#128807" />
                      <circle cx="50" cy="50" r="12" fill="none" stroke="#000080" strokeWidth="1.5" />
                      <circle cx="50" cy="50" r="2.5" fill="#000080" />
                      {Array.from({ length: 24 }).map((_, index) => {
                        const angle = (index * 360) / 24;
                        const radians = (angle * Math.PI) / 180;
                        return (
                          <line
                            key={index}
                            x1="50"
                            y1="50"
                            x2={50 + 12 * Math.cos(radians)}
                            y2={50 + 12 * Math.sin(radians)}
                            stroke="#000080"
                            strokeWidth="0.6"
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute -bottom-1 -right-1 text-[9px] text-white px-2 py-0.5 rounded-full font-extrabold bg-cyan-600 border border-cyan-400 shadow">
                      🇮🇳 INDIA
                    </div>
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Welcome Back
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
                      {user.profile.name || user.email}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {user.email} {user.hwid && <span className="text-xs text-cyan-500 font-sans ml-2">(HWID Bound)</span>}
                    </p>
                  </div>
                </div>

                {/* Balance & Status Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wallet Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700/50 shadow-md relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 opacity-10 font-black text-8xl pointer-events-none select-none">
                      ₹
                    </div>
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                      Wallet balance
                    </span>
                    <p className="text-4xl font-black text-amber-400 mt-2 font-mono">
                      ₹{user.wallet.balance.toFixed(2)}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                      <p className="text-xs text-slate-300">Fast and instant automatic checkout</p>
                      <Link to="/pricing" className="text-xs text-amber-400 hover:text-amber-300 font-black hover:underline flex items-center gap-0.5">
                        <span>Recharge Wallet &rarr;</span>
                      </Link>
                    </div>
                  </div>

                  {/* Loyalty Status Card */}
                  <div className={`p-6 rounded-2xl border ${tier.borderColor} ${tier.bgColor} transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
                    <div>
                      <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900/10 dark:bg-white/10 ${tier.textColor}`}>
                        Loyalty Status
                      </span>
                      <h4 className={`text-2xl font-black mt-2 ${tier.textColor}`}>
                        {tier.name} Member
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-300/30 dark:border-slate-600/30 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Lifetime Purchased:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">₹{lifetimePurchases.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar to next level */}
                {nextTierInfo && (
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-2 font-bold text-slate-600 dark:text-slate-400">
                      <span>Next Level Progress: {nextTierInfo.nextTier.name}</span>
                      <span className="text-amber-500">₹{nextTierInfo.pointsNeeded.toFixed(2)} more needed</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500" 
                        style={{ width: `${nextTierInfo.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-1.5 text-slate-400">
                      <span>₹{tier.minPoints}</span>
                      <span>Progress: {nextTierInfo.progressPercentage.toFixed(0)}%</span>
                      <span>₹{nextTierInfo.nextTier.minPoints}</span>
                    </div>
                  </div>
                )}

                 {/* Device lock / Bind status */}
                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                        Device Lock & Bind Status
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage security lock binding for laptop, computer, mobile, or iPhone
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Device Binding Status
                      </span>
                      {siteContent?.auth?.hwidLockEnabled === false ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          Disabled by Administrator
                        </span>
                      ) : user.hwid ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Locked & Bound (One Device)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 mt-1">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Unbound (Binds on next Login)
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 font-mono text-xs overflow-hidden">
                      <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Bound Device Status
                      </span>
                      {siteContent?.auth?.hwidLockEnabled === false ? (
                        <span className="text-slate-400 font-sans">No lock enforced</span>
                      ) : user.hwid ? (
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold block truncate" title={maskHwid(user.hwid)}>
                          {maskHwid(user.hwid)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans">Will lock automatically</span>
                      )}
                    </div>
                  </div>

                  {siteContent?.auth?.hwidLockEnabled !== false && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-cyan-500/5 p-3.5 rounded-xl border border-cyan-500/10">
                      <strong>Security Policy:</strong> This account is locked to your hardware device. You can only use it on one device at a time. To switch to another laptop, computer, mobile or iPhone, please contact the administrator on WhatsApp to reset your device lock.
                    </p>
                  )}
                </div>

                {/* Refer & Earn Integrated View */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="text-emerald-500">✨</span> Refer & Earn Wallet Cash
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Get ₹30 bonus wallet points for every friend who signs up with your link.
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold shrink-0">
                      ₹30 Reward per referral
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Copy Link */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Invitation Link</span>
                        <p className="text-[11px] text-slate-500 mt-1">Direct referral sign up pipeline</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-lg p-1 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[11px] text-slate-500 px-1 font-mono truncate w-40">
                          {`${window.location.protocol}//${window.location.host}/auth?ref=${user.referralCode}`}
                        </span>
                        <CopyButton 
                          textToCopy={`${window.location.protocol}//${window.location.host}/auth?ref=${user.referralCode}`} 
                          className="!py-1 !px-2.5 !text-[11px] !bg-amber-500 hover:!bg-amber-600 !text-white !rounded-md" 
                        />
                      </div>
                    </div>

                    {/* Invite Code */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Invite Code</span>
                        <p className="text-[11px] text-slate-500 mt-1">Can be added during registration</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-lg p-1 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 px-1 font-mono uppercase">{user.referralCode || 'HUB'}</span>
                        <CopyButton 
                          textToCopy={user.referralCode || ''} 
                          className="!py-1 !px-2.5 !text-[11px] !bg-amber-500 hover:!bg-amber-600 !text-white !rounded-md" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referral summary stats */}
                  <div className="grid grid-cols-2 gap-4 bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Friends Registered</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">{(user.referredUsers || []).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Bonus Earned</p>
                      <p className="text-2xl font-black text-emerald-500 mt-1">
                        ₹{(user.referredUsers || []).reduce((acc, curr) => acc + (curr.earned || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: PROFILE SETTINGS */}
            {/* ========================================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    Profile Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Keep your profile information, full name, and email notification settings updated.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 dark:text-slate-100 text-sm font-semibold transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Bio / Description
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-900 dark:text-slate-100 text-sm font-semibold transition-all"
                      placeholder="Tell us about yourself or your mobile repair shop..."
                    />
                  </div>

                  {/* Notifications Section */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Notification Options
                    </h4>

                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <label htmlFor="systemUpdates" className="font-bold text-slate-700 dark:text-slate-300 block text-xs uppercase tracking-wide">
                            System Updates
                          </label>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Receive notifications about tool releases and server maintenance.
                          </span>
                        </div>
                        <button
                          type="button"
                          id="systemUpdates"
                          onClick={() => setSystemUpdates(!systemUpdates)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            systemUpdates ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              systemUpdates ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-4">
                        <div>
                          <label htmlFor="newFileReleases" className="font-bold text-slate-700 dark:text-slate-300 block text-xs uppercase tracking-wide">
                            New File Releases
                          </label>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Get alerted whenever new flash files or premium tools are uploaded.
                          </span>
                        </div>
                        <button
                          type="button"
                          id="newFileReleases"
                          onClick={() => setNewFileReleases(!newFileReleases)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            newFileReleases ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              newFileReleases ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-md"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: ORDERS (Exact match to uploaded image) */}
            {/* ========================================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-5 animate-fadeIn">
                {(() => {
                  const allOrderNotifications = getUserNotifications().filter(n => n.type === 'order' || Boolean(n.orderId));
                  
                  // Filter by search query if any
                  const filteredOrders = allOrderNotifications.filter(n => {
                    if (!orderSearchQuery.trim()) return true;
                    const q = orderSearchQuery.toLowerCase();
                    const orderId = (n.orderId || '').toLowerCase();
                    const title = (n.title || '').toLowerCase();
                    const msg = (n.message || '').toLowerCase();
                    const adminReply = (n.adminReply || '').toLowerCase();
                    return orderId.includes(q) || title.includes(q) || msg.includes(q) || adminReply.includes(q);
                  });

                  const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
                    if (status === 'approved') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#13a372] text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          <span>Success</span>
                        </span>
                      );
                    }
                    if (status === 'processing') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap">
                          <span className="text-xs animate-spin inline-block">⚙️</span>
                          <span>In Process</span>
                        </span>
                      );
                    }
                    if (status === 'rejected') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e11d48] text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap">
                          <span className="text-xs font-black">✕</span>
                          <span>Rejected</span>
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eab308] text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap">
                        <span className="text-xs">🕒</span>
                        <span>Waiting Action</span>
                      </span>
                    );
                  };

                  const formatSubmittedOn = (timestamp: string) => {
                    try {
                      const d = new Date(timestamp);
                      if (isNaN(d.getTime())) return '-';
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      const hours = String(d.getHours()).padStart(2, '0');
                      const minutes = String(d.getMinutes()).padStart(2, '0');
                      return `${day}-${month}-${year} ${hours}:${minutes}`;
                    } catch {
                      return '-';
                    }
                  };

                  return (
                    <div className="space-y-4">
                      {/* Top Header & Breadcrumb & Search (Exact match to screenshot) */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                            ORDER HISTORY ({filteredOrders.length} {filteredOrders.length === 1 ? 'ORDER' : 'ORDERS'})
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <Link to="/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Home</Link>
                            <span className="text-slate-400 text-[10px]">›</span>
                            <button 
                              type="button"
                              onClick={() => handleNavClick('dashboard')} 
                              className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                              Dashboard
                            </button>
                            <span className="text-slate-400 text-[10px]">›</span>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">Order History</span>
                          </div>
                        </div>

                        {/* Search Input Box (Matching screenshot's top-right search box) */}
                        <div className="w-full sm:w-56">
                          <input
                            type="text"
                            placeholder="Search"
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Orders Table matching photo columns: STATUS | O.ID | TYPE | QNT | PRICE | SERVICE NAME | FIELD | SUBMITTED ON */}
                      {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-4xl">🏜️</p>
                          <p className="text-sm font-bold">
                            {orderSearchQuery ? `No orders found matching "${orderSearchQuery}"` : 'You have no active or completed orders yet.'}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                              <tr className="text-slate-800 dark:text-slate-200 font-bold uppercase text-[11px] tracking-wider">
                                <th className="py-3 px-4 font-black">STATUS</th>
                                <th className="py-3 px-4 font-black">O.ID</th>
                                <th className="py-3 px-4 font-black">TYPE</th>
                                <th className="py-3 px-4 font-black">QNT</th>
                                <th className="py-3 px-4 font-black">PRICE</th>
                                <th className="py-3 px-4 font-black">SERVICE NAME</th>
                                <th className="py-3 px-4 font-black">FIELD</th>
                                <th className="py-3 px-4 font-black">SUBMITTED ON</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredOrders.map(n => {
                                // Extract clean order ID
                                const cleanId = (n.orderId || n.id || '').replace(/^#/, '');

                                // Quantity
                                let qnt = n.orderDetails?.quantity;
                                if (!qnt && n.message) {
                                  const m = n.message.match(/Quantity:\s*([0-9]+)/i) || n.message.match(/Qty[=:]\s*([0-9]+)/i);
                                  if (m) qnt = parseInt(m[1]);
                                }
                                if (!qnt) qnt = 1;

                                // Price calculation & INR display format (like 283.56 INR)
                                let priceVal = n.orderDetails?.totalPrice;
                                if (priceVal === undefined && n.orderDetails?.price) {
                                  priceVal = Number(n.orderDetails.price) * qnt;
                                }
                                if (priceVal === undefined && n.message) {
                                  const m = n.message.match(/Total=₹?\s*([0-9.]+)/i) || n.message.match(/₹\s*([0-9.]+)/);
                                  if (m) priceVal = parseFloat(m[1]);
                                }
                                const priceStr = priceVal !== undefined ? `${Number(priceVal).toFixed(2).replace(/\.00$/, '')} INR` : '0 INR';

                                // Service Name
                                let serviceName = n.orderDetails?.categoryName || '';
                                if (!serviceName) {
                                  serviceName = n.title
                                    .replace(/Order\s*#[0-9a-zA-Z_-]+\s*/gi, '')
                                    .replace(/Placed|Success|Pending|Rejected|Processing/gi, '')
                                    .replace(/^-\s*/, '')
                                    .trim();
                                }
                                if (!serviceName && n.message) {
                                  const match = n.message.match(/for\s*["']([^"']+)["']/i) || n.message.match(/order for\s+([^,.\n]+)/i);
                                  if (match) serviceName = match[1].trim();
                                }
                                if (!serviceName) serviceName = 'Service Order';

                                // Type
                                let type = 'SERVER';
                                const lowerService = serviceName.toLowerCase();
                                if (n.orderDetails?.orderType) {
                                  type = String(n.orderDetails.orderType).toUpperCase();
                                } else if (lowerService.includes('remote') || lowerService.includes('rent') || lowerService.includes('mrst')) {
                                  type = 'REMOTE';
                                } else if (lowerService.includes('server') || lowerService.includes('credits') || lowerService.includes('tool')) {
                                  type = 'SERVER';
                                } else if (lowerService.includes('imei') || lowerService.includes('unlock') || lowerService.includes('mdm')) {
                                  type = 'IMEI';
                                } else if (lowerService.includes('activation')) {
                                  type = 'SERVER';
                                }

                                // Field extraction (AnyDesk ID, Username, Email, IMEI, etc.)
                                let fieldVal = '';
                                if (n.orderDetails && typeof n.orderDetails === 'object') {
                                  const ignoreKeys = ['quantity', 'totalPrice', 'price', 'categoryName', 'orderType', 'title'];
                                  for (const [k, v] of Object.entries(n.orderDetails)) {
                                    if (!ignoreKeys.includes(k) && v && typeof v === 'string') {
                                      fieldVal = v;
                                      break;
                                    }
                                  }
                                }
                                if (!fieldVal && n.message) {
                                  const lines = n.message.split('\n');
                                  for (const line of lines) {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('-') && !trimmed.toLowerCase().includes('quantity') && !trimmed.toLowerCase().includes('total')) {
                                      const parts = trimmed.substring(1).split(':');
                                      if (parts.length >= 2) {
                                        fieldVal = parts.slice(1).join(':').trim();
                                        break;
                                      }
                                    }
                                  }
                                }
                                if (!fieldVal) fieldVal = '-';

                                return (
                                  <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    {/* STATUS */}
                                    <td className="py-3.5 px-4 align-middle">
                                      <StatusBadge status={n.status} />
                                    </td>

                                    {/* O.ID */}
                                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 align-middle whitespace-nowrap">
                                      #{cleanId}
                                    </td>

                                    {/* TYPE */}
                                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase align-middle whitespace-nowrap">
                                      {type}
                                    </td>

                                    {/* QNT */}
                                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 align-middle">
                                      {qnt}
                                    </td>

                                    {/* PRICE */}
                                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 align-middle whitespace-nowrap">
                                      {priceStr}
                                    </td>

                                    {/* SERVICE NAME */}
                                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 align-middle">
                                      <span>{serviceName}</span>
                                    </td>

                                    {/* FIELD (AnyDesk ID / Email / Username) + Admin Reply Code if available */}
                                    <td className="py-3.5 px-4 align-middle text-slate-700 dark:text-slate-300">
                                      <div className="max-w-[160px] truncate font-medium" title={fieldVal}>
                                        {fieldVal}
                                      </div>
                                      {/* If Admin replied or approved with Code / Note */}
                                      {n.adminReply && (
                                        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded max-w-fit shadow-2xs">
                                          <span className="font-bold">Code:</span>
                                          <span className="truncate max-w-[120px]">{n.adminReply}</span>
                                          <CopyButton textToCopy={n.adminReply} className="w-3.5 h-3.5 p-0.5 shrink-0 hover:text-emerald-900" />
                                        </div>
                                      )}
                                      {n.rejectionReason && (
                                        <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                          {n.rejectionReason}
                                        </div>
                                      )}
                                    </td>

                                    {/* SUBMITTED ON */}
                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs align-middle whitespace-nowrap">
                                      {formatSubmittedOn(n.timestamp)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: SUBSCRIPTIONS */}
            {/* ========================================================================= */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    My Subscription & Benefits
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Check plan tiers, active quotas, download file limits, and benefit options. Add funds to upgrade tiers dynamically.
                  </p>
                </div>

                {/* Main active sub details */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-amber-500/10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Current Plan Status</span>
                      <h4 className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{planDetails.name}</h4>
                    </div>
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Daily File Limit</p>
                      <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-1">{planDetails.dailyFiles} Files</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Daily Bandwidth Limit</p>
                      <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-1">{planDetails.dailyBandwidth}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Total Plan Bandwidth</p>
                      <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-1">{planDetails.totalBandwidthStr}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    <span>Standard plan expires 1 year after registration. Refreshes quotas daily.</span>
                  </div>
                </div>

                {/* Loyalty Level Benefits List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>Active Member Benefits ({tier.name})</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {tier.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-normal">{perk}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                    <Link
                      to="/pricing"
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md"
                    >
                      <span>Upgrade Member Plan / Add Funds &rarr;</span>
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: DOWNLOADS */}
            {/* ========================================================================= */}
            {activeTab === 'downloads' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                      Unlocked Downloads
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Instantly download or flash unlocked premium files and firmwares.
                    </p>
                  </div>
                  <Link 
                    to="/download-history" 
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    Timeline History Log &rarr;
                  </Link>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const purchasedProducts = products.filter(p => (user.purchasedProductIds || []).includes(p.id));
                    if (purchasedProducts.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-4xl">💾</p>
                          <p className="text-sm font-bold">You have not unlocked any files yet.</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Any firmware or tools you unlock with your points balance will appear here for instant, lifetime direct downloads.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        {purchasedProducts.map(product => (
                          <DownloadItem key={product.id} product={product} />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 6: PAID FILES / POINTS LOG */}
            {/* ========================================================================= */}
            {activeTab === 'paid_files' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    Paid Files & Wallet Log
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Complete transaction logs tracking purchases, deposits, and flashing tool unlock spends.
                  </p>
                </div>

                <div>
                  {transactions.filter(tx => tx.type === 'purchase' || tx.type === 'deposit' || tx.type === 'admin_adjustment').length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-inner">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">
                          <tr>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Activity</th>
                            <th className="p-4">Detail Description</th>
                            <th className="p-4 text-right">Points Impact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-medium bg-white/40 dark:bg-slate-900/10">
                          {transactions.filter(tx => tx.type === 'purchase' || tx.type === 'deposit' || tx.type === 'admin_adjustment').map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                                {new Date(tx.timestamp).toLocaleString()}
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                {tx.type === 'deposit' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/10">
                                    Deposit
                                  </span>
                                ) : tx.type === 'admin_adjustment' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/10">
                                    Adjustment
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-500/10">
                                    Purchase
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-slate-700 dark:text-slate-300 font-bold">{tx.description}</td>
                              <td className="p-4 text-right font-mono whitespace-nowrap">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-black ${
                                  tx.amount > 0 
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 dark:text-emerald-400' 
                                    : 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {tx.amount > 0 ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-4xl">🪙</p>
                      <p className="text-sm font-bold">No transactions found.</p>
                      <p className="text-xs text-slate-400">Deposits and download activity logs will register here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 7: INVOICES (High Value Tax Receipt) */}
            {/* ========================================================================= */}
            {activeTab === 'invoices' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    Billing & Invoices
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Download and view official tax invoices / transaction receipts for your wallet funds.
                  </p>
                </div>

                <div>
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">
                          <tr>
                            <th className="p-4">Invoice No</th>
                            <th className="p-4">Bill Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Total Amount</th>
                            <th className="p-4 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold bg-white/40 dark:bg-slate-900/10">
                          {transactions.map((tx, idx) => {
                            const invoiceNo = `INV-${new Date(tx.timestamp).getFullYear()}-${1000 + idx + 1}`;
                            return (
                              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">{invoiceNo}</td>
                                <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                                  {new Date(tx.timestamp).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{tx.description}</td>
                                <td className="p-4 font-bold font-mono text-slate-800 dark:text-slate-200">₹{Math.abs(tx.amount).toFixed(2)}</td>
                                <td className="p-4 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => setSelectedInvoice(tx)}
                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-lg text-[11px] uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>View Invoice</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-4xl">📄</p>
                      <p className="text-sm font-bold">No bills available.</p>
                      <p className="text-xs text-slate-400">Bills are generated automatically upon wallet deposits.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* HIGH-VALUE TAX INVOICE RECEIPT MODAL */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full shadow-2xl p-6 relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
            
            {/* Invoice Design */}
            <div id="printable-invoice" className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-amber-500 tracking-wide uppercase">
                    NexGen Mobile Hub
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Official Repair & Firmware Hub
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium leading-relaxed">
                    GSTIN: 27AABCN1234F1Z0<br />
                    E-mail: nexgenmobilehub55@gmail.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase tracking-wider">
                    Paid / Success
                  </span>
                  <p className="text-xs font-black font-mono mt-2 text-slate-700">
                    INV-{new Date(selectedInvoice.timestamp).getFullYear()}-{1000 + transactions.indexOf(selectedInvoice) + 1}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Date: {new Date(selectedInvoice.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Billed To Customer</p>
                  <p className="font-black text-slate-800 mt-1">{user.profile.name || 'NexGen Member'}</p>
                  <p className="font-mono text-slate-500 text-[10px] mt-0.5">{user.email}</p>
                  <p className="font-mono text-slate-500 text-[10px]">{user.mobileNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Payment Mode</p>
                  <p className="font-bold text-slate-700 mt-1">Automatic Digital Wallet</p>
                  <p className="text-[10px] text-slate-400 font-mono">Tx ID: {selectedInvoice.id.substring(0, 16)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs font-semibold">
                <div className="grid grid-cols-12 bg-slate-100 text-slate-600 p-3 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                  <div className="col-span-8">Description of service / point deposit</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-3 text-right">Total (INR)</div>
                </div>
                <div className="grid grid-cols-12 p-3 text-slate-800">
                  <div className="col-span-8 font-black leading-snug">{selectedInvoice.description}</div>
                  <div className="col-span-1 text-center">1</div>
                  <div className="col-span-3 text-right font-mono font-bold">₹{Math.abs(selectedInvoice.amount).toFixed(2)}</div>
                </div>
              </div>

              {/* Totals block */}
              <div className="space-y-1.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{(Math.abs(selectedInvoice.amount) / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% Integrated Goods & Service Tax):</span>
                  <span className="font-mono">₹{(Math.abs(selectedInvoice.amount) - (Math.abs(selectedInvoice.amount) / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-dashed border-slate-200">
                  <span>Grand Total (All inclusive):</span>
                  <span className="font-mono text-amber-500">₹{Math.abs(selectedInvoice.amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                  Thank you for repairing with NexGen Mobile Hub! This is an electronically generated valid receipt.<br />
                  For inquiries, please contact Admin directly on WhatsApp support line.
                </p>
              </div>
            </div>

            {/* Print and Close Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-200 text-center"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
