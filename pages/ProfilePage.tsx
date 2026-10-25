import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const { user, updateProfile, notification, siteContent, products, isAdmin, logout } = useAppContext();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'orders' | 'subscriptions' | 'downloads' | 'paid_files' | 'invoices'>('dashboard');
  
  // Mobile navigation state
  const [showMenuOnMobile, setShowMenuOnMobile] = useState<boolean>(true);

  // Profile forms state
  const [name, setName] = useState(user?.profile.name || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [systemUpdates, setSystemUpdates] = useState(user?.profile.emailNotifications?.systemUpdates ?? true);
  const [newFileReleases, setNewFileReleases] = useState(user?.profile.emailNotifications?.newFileReleases ?? true);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

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
                <Coins className={`w-5 h-5 ${activeTab === 'paid_files' ? 'text-amber-500' : 'text-slate-400'}`} />
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
            {/* VIEW 3: ORDERS */}
            {/* ========================================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    My Service Orders
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Track details, live progress timeline, and admin commentary of your custom flashing and IMEI requests.
                  </p>
                </div>

                <div className="space-y-6">
                  {(() => {
                    const orderNotifications = (user.notifications || []).filter(n => n.type === 'order');
                    if (orderNotifications.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-4xl">🏜️</p>
                          <p className="text-sm font-bold">You have no active or completed orders yet.</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Submit custom repair or IMEI order forms inside the flashing tools categories to launch.
                          </p>
                        </div>
                      );
                    }

                    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
                      const baseClasses = 'px-2.5 py-1 text-xs font-bold rounded-full capitalize inline-flex items-center';
                      const styles: { [key: string]: string } = {
                        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-500/20',
                        processing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 border border-cyan-500/20',
                        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-500/20',
                        rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-500/20',
                        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-500/20',
                      };
                      const displayStatus = status === 'approved' ? 'completed' : status;
                      return <span className={`${baseClasses} ${styles[status] || styles['info']}`}>{displayStatus}</span>;
                    };

                    const OrderTracker: React.FC<{ status: string }> = ({ status }) => {
                      let currentStep = 0;
                      if (status === 'processing') currentStep = 1;
                      else if (status === 'approved') currentStep = 2;
                      else if (status === 'rejected') currentStep = -1;

                      const isRejected = currentStep === -1;

                      const normalSteps = [
                        { label: 'Placed', desc: 'Team review' },
                        { label: 'Processing', desc: 'IMEI validation' },
                        { label: 'Completed', desc: 'Unlocked' }
                      ];

                      const rejectedSteps = [
                        { label: 'Placed', desc: 'Submitted' },
                        { label: 'Failed', desc: 'Check info' },
                        { label: 'Refunded', desc: 'Wallet balance restored' }
                      ];

                      const steps = isRejected ? rejectedSteps : normalSteps;

                      return (
                        <div className="mt-4 mb-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-inner">
                          <div className="relative flex items-center justify-between mt-4 pb-2">
                            <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full z-0"></div>
                            
                            {!isRejected ? (
                              <div 
                                className="absolute left-6 h-0.5 bg-cyan-500 rounded-full transition-all duration-500 ease-in-out z-0"
                                style={{ 
                                  width: `calc(${currentStep * 50}% - ${currentStep === 0 ? '0px' : currentStep === 1 ? '12px' : '24px'})` 
                                }}
                              ></div>
                            ) : (
                              <div 
                                className="absolute left-6 h-0.5 bg-rose-500 rounded-full transition-all duration-500 ease-in-out z-0"
                                style={{ width: 'calc(100% - 48px)' }}
                              ></div>
                            )}

                            {steps.map((step, idx) => {
                              let isDone = false;
                              let isActive = false;
                              
                              if (isRejected) {
                                isDone = idx === 0;
                                isActive = idx > 0;
                              } else {
                                isDone = idx < currentStep;
                                isActive = idx === currentStep;
                              }

                              let circleStyle = 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400';
                              let labelStyle = 'text-slate-400 dark:text-slate-500';

                              if (isRejected) {
                                if (idx === 0) {
                                  circleStyle = 'bg-emerald-500 border-emerald-600 text-white';
                                  labelStyle = 'text-emerald-600 dark:text-emerald-400 font-bold';
                                } else {
                                  circleStyle = 'bg-rose-500 border-rose-600 text-white';
                                  labelStyle = 'text-rose-500 dark:text-rose-400 font-bold';
                                }
                              } else if (isDone) {
                                circleStyle = 'bg-cyan-500 border-cyan-600 text-white';
                                labelStyle = 'text-cyan-600 dark:text-cyan-400 font-bold';
                              } else if (isActive) {
                                circleStyle = 'bg-white dark:bg-slate-800 border-2 border-cyan-500 text-cyan-500 ring-4 ring-cyan-100 dark:ring-cyan-950';
                                labelStyle = 'text-slate-800 dark:text-slate-200 font-extrabold';
                              }

                              return (
                                <div key={idx} className="flex flex-col items-center text-center z-10 w-20">
                                  <div className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 text-xs font-bold ${circleStyle}`}>
                                    {isRejected ? (
                                      idx === 0 ? '✓' : idx === 1 ? '✕' : '↩'
                                    ) : isDone ? (
                                      '✓'
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  <span className={`text-[10px] mt-1.5 leading-tight font-black uppercase tracking-wide ${labelStyle}`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    };

                    return [...orderNotifications]
                      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map(n => {
                        const messageParts = n.message.split('\n\nSubmitted Details:\n');
                        const hasDetails = messageParts.length > 1;

                        return (
                          <div key={n.id} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">{n.title}</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{new Date(n.timestamp).toLocaleString()}</p>
                              </div>
                              <StatusBadge status={n.status || 'pending'} />
                            </div>

                            {n.orderId && (
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 w-fit">
                                <span className="uppercase text-[9px] tracking-widest text-slate-400 font-extrabold">Order ID:</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{n.orderId}</span>
                                <CopyButton textToCopy={n.orderId} className="w-5 h-5 !p-0.5 text-slate-400" />
                              </div>
                            )}

                            <OrderTracker status={n.status || 'pending'} />

                            {hasDetails ? (
                              <div className="space-y-3">
                                <p className="text-xs text-slate-600 dark:text-slate-400">{messageParts[0]}</p>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                  <h5 className="font-black text-[10px] uppercase tracking-wider text-slate-400 mb-2">Credentials Details</h5>
                                  <ul className="space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {messageParts[1].split('\n- ').filter(item => item.trim() !== '').map((item, idx) => {
                                      const itemParts = item.split(': ');
                                      const key = itemParts[0];
                                      const value = itemParts.slice(1).join(': ');
                                      return (
                                        <li key={key + idx} className="grid grid-cols-2 text-xs py-1.5 first:pt-0 last:pb-0">
                                          <span className="text-slate-400 font-semibold truncate" title={key}>{key}</span>
                                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-right truncate" title={value}>{value}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-medium">{n.message}</p>
                            )}

                            {n.rejectionReason && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Rejection Reason:</p>
                                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{n.rejectionReason}</p>
                              </div>
                            )}

                            {n.adminReply && (
                              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                                <p className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Admin Note:</p>
                                <p className="text-xs text-cyan-500 dark:text-cyan-400 mt-1 font-medium">{n.adminReply}</p>
                              </div>
                            )}
                          </div>
                        );
                      });
                  })()}
                </div>
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
