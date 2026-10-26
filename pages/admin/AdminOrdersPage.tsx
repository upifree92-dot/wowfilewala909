import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { AdminNotification, User } from '../../types';
import { AlertCircle, X, Search, Hourglass, Clock, CheckCircle2, Ban, Lock } from 'lucide-react';
import CopyButton from '../../components/CopyButton';

const AdminOrdersPage = () => {
    const { getAllOrders, approveActivationOrder, rejectActivationOrder, updateOrderStatusByAdmin, getAllUsers, user: currentUser, isAdmin } = useAppContext();
    const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'approved' | 'rejected'>('all');
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

    // Live counts for the 4 order status cards
    const waitingCount = useMemo(() => allOrders.filter(o => o.status === 'pending' || !o.status).length, [allOrders]);
    const inProcessCount = useMemo(() => allOrders.filter(o => o.status === 'processing').length, [allOrders]);
    const successCount = useMemo(() => allOrders.filter(o => o.status === 'approved').length, [allOrders]);
    const rejectedCount = useMemo(() => allOrders.filter(o => o.status === 'rejected').length, [allOrders]);
    const allCount = allOrders.length;

    const filteredOrders = useMemo(() => {
        let list = allOrders;
        if (filter !== 'all') {
            if (filter === 'pending') {
                list = list.filter(order => order.status === 'pending' || !order.status);
            } else {
                list = list.filter(order => order.status === filter);
            }
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
    
    const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
        if (status === 'approved') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Success</span>
                </span>
            );
        }
        if (status === 'processing') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In Process</span>
                </span>
            );
        }
        if (status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Rejected</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                <Hourglass className="w-3.5 h-3.5" />
                <span>Waiting Action</span>
            </span>
        );
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
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl animate-in fade-in duration-300">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
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
                        className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 text-slate-200 placeholder-slate-500 transition-all"
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

            {/* Top 4 Status Filter Buttons / Cards: Waiting Action (0), In Process (0), Success (0), Rejected (0) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
                {/* Card 1: Waiting Action */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'pending'
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors uppercase tracking-wider">
                            Waiting Action
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'}`}>
                            <Hourglass className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 font-mono">{waitingCount}</p>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Pending approval</span>
                </button>

                {/* Card 2: In Process */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'processing' ? 'all' : 'processing')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'processing'
                            ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-sky-400 transition-colors uppercase tracking-wider">
                            In Process
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'processing' ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 text-sky-400'}`}>
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 font-mono">{inProcessCount}</p>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Work in progress</span>
                </button>

                {/* Card 3: Success */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'approved' ? 'all' : 'approved')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'approved'
                            ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
                            Success
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'approved' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-emerald-400'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 font-mono">{successCount}</p>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Completed orders</span>
                </button>

                {/* Card 4: Rejected */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'rejected' ? 'all' : 'rejected')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'rejected'
                            ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-rose-400 transition-colors uppercase tracking-wider">
                            Rejected
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'rejected' ? 'bg-rose-500 text-slate-950 font-black' : 'bg-slate-800 text-rose-400'}`}>
                            <Ban className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-100 mt-2 font-mono">{rejectedCount}</p>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Refunded to user</span>
                </button>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center justify-between gap-3 mb-6 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            filter === 'all'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-md'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                    >
                        All Orders ({allCount})
                    </button>
                    {filter !== 'all' && (
                        <button
                            onClick={() => setFilter('all')}
                            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold ml-2"
                        >
                            <X className="w-3.5 h-3.5" /> Show All
                        </button>
                    )}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                    Showing {filteredOrders.length} of {allCount} orders
                </div>
            </div>
            
            {/* Orders Table */}
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
                            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                                <th className="p-3 pb-4">User</th>
                                <th className="p-3 pb-4">Order Details</th>
                                <th className="p-3 pb-4">Status</th>
                                <th className="p-3 pb-4 min-w-[280px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredOrders.map(order => {
                                const user = findUser(order.userId);
                                const commentVal = orderComments[order.id] !== undefined 
                                    ? orderComments[order.id] 
                                    : (order.adminReply || order.rejectionReason || '');

                                return (
                                    <tr key={order.id} className="hover:bg-slate-900/30 transition-colors duration-150 align-top">
                                        {/* User Column */}
                                        <td className="p-3 py-4">
                                            <div className="font-bold text-slate-100 text-sm sm:text-base">{user?.profile.name || '(No Name)'}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{user?.email || 'Unknown Email'}</div>
                                            <div className="text-[10px] text-slate-500 font-mono mt-2">{new Date(order.timestamp).toLocaleString()}</div>
                                        </td>

                                        {/* Order Details Column */}
                                        <td className="p-3 py-4 text-sm">
                                            <p className="font-bold text-slate-200">{order.orderDetails?.categoryName || 'Order'}</p>
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
                                                        key !== 'categoryName' && key !== 'quantity' && key !== 'totalPrice' && key !== 'price' && (
                                                            <p key={key}><span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(val)}</p>
                                                        )
                                                    )) : null;
                                                })()}

                                                <p><span className="text-slate-500">Qty:</span> {order.orderDetails?.quantity || 1}</p>
                                                <p><span className="text-slate-500">Cost:</span> <span className="text-amber-400 font-semibold">₹{Number(order.orderDetails?.totalPrice || 0).toFixed(2)}</span></p>
                                                {order.adminReply && (
                                                    <p><span className="text-slate-500">Delivered:</span> <span className="text-emerald-400 font-mono font-semibold">{order.adminReply}</span></p>
                                                )}
                                                {order.rejectionReason && (
                                                    <p><span className="text-slate-500">Reason:</span> <span className="text-rose-400 font-mono font-semibold">{order.rejectionReason}</span></p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status Column */}
                                        <td className="p-3 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.status} />
                                        </td>

                                        {/* Actions Column: Hidden once order is Success or Rejected */}
                                        <td className="p-3 py-4">
                                            {(() => {
                                                const isLocked = order.status === 'approved' || order.status === 'rejected';

                                                if (isLocked) {
                                                    return (
                                                        <div className="flex items-center text-slate-600 text-xs font-semibold py-2">
                                                            <span>-</span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="flex flex-col gap-2 min-w-[280px]">
                                                        {/* Admin Reply / Activation Code Input */}
                                                        <input 
                                                            type="text" 
                                                            placeholder="Enter activation code, reply note..."
                                                            value={commentVal}
                                                            className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                                            onChange={(e) => {
                                                                setOrderComments(prev => ({ ...prev, [order.id]: e.target.value }));
                                                            }}
                                                        />

                                                        {/* 4 Clean Action Buttons */}
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            {/* Button 1: Waiting Action */}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const msg = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.adminReply || '');
                                                                    updateOrderStatusByAdmin(order.id, 'pending', msg);
                                                                }} 
                                                                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1 active:scale-95 ${
                                                                    order.status === 'pending' || !order.status
                                                                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm'
                                                                        : 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                                                                }`}
                                                                title="Set status to Waiting Action (Pending)"
                                                            >
                                                                <Hourglass className="w-3 h-3 shrink-0" />
                                                                <span>Waiting Action</span>
                                                            </button>

                                                            {/* Button 2: In Process */}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const msg = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.adminReply || 'In Process');
                                                                    updateOrderStatusByAdmin(order.id, 'processing', msg);
                                                                }} 
                                                                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1 active:scale-95 ${
                                                                    order.status === 'processing'
                                                                        ? 'bg-sky-500 text-slate-950 font-black border-sky-400 shadow-sm'
                                                                        : 'bg-slate-900/80 hover:bg-slate-800 text-sky-300 border-sky-500/30'
                                                                }`}
                                                                title="Set status to In Process"
                                                            >
                                                                <Clock className="w-3 h-3 shrink-0" />
                                                                <span>In Process</span>
                                                            </button>

                                                            {/* Button 3: Success */}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const msg = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.adminReply || 'Order completed successfully');
                                                                    approveActivationOrder(order.id, msg);
                                                                }} 
                                                                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1 active:scale-95 ${
                                                                    order.status === 'approved'
                                                                        ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-sm'
                                                                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                                                }`}
                                                                title="Approve order as Success"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                                <span>Success</span>
                                                            </button>

                                                            {/* Button 4: Rejected */}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const msg = orderComments[order.id] !== undefined ? orderComments[order.id] : (order.rejectionReason || order.adminReply || '');
                                                                    if (msg) {
                                                                        setRejectionReason(msg);
                                                                    }
                                                                    setRejectingOrder(order);
                                                                }} 
                                                                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center flex items-center justify-center gap-1 active:scale-95 ${
                                                                    order.status === 'rejected'
                                                                        ? 'bg-rose-500 text-white font-black border-rose-400 shadow-sm'
                                                                        : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                                                                }`}
                                                                title="Reject order and refund customer wallet"
                                                            >
                                                                <Ban className="w-3 h-3 shrink-0" />
                                                                <span>Rejected</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Custom Rejection Modal */}
            {rejectingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative bg-slate-950 rounded-2xl max-w-md w-full shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40 rounded-t-2xl">
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
                            <div className="flex items-center justify-end gap-2 px-6 py-4.5 bg-slate-900/20 border-t border-slate-800 rounded-b-2xl">
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
