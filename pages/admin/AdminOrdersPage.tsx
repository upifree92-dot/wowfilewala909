import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { AdminNotification, User } from '../../types';
import { AlertCircle, X, Search } from 'lucide-react';
import CopyButton from '../../components/CopyButton';

const AdminOrdersPage = () => {
    const { getAllOrders, approveActivationOrder, rejectActivationOrder, updateOrderStatusByAdmin, deleteAdminNotification, clearAdminNotifications, getAllUsers, user: currentUser, isAdmin } = useAppContext();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderComments, setOrderComments] = useState<Record<string, string>>({});
    
    // Custom modal states for rejection
    const [rejectingOrder, setRejectingOrder] = useState<AdminNotification | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const users = getAllUsers();
    const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);

    if (isAdmin && currentUser) {
        userMap[currentUser.id] = currentUser;
    }

    const findUser = (userId?: string): User | undefined => {
        return userId ? userMap[userId] : undefined;
    };
    
    const allOrders = useMemo(() => getAllOrders().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [getAllOrders]);

    const filteredOrders = useMemo(() => {
        let list = allOrders;
        if (filter !== 'all') {
            list = list.filter(order => order.status === filter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            list = list.filter(order => {
                const orderUser = findUser(order.userId);
                const orderId = order.orderId || '';
                const categoryName = order.orderDetails?.categoryName || '';
                const userName = orderUser?.profile?.name || '';
                const userEmail = orderUser?.email || '';
                return (
                    orderId.toLowerCase().includes(query) ||
                    categoryName.toLowerCase().includes(query) ||
                    userName.toLowerCase().includes(query) ||
                    userEmail.toLowerCase().includes(query)
                );
            });
        }
        return list;
    }, [allOrders, filter, searchQuery, users]);
    
    const FilterButton = ({ value, label }: { value: 'all' | 'pending' | 'approved' | 'rejected', label: string }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 border ${filter === value ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/10 scale-102' : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border-slate-800'}`}
        >
            {label}
        </button>
    );
    
    const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
        const baseClasses = 'px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize inline-block tracking-wide border';
        const styles: { [key: string]: string } = {
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
        const labelMap: { [key: string]: string } = {
            approved: 'Success',
            pending: 'Pending',
            rejected: 'Rejected',
            info: 'Info'
        };
        return <span className={`${baseClasses} ${styles[status || 'info']}`}>{labelMap[status || ''] || status}</span>;
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rejectingOrder) {
            rejectActivationOrder(rejectingOrder.id, rejectionReason);
            if (rejectingOrder.id) {
                setOrderComments(prev => {
                    const next = { ...prev };
                    delete next[rejectingOrder.id];
                    return next;
                });
            }
            setRejectingOrder(null);
            setRejectionReason('');
        }
    };

    return (
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
                <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <h1 className="text-xl font-bold tracking-wide text-slate-100">Order Management</h1>
                </div>
                
                {/* Search Input Bar for Order ID */}
                <div className="relative w-full md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search order ID, category, user..."
                        className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 text-slate-200 placeholder-slate-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>



            <div className="flex flex-wrap items-center gap-2 mb-6">
                <FilterButton value="all" label="All" />
                <FilterButton value="pending" label="Pending" />
                <FilterButton value="approved" label="Success" />
                <FilterButton value="rejected" label="Rejected" />
            </div>
            
            <div className="overflow-x-auto">
                {filteredOrders.length === 0 ? (
                     <div className="bg-slate-950/50 border border-slate-800/50 p-10 rounded-2xl text-center mt-4">
                        <h2 className="text-lg font-bold text-slate-300">No Orders Found</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            There are no orders with the status "{filter}".
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                                <th className="p-3 pb-4">User</th>
                                <th className="p-3 pb-4">Order Details</th>
                                <th className="p-3 pb-4">Status</th>
                                <th className="p-3 pb-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredOrders.map(order => {
                                const user = findUser(order.userId);
                                return (
                                    <tr key={order.id} className="hover:bg-slate-900/30 transition-colors duration-150 align-top">
                                        <td className="p-3 py-4">
                                            <div className="font-bold text-slate-100 text-sm sm:text-base">{user?.profile.name || '(No Name)'}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{user?.email || 'Unknown Email'}</div>
                                            <div className="text-[10px] text-slate-500 font-mono mt-2">{new Date(order.timestamp).toLocaleString()}</div>
                                        </td>
                                        <td className="p-3 py-4 text-sm">
                                            <p className="font-bold text-slate-200">{order.orderDetails.categoryName}</p>
                                            <div className="text-xs mt-2 space-y-1.5 text-slate-400">
                                                {order.orderId && (
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <span>ID:</span>
                                                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-[11px] text-amber-400 font-bold border border-amber-500/10">{order.orderId}</span>
                                                        <CopyButton textToCopy={order.orderId} className="w-4.5 h-4.5 p-1 text-slate-500 hover:text-amber-400" />
                                                    </div>
                                                )}
                                                
                                                {/* Full Order Details */}
                                                {(() => {
                                                    let details = order.orderDetails;
                                                    if (typeof details === 'string') {
                                                        try { details = JSON.parse(details); } catch(e) {}
                                                    }
                                                    return typeof details === 'object' && details !== null ? Object.entries(details).map(([key, val]) => (
                                                        key !== 'categoryName' && key !== 'quantity' && key !== 'totalPrice' && (
                                                            <p key={key}><span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(val)}</p>
                                                        )
                                                    )) : null;
                                                })()}

                                                <p><span className="text-slate-500">Qty:</span> {order.orderDetails.quantity}</p>
                                                <p><span className="text-slate-500">Cost:</span> <span className="text-amber-400 font-semibold">₹{order.orderDetails.totalPrice.toFixed(2)}</span></p>
                                            </div>

                                        </td>
                                         <td className="p-3 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="p-3 py-4 flex flex-col gap-2 min-w-[170px]">
                                            {/* Admin Status Dropdown Selector */}
                                            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Status:</label>
                                                <select
                                                    value={order.status || 'pending'}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value as 'pending' | 'processing' | 'approved' | 'rejected';
                                                        const comment = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.adminReply || '');
                                                        if (newStatus === 'rejected') {
                                                            if (comment) setRejectionReason(comment);
                                                            setRejectingOrder(order);
                                                        } else {
                                                            updateOrderStatusByAdmin(order.id, newStatus, comment);
                                                        }
                                                    }}
                                                    className="flex-1 text-xs py-1 px-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                                                >
                                                    <option value="pending">🟡 Pending</option>
                                                    <option value="approved">🟢 Success</option>
                                                    <option value="rejected">🔴 Rejected & Refund</option>
                                                </select>
                                            </div>

                                            {/* Admin Reply / Activation Code Input */}
                                            <input 
                                                type="text" 
                                                placeholder="Enter activation code / note..."
                                                value={orderComments[order.id] !== undefined ? orderComments[order.id] : (order.adminReply || order.rejectionReason || '')}
                                                className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                                onChange={(e) => {
                                                    setOrderComments(prev => ({ ...prev, [order.id]: e.target.value }));
                                                }}
                                            />

                                            {/* Quick Action Buttons */}
                                            <div className="grid grid-cols-3 gap-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const msg = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.adminReply || 'Order completed successfully');
                                                        approveActivationOrder(order.id, msg);
                                                    }} 
                                                    className="px-2 py-1.5 text-[10px] font-extrabold rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all text-center active:scale-95"
                                                    title="Select Success & Send to User"
                                                >
                                                    Success
                                                </button>
                                                {/* Process button removed */}
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const msg = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.rejectionReason || order.adminReply || '');
                                                        if (msg) {
                                                            setRejectionReason(msg);
                                                        }
                                                        setRejectingOrder(order);
                                                    }} 
                                                    className="px-2 py-1.5 text-[10px] font-extrabold rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all text-center active:scale-95"
                                                    title="Select Rejected & Refund Customer Wallet"
                                                >
                                                    Reject
                                                </button>
                                            </div>

                                            {/* Delivered preview */}
                                            {(order.adminReply || order.rejectionReason) && (
                                                <div className={`p-2 rounded-lg border text-[11px] ${
                                                    order.status === 'approved' 
                                                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
                                                        : order.status === 'rejected'
                                                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                                                        : 'bg-orange-500/10 border-orange-500/25 text-orange-300'
                                                }`}>
                                                    <span className="font-bold text-[10px] uppercase tracking-wider block">
                                                        {order.status === 'approved' ? '✓ User Order History Shows:' : order.status === 'rejected' ? '✕ User Order History Shows:' : '⏳ User Order History Shows:'}
                                                    </span>
                                                    <p className="font-mono mt-0.5 break-all font-semibold select-all">{order.adminReply || order.rejectionReason}</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )
}
            </div>

            {/* Custom Rejection Modal */}
            {rejectingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative bg-slate-950 rounded-2xl max-w-md w-full shadow-2xl border border-slate-800/80 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/40 rounded-t-2xl">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/10 rounded-lg">
                                    <AlertCircle className="h-4.5 w-4.5" />
                                </div>
                                <h3 className="font-bold text-slate-100 text-base">Reject Order</h3>
                            </div>
                            <button
                                onClick={() => setRejectingOrder(null)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 transition-all duration-200"
                            >
                                <X className="h-4.5 w-4.5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleRejectSubmit}>
                            <div className="p-6">
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                                    Please provide a reason for rejecting the order <strong className="text-amber-400">#{rejectingOrder.orderId}</strong> ({rejectingOrder.orderDetails?.categoryName}). The cost (<span className="text-amber-400 font-semibold font-mono">₹{Number(rejectingOrder.orderDetails?.totalPrice || 0).toFixed(2)}</span>) will be automatically returned to the user's wallet.
                                </p>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">
                                    Rejection Reason
                                </label>
                                <textarea
                                    required
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., Invalid credentials, or service out of stock"
                                    rows={4}
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/40 text-slate-200 placeholder-slate-600 transition-all duration-200"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2 px-6 py-4.5 bg-slate-900/20 border-t border-slate-800/60 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setRejectingOrder(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-rose-600/10"
                                >
                                    Confirm Rejection & Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
