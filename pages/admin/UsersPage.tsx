import React, { useState, useMemo, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { User, Transaction } from '../../types';
import CopyButton from '../../components/CopyButton';

// --- Comprehensive User Management Modal ---
const UserManagementModal = ({ user, isOpen, onClose }: { user: User | null, isOpen: boolean, onClose: () => void }) => {
    const { adminUpdateUser, adminAdjustUserBalance } = useAppContext();
    const [activeTab, setActiveTab] = useState('credentials');
    
    // Profile & Credentials state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [referredBy, setReferredBy] = useState('');

    // Balance state
    const [balanceAmount, setBalanceAmount] = useState<number | string>('');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setPassword(user.password);
            setName(user.profile?.name || '');
            setMobileNumber(user.mobileNumber || '');
            setReferralCode(user.referralCode || '');
            setReferredBy(user.referredBy || '');
            setActiveTab('credentials'); // Reset to first tab on open
            setBalanceAmount(''); // Clear balance input on open
            setAdjustmentReason('');
        }
    }, [user?.id, isOpen]);

    if (!isOpen || !user) return null;

    const handleSaveProfile = (e: FormEvent) => {
        e.preventDefault();
        adminUpdateUser(user.id, email, password, name, mobileNumber, referralCode, referredBy);
        onClose();
    };

    const handleAdjustBalance = (isAdding: boolean) => {
        const amount = Number(balanceAmount);
        if (isNaN(amount) || amount <= 0) return;
        const reason = adjustmentReason || `Admin ${isAdding ? 'deposit' : 'withdrawal'}.`;
        adminAdjustUserBalance(user.id, isAdding ? amount : -amount, reason);
        setBalanceAmount('');
        setAdjustmentReason('');
    };
    
    const tabClasses = (tabName: string) => 
        `px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 ${activeTab === tabName 
        ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`;
    
    const transactions = user.transactionHistory || [];
    
    return (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-800 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-3xl font-bold transition-colors">&times;</button>
                <h2 className="text-xl font-bold text-center mb-1 text-slate-100">Manage User</h2>
                <p className="text-center text-xs text-amber-400 font-mono mb-6">{user.email}</p>
                
                <div className="border-b border-slate-800 mb-6 overflow-x-auto">
                    <nav className="-mb-px flex space-x-2 min-w-max">
                        <button className={tabClasses('credentials')} onClick={() => setActiveTab('credentials')}>Profile & Details</button>
                        <button className={tabClasses('balance')} onClick={() => setActiveTab('balance')}>Wallet</button>
                        <button className={tabClasses('transactions')} onClick={() => setActiveTab('transactions')}>Transactions</button>
                        <button className={tabClasses('downloads')} onClick={() => setActiveTab('downloads')}>Downloads</button>
                        <button className={tabClasses('notifications')} onClick={() => setActiveTab('notifications')}>Notifications</button>
                    </nav>
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                    {activeTab === 'credentials' && (
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="No name set" />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Mobile Number</label>
                                <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="e.g. +91XXXXXXXXXX" />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Email Address</label>
                                <div className="flex items-center gap-2">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" />
                                    <CopyButton textToCopy={email} className="w-10 h-10 p-2 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Password</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" />
                                    <CopyButton textToCopy={password} className="w-10 h-10 p-2 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Referral Code</label>
                                    <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 uppercase font-bold font-mono text-sm" placeholder="e.g. HUB-XXXX" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Referred By Code</label>
                                    <input type="text" value={referredBy} onChange={e => setReferredBy(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 uppercase font-bold font-mono text-sm" placeholder="No referrer" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all text-sm">Save Account Details</button>
                        </form>
                    )}
                    {activeTab === 'balance' && (
                        <div className="space-y-4">
                            <div className="text-center bg-slate-900 p-5 rounded-2xl border border-slate-800/60">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Balance</p>
                                <p className="text-3xl font-bold text-amber-400 mt-1 font-mono">₹{user.wallet.balance.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Amount to Add/Remove</label>
                                <input type="number" placeholder="e.g., 100" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" />
                            </div>
                            <div>
                                <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Reason (Optional)</label>
                                <input type="text" placeholder="e.g., Bonus for loyalty" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" />
                            </div>
                            <div className="flex gap-4 pt-3">
                                <button onClick={() => handleAdjustBalance(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/10 text-xs sm:text-sm">Add Balance</button>
                                <button onClick={() => handleAdjustBalance(false)} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-rose-600/10 text-xs sm:text-sm">Remove Balance</button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'transactions' && (
                        transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold sticky top-0 bg-slate-950 pb-2">
                                            <th className="p-2 pl-0">Date</th>
                                            <th className="p-2">Description</th>
                                            <th className="p-2 text-right">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900">
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="text-xs">
                                                <td className="p-2 pl-0 text-[10px] text-slate-400 font-mono whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
                                                <td className="p-2 text-slate-200">{tx.description}</td>
                                                <td className={`p-2 text-right font-bold font-mono whitespace-nowrap ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-center text-slate-500 py-6 text-sm">This user has no transaction history.</p>
                    )}
                    {activeTab === 'downloads' && (
                         user.downloadHistory && user.downloadHistory.length > 0 ? (
                            <ul className="space-y-3">
                                {user.downloadHistory.map((item, index) => (
                                    <li key={index} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/40">
                                        <p className="font-semibold text-slate-200 text-xs sm:text-sm">{item.productName}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">{new Date(item.downloadedAt).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-center text-slate-500 py-6 text-sm">This user has no download history.</p>
                    )}
                    {activeTab === 'notifications' && (
                        user.notifications && user.notifications.length > 0 ? (
                            <ul className="space-y-3">
                                {user.notifications.map(item => (
                                    <li key={item.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/40">
                                        <p className="font-bold text-slate-200 text-xs sm:text-sm">{item.title}</p>
                                        <p className="text-xs text-slate-400 mt-1">{item.message}</p>
                                        {item.rejectionReason && <p className="text-[11px] mt-1.5 text-rose-400 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10 font-medium">Reason: {item.rejectionReason}</p>}
                                        <p className="text-[10px] text-slate-500 mt-1.5 font-mono">{new Date(item.timestamp).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-center text-slate-500 py-6 text-sm">This user has no notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Create User Modal ---
const CreateUserModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { adminCreateUser } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await adminCreateUser(email, password, mobileNumber, name);
        setIsSubmitting(false);
        if (success) {
            setEmail('');
            setPassword('');
            setName('');
            setMobileNumber('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-3xl font-bold transition-colors">&times;</button>
                <h2 className="text-xl font-bold text-center mb-6 text-slate-100">Create New User</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="Enter Full Name" />
                    </div>
                    <div>
                        <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="user@example.com" />
                    </div>
                    <div>
                        <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Mobile Number</label>
                        <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="+91XXXXXXXXXX" />
                    </div>
                    <div>
                        <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Password</label>
                        <input type="text" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="Enter Password" />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-amber-700 disabled:to-orange-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all text-sm"
                    >
                        {isSubmitting ? 'Creating...' : 'Create User Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};


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

// --- Main Page Component ---
const UsersPage = () => {
    const { isAdmin, getAllUsers, adminDeleteUser, adminToggleUserBlockStatus, adminResetUserHWID, autoWalletNewUser, updateAutoWalletNewUser, syncUsersFromSupabase, adminDeleteAllUsers, setNotification } = useAppContext();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
    const [managingUser, setManagingUser] = useState<User | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (!isAdmin) { navigate('/'); }
    }, [isAdmin, navigate]);

    // Fetch/sync latest users from Supabase on mount
    useEffect(() => {
        if (isAdmin) {
            setIsSyncing(true);
            syncUsersFromSupabase().finally(() => setIsSyncing(false));
        }
    }, [isAdmin]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const users = useMemo(() => getAllUsers(), [getAllUsers]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (filterStatus === 'active') return !user.isBlocked;
                if (filterStatus === 'blocked') return !!user.isBlocked;
                return true;
            })
            .filter(user => {
                const searchLower = searchQuery.toLowerCase();
                return user.email.toLowerCase().includes(searchLower) || 
                       (user.profile.name && user.profile.name.toLowerCase().includes(searchLower)) ||
                       user.mobileNumber.includes(searchLower);
            })
            .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    }, [users, searchQuery, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const handleDelete = (userId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
            adminDeleteUser(userId);
        }
    };
    
    if (!isAdmin) return null;

    const FilterButton = ({ value, label }: { value: 'all' | 'active' | 'blocked', label: string }) => (
        <button
            onClick={() => setFilterStatus(value)}
            className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 border ${filterStatus === value ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/10 scale-102' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'}`}
        >
            {label}
        </button>
    );
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

    return (
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl animate-in fade-in duration-300">
             <UserManagementModal user={managingUser ? (users.find(u => u.id === managingUser.id) || managingUser) : null} isOpen={!!managingUser} onClose={() => setManagingUser(null)} />
             <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
                <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <h1 className="text-xl font-bold tracking-wide text-slate-100">User Management</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            setIsSyncing(true);
                            syncUsersFromSupabase()
                                .then(() => setNotification('Successfully synchronized and backed up all users with Supabase!', 'success'))
                                .catch((e) => setNotification('Error syncing users: ' + (e?.message || String(e)), 'error'))
                                .finally(() => setIsSyncing(false));
                        }}
                        disabled={isSyncing}
                        className="bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4.5 w-4.5 ${isSyncing ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4"
                             />
                        </svg>
                        {isSyncing ? 'Syncing...' : 'Sync with Supabase'}
                    </button>
                    <button 
                        onClick={async () => {
                           if (window.confirm("Are you sure you want to permanently delete ALL non-admin users? This action cannot be undone and will erase all their wallets and data.")) {
                               setIsSyncing(true);
                               await adminDeleteAllUsers();
                               setIsSyncing(false);
                           }
                        }}
                        disabled={isSyncing}
                        className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {isSyncing ? 'Deleting...' : 'Delete All Users'}
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Create New User
                    </button>
                </div>
            </div>

            {/* New User Welcome Bonus Toggle Option */}
            <div className="mb-6 p-4.5 bg-indigo-500/5 rounded-xl border border-indigo-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="font-bold text-indigo-300 flex items-center gap-2 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        New User Welcome Bonus (₹25 Wallet Credit)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                        When enabled, newly registered or manually created users will start with an automatic wallet balance of ₹25. Turn off to start new users with ₹0.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${autoWalletNewUser ? 'text-indigo-400' : 'text-slate-500'}`}>
                        {autoWalletNewUser ? 'Enabled' : 'Disabled (OFF)'}
                    </span>
                    <button
                        onClick={() => updateAutoWalletNewUser(!autoWalletNewUser)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 focus:ring-offset-slate-900 ${autoWalletNewUser ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoWalletNewUser ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4.5 bg-slate-950 rounded-xl border border-slate-800/40">
                <input 
                    type="text" 
                    placeholder="Search by name, email, or mobile..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="w-full md:flex-grow px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 text-slate-200 placeholder-slate-500" 
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                    <FilterButton value="all" label="All" />
                    <FilterButton value="active" label="Active" />
                    <FilterButton value="blocked" label="Blocked" />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                            <th className="p-3 pb-4">User</th>
                            <th className="p-3 pb-4">Balance</th>
                            <th className="p-3 pb-4">Status</th>
                            <th className="p-3 pb-4">Registered</th>
                            <th className="p-3 pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-900/30 transition-colors duration-150">
                                <td className="p-3 py-4">
                                    <div className="font-bold text-slate-100 text-sm sm:text-base">{user.profile.name || user.email}</div>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                      <span>{user.email}</span>
                                      <CopyButton textToCopy={user.email} className="w-4.5 h-4.5 p-1 text-slate-500 hover:text-amber-400" />
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                      <span>{user.mobileNumber}</span>
                                      <CopyButton textToCopy={user.mobileNumber} className="w-4.5 h-4.5 p-1 text-slate-500 hover:text-amber-400" />
                                    </div>
                                    {user.hwid ? (
                                      <div className="text-[10px] text-cyan-400 mt-2.5 flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-md w-fit">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                                        <span>Bound Device: {maskHwid(user.hwid)}</span>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-slate-500 mt-2.5 flex items-center gap-1 bg-slate-950/40 border border-slate-800/30 px-2 py-0.5 rounded-md w-fit">
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                                        <span>No HWID bound</span>
                                      </div>
                                    )}
                                </td>
                                <td className="p-3 py-4 font-bold text-amber-400 font-mono text-sm sm:text-base">₹{user.wallet.balance.toFixed(2)}</td>
                                <td className="p-3 py-4">
                                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border capitalize ${user.isBlocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="p-3 py-4 text-xs font-mono text-slate-400">{new Date(user.registeredAt).toLocaleDateString()}</td>
                                <td className="p-3 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setManagingUser(user)} className="p-2 bg-slate-950 border border-slate-800 text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm shadow-amber-500/5" title="Manage User">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {/* Reset HWID Button */}
                                        <button 
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to reset the Hardware ID (HWID) for ${user.email}?`)) {
                                                    adminResetUserHWID(user.id);
                                                }
                                            }} 
                                            className="p-2 bg-slate-950 border border-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm"
                                            title="Reset Hardware ID (HWID)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => adminToggleUserBlockStatus(user.id)} className={`p-2 bg-slate-950 border border-slate-800 rounded-xl transition-all duration-200 shadow-sm ${user.isBlocked ? 'text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'text-orange-400 hover:bg-orange-500 hover:text-white'}`} title={user.isBlocked ? 'Unblock User' : 'Block User'}>
                                            {user.isBlocked ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.365 8.365zm1.414-1.414L6.524 5.11a6 6 0 018.365 8.365zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm shadow-rose-500/5" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center p-12 text-slate-500">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

             {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4.5 border-t border-slate-800/60">
                    <span className="text-xs text-slate-400">
                        Showing {startIndex + 1} to {endIndex} of {filteredUsers.length} users
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3.5 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold font-mono text-slate-400 px-3 py-1 bg-slate-950 border border-slate-850 rounded-lg">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3.5 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
