
import React, { useState, useMemo, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { User, Transaction } from '../types';
import BackButton from '../components/BackButton';

// --- Comprehensive User Management Modal ---
const UserManagementModal = ({ user, isOpen, onClose }: { user: User | null, isOpen: boolean, onClose: () => void }) => {
    const { adminUpdateUser, adminAdjustUserBalance } = useAppContext();
    const [activeTab, setActiveTab] = useState('credentials');
    
    // Credentials state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Balance state
    const [balanceAmount, setBalanceAmount] = useState<number | string>('');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setPassword(user.password);
            setActiveTab('credentials'); // Reset to first tab on open
            setBalanceAmount(''); // Clear balance input on open
            setAdjustmentReason('');
        }
    }, [user?.id, isOpen]);

    if (!isOpen || !user) return null;

    const handleSaveCredentials = (e: FormEvent) => {
        e.preventDefault();
        adminUpdateUser(user.id, email, password);
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
        `px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === tabName 
        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`;
    
    const transactions = user.transactionHistory || [];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-slate-200">Manage User</h2>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">{user.email}</p>
                
                <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-4">
                        <button className={tabClasses('credentials')} onClick={() => setActiveTab('credentials')}>Credentials</button>
                        <button className={tabClasses('balance')} onClick={() => setActiveTab('balance')}>Wallet</button>
                        <button className={tabClasses('transactions')} onClick={() => setActiveTab('transactions')}>Transactions</button>
                        <button className={tabClasses('downloads')} onClick={() => setActiveTab('downloads')}>Downloads</button>
                        <button className={tabClasses('notifications')} onClick={() => setActiveTab('notifications')}>Notifications</button>
                    </nav>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    {activeTab === 'credentials' && (
                        <form onSubmit={handleSaveCredentials} className="space-y-4">
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Password</label><input type="text" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                            <button type="submit" className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save Credentials</button>
                        </form>
                    )}
                    {activeTab === 'balance' && (
                        <div className="space-y-4">
                            <div className="text-center bg-white dark:bg-slate-700 p-4 rounded-lg">
                                <p className="text-lg text-slate-600 dark:text-slate-300">Current Balance</p>
                                <p className="text-4xl font-bold text-cyan-500">₹{user.wallet.balance.toFixed(2)}</p>
                            </div>
                            <div>
                                <label className="block text-slate-600 dark:text-slate-400 font-semibold">Amount to Add/Remove</label>
                                <input type="number" placeholder="e.g., 100" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" />
                            </div>
                            <div>
                                <label className="block text-slate-600 dark:text-slate-400 font-semibold">Reason (Optional)</label>
                                <input type="text" placeholder="e.g., Bonus for loyalty" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handleAdjustBalance(true)} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg">Add Balance</button>
                                <button onClick={() => handleAdjustBalance(false)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg">Remove Balance</button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'transactions' && (
                        transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-sm sticky top-0">
                                        <tr>
                                            <th className="p-2">Date</th>
                                            <th className="p-2">Description</th>
                                            <th className="p-2 text-right">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(tx => (
                                            <tr key={tx.id} className="border-b border-slate-200 dark:border-slate-700">
                                                <td className="p-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
                                                <td className="p-2 text-sm text-slate-700 dark:text-slate-300">{tx.description}</td>
                                                <td className={`p-2 text-right font-semibold whitespace-nowrap ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-center text-slate-500 dark:text-slate-400 py-6">This user has no transaction history.</p>
                    )}
                    {activeTab === 'downloads' && (
                         user.downloadHistory && user.downloadHistory.length > 0 ? (
                            <ul className="space-y-2">
                                {user.downloadHistory.map((item, index) => (
                                    <li key={index} className="bg-white dark:bg-slate-700 p-3 rounded-md">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.productName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(item.downloadedAt).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-center text-slate-500 dark:text-slate-400 py-6">This user has no download history.</p>
                    )}
                    {activeTab === 'notifications' && (
                        user.notifications && user.notifications.length > 0 ? (
                            <ul className="space-y-2">
                                {user.notifications.map(item => (
                                    <li key={item.id} className="bg-white dark:bg-slate-700 p-3 rounded-md">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                                        {item.rejectionReason && <p className="text-xs mt-1 text-red-600 dark:text-red-400">Reason: {item.rejectionReason}</p>}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-center text-slate-500 dark:text-slate-400 py-6">This user has no notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const UsersPage = () => {
    const { isAdmin, getAllUsers, adminDeleteUser, adminToggleUserBlockStatus, adminResetUserHWID } = useAppContext();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
    const [managingUser, setManagingUser] = useState<User | null>(null);

    useEffect(() => {
        if (!isAdmin) { navigate('/'); }
    }, [isAdmin, navigate]);

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

    const handleDelete = (userId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
            adminDeleteUser(userId);
        }
    };
    
    if (!isAdmin) return null;

    const FilterButton = ({ value, label }: { value: 'all' | 'active' | 'blocked', label: string }) => (
        <button
            onClick={() => setFilterStatus(value)}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${filterStatus === value ? 'bg-cyan-500 text-white' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <UserManagementModal user={managingUser ? (users.find(u => u.id === managingUser.id) || managingUser) : null} isOpen={!!managingUser} onClose={() => setManagingUser(null)} />
            <div className="max-w-7xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-xl shadow-lg">
                <BackButton />
                <h1 className="text-4xl font-bold mb-6 text-slate-800 dark:text-slate-200">User Management</h1>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
                    <input type="text" placeholder="Search by name, email, or mobile..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:flex-grow p-2 rounded border border-slate-300 dark:bg-slate-600 dark:border-slate-500" />
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <FilterButton value="all" label="All" />
                        <FilterButton value="active" label="Active" />
                        <FilterButton value="blocked" label="Blocked" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase text-sm">
                            <tr>
                                <th className="p-3">User</th>
                                <th className="p-3">Balance</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Registered</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <td className="p-3">
                                        <div className="font-bold">{user.profile.name || user.email}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.mobileNumber}</div>
                                        {user.hwid ? (
                                          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                                            <span>Bound HWID: {user.hwid.substring(0, 15)}...</span>
                                          </div>
                                        ) : (
                                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                            <span>No HWID bound</span>
                                          </div>
                                        )}
                                    </td>
                                    <td className="p-3 font-semibold text-cyan-600 dark:text-cyan-400">₹{user.wallet.balance.toFixed(2)}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.isBlocked ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{new Date(user.registeredAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setManagingUser(user)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" title="Manage User"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            {/* Reset HWID Button */}
                                            <button 
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to reset the Hardware ID (HWID) for ${user.email}?`)) {
                                                        adminResetUserHWID(user.id);
                                                    }
                                                }} 
                                                className="p-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                                                title="Reset Hardware ID (HWID)"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => adminToggleUserBlockStatus(user.id)} className={`p-2 text-white rounded ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`} title={user.isBlocked ? 'Unblock User' : 'Block User'}>{user.isBlocked ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.365 8.365zm1.414-1.414L6.524 5.11a6 6 0 018.365 8.365zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>}</button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-500 dark:text-slate-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;