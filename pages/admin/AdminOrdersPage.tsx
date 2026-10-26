import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { AdminNotification, User } from '../../types';
import { X, Search, Hourglass, Clock, CheckCircle2, Ban } from 'lucide-react';
import CopyButton from '../../components/CopyButton';

const AdminOrdersPage = () => {
    const { 
        getAllOrders, 
        approveActivationOrder, 
        rejectActivationOrder, 
        updateOrderStatusByAdmin, 
        getAllUsers, 
        user: currentUser, 
        isAdmin 
    } = useAppContext();

    const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

    // Modal state for the Reply / Action dialog (Matching image_141867e9.png)
    const [actionModalOrder, setActionModalOrder] = useState<AdminNotification | null>(null);
    const [modalActiveTab, setModalActiveTab] = useState<'success' | 'reject' | 'in_process' | 'waiting'>('success');
    const [modalComments, setModalComments] = useState('');

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
    
    // Live harvested orders from all sources
    const allOrders = useMemo(() => {
        return getAllOrders().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [getAllOrders]);

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

    // Format date in exact DD-MM-YYYY HH:mm matching screenshot
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

    // Extract primary field value for table column "FIELD"
    const getPrimaryFieldValue = (orderDetails: any) => {
        if (!orderDetails) return '-';
        let details = orderDetails;
        if (typeof details === 'string') {
            try { details = JSON.parse(details); } catch(e) {}
        }
        if (typeof details !== 'object' || details === null) return '-';
        
        if (details.email) return details.email;
        if (details.gmail) return details.gmail;
        if (details.username) return details.username;
        if (details.mobile) return details.mobile;
        if (details.imei) return details.imei;
        if (details.serialNumber) return details.serialNumber;

        const ignored = new Set(['categoryName', 'quantity', 'totalPrice', 'price', 'mobileNumber']);
        for (const [k, v] of Object.entries(details)) {
            if (!ignored.has(k) && v) return String(v);
        }
        return '-';
    };

    // Status Badge matching image_21755b26.png
    const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
        if (status === 'approved') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[#10b981] text-white shadow-2xs whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Success</span>
                </span>
            );
        }
        if (status === 'processing') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[#d97706] text-white shadow-2xs whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>In Process</span>
                </span>
            );
        }
        if (status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[#ef4444] text-white shadow-2xs whitespace-nowrap">
                    <Ban className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Rejected</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[#475569] text-white shadow-2xs whitespace-nowrap">
                <Hourglass className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Waiting Action</span>
            </span>
        );
    };

    // Open Action Modal
    const openActionModal = (order: AdminNotification, tab: 'success' | 'reject' | 'in_process' | 'waiting' = 'success') => {
        setActionModalOrder(order);
        setModalActiveTab(tab);
        setModalComments(order.adminReply || order.rejectionReason || '');
    };

    // Handle Modal Submissions
    const handleModalSuccess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionModalOrder) return;
        const msg = modalComments.trim() || 'Order completed successfully';
        approveActivationOrder(actionModalOrder.id, msg);
        setActionModalOrder(null);
        setModalComments('');
    };

    const handleModalReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionModalOrder) return;
        const reason = modalComments.trim() || 'Order rejected by administrator';
        rejectActivationOrder(actionModalOrder.id, reason);
        setActionModalOrder(null);
        setModalComments('');
    };

    const handleModalInProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionModalOrder) return;
        const msg = modalComments.trim() || 'In Process';
        updateOrderStatusByAdmin(actionModalOrder.id, 'processing', msg);
        setActionModalOrder(null);
        setModalComments('');
    };

    const handleModalWaiting = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionModalOrder) return;
        const msg = modalComments.trim() || '';
        updateOrderStatusByAdmin(actionModalOrder.id, 'pending', msg);
        setActionModalOrder(null);
        setModalComments('');
    };

    // Toggle row selection
    const toggleSelectAll = () => {
        if (selectedOrderIds.size === filteredOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const toggleSelectRow = (id: string) => {
        const next = new Set(selectedOrderIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedOrderIds(next);
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300 pb-12">
            {/* Top Bar with Title and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">Order Management</h1>
                </div>
                
                {/* Search Input Bar for Order ID */}
                <div className="relative w-full md:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search order ID, category, user..."
                        className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-slate-900 placeholder-slate-400 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Top 4 Status Metric Cards: Waiting Action (0), In Process (0), Success (0), Rejected (0) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Card 1: Waiting Action */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'pending'
                            ? 'bg-[#eff3f8] border-slate-400 ring-2 ring-slate-400/30 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Waiting Action
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'pending' ? 'bg-[#475569] text-white font-black' : 'bg-slate-100 text-[#475569]'}`}>
                            <Hourglass className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">{waitingCount}</p>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Pending approval</span>
                </button>

                {/* Card 2: In Process */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'processing' ? 'all' : 'processing')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'processing'
                            ? 'bg-[#fef9ed] border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            In Process
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'processing' ? 'bg-[#d97706] text-white font-black' : 'bg-amber-50 text-[#d97706]'}`}>
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">{inProcessCount}</p>
                    <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Work in progress</span>
                </button>

                {/* Card 3: Success */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'approved' ? 'all' : 'approved')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'approved'
                            ? 'bg-[#ecfdf5] border-emerald-400 ring-2 ring-emerald-400/30 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            Success
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'approved' ? 'bg-[#10b981] text-white font-black' : 'bg-emerald-50 text-[#10b981]'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">{successCount}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Completed orders</span>
                </button>

                {/* Card 4: Rejected */}
                <button
                    type="button"
                    onClick={() => setFilter(filter === 'rejected' ? 'all' : 'rejected')}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                        filter === 'rejected'
                            ? 'bg-[#fff1f2] border-rose-400 ring-2 ring-rose-400/30 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                            Rejected
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${filter === 'rejected' ? 'bg-[#ef4444] text-white font-black' : 'bg-rose-50 text-[#ef4444]'}`}>
                            <Ban className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">{rejectedCount}</p>
                    <span className="text-[10px] text-rose-700 font-semibold mt-1 block">Refunded to user</span>
                </button>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            filter === 'all'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                        }`}
                    >
                        All Orders ({allCount})
                    </button>
                    {filter !== 'all' && (
                        <button
                            onClick={() => setFilter('all')}
                            className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-bold ml-2"
                        >
                            <X className="w-3.5 h-3.5" /> Show All
                        </button>
                    )}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                    Showing {filteredOrders.length} of {allCount} orders
                </div>
            </div>
            
            {/* Orders Table - Exact match to image_21755b26.png */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <h2 className="text-lg font-bold text-slate-800">No Orders Found</h2>
                            <p className="text-slate-500 mt-1 text-sm">
                                There are no orders with the status "{filter}".
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80">
                                <tr className="text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                                    <th className="py-3 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="py-3 px-4 font-black">O.ID</th>
                                    <th className="py-3 px-4 font-black">SUBMITTED ON</th>
                                    <th className="py-3 px-4 font-black">SERVICE NAME</th>
                                    <th className="py-3 px-4 font-black">FIELD</th>
                                    <th className="py-3 px-4 font-black">CUSTOMER</th>
                                    <th className="py-3 px-4 font-black">PRICE</th>
                                    <th className="py-3 px-4 font-black">STATUS</th>
                                    <th className="py-3 px-4 font-black text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredOrders.map(order => {
                                    const user = findUser(order.userId);
                                    const isLocked = order.status === 'approved' || order.status === 'rejected';
                                    const cleanOrderId = (order.orderId || order.id || '').replace(/^#/, '');
                                    const submittedOn = formatSubmittedOn(order.timestamp);
                                    const serviceName = order.orderDetails?.categoryName || 'Service Order';
                                    const primaryField = getPrimaryFieldValue(order.orderDetails);
                                    const customerName = (user?.profile?.name || user?.email?.split('@')[0] || 'CUSTOMER').toUpperCase();
                                    const priceStr = `${Number(order.orderDetails?.totalPrice || 0).toFixed(2)} INR`;

                                    return (
                                        <tr 
                                            key={order.id} 
                                            className="hover:bg-slate-50/80 transition-colors duration-150 text-slate-800"
                                        >
                                            {/* Column 1: Checkbox */}
                                            <td className="py-3.5 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrderIds.has(order.id)}
                                                    onChange={() => toggleSelectRow(order.id)}
                                                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                            </td>

                                            {/* Column 2: O.ID */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openActionModal(order, 'success')}
                                                        className="hover:text-amber-600 hover:underline cursor-pointer"
                                                    >
                                                        #{cleanOrderId}
                                                    </button>
                                                    <CopyButton textToCopy={cleanOrderId} className="w-3.5 h-3.5 text-slate-400 hover:text-amber-600" />
                                                </div>
                                            </td>

                                            {/* Column 3: SUBMITTED ON */}
                                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium text-xs">
                                                {submittedOn}
                                            </td>

                                            {/* Column 4: SERVICE NAME */}
                                            <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[240px] truncate" title={serviceName}>
                                                {serviceName}
                                            </td>

                                            {/* Column 5: FIELD */}
                                            <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate font-mono text-xs" title={primaryField}>
                                                {primaryField}
                                            </td>

                                            {/* Column 6: CUSTOMER */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                {customerName}
                                            </td>

                                            {/* Column 7: PRICE */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                {priceStr}
                                            </td>

                                            {/* Column 8: STATUS */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <StatusBadge status={order.status} />
                                            </td>

                                            {/* Column 9: ACTION */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                {isLocked ? (
                                                    <span className="text-slate-400 font-bold text-xs">-</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openActionModal(order, 'success')}
                                                        className="px-3.5 py-1.5 bg-[#1e9e76] hover:bg-[#168160] text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                                                        title="Open order action modal"
                                                    >
                                                        Action / Reply
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* GSM Order Details & Reply Modal (Exact match to image_141867e9.png) */}
            {actionModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white text-slate-900 rounded-lg max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                            <h2 className="text-lg font-black text-slate-900">
                                Order ID: #{(actionModalOrder.orderId || actionModalOrder.id || '').replace(/^#/, '')}
                            </h2>
                            <button
                                onClick={() => setActionModalOrder(null)}
                                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            >
                                <X className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>

                        {/* Modal Body: Left Tabs + Right Content Area */}
                        <div className="flex flex-col md:flex-row min-h-[460px]">
                            {/* Left Sidebar Tabs */}
                            <div className="w-full md:w-52 bg-[#f8fafc] border-r border-slate-200 flex md:flex-col shrink-0 text-left">
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('success')}
                                    className={`px-4 py-3.5 text-xs text-left transition-colors cursor-pointer ${
                                        modalActiveTab === 'success'
                                            ? 'bg-white text-slate-900 font-extrabold border-l-4 border-[#1e9e76] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                                    }`}
                                >
                                    Reply as Success
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('reject')}
                                    className={`px-4 py-3.5 text-xs text-left transition-colors cursor-pointer ${
                                        modalActiveTab === 'reject'
                                            ? 'bg-white text-slate-900 font-extrabold border-l-4 border-rose-500 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                                    }`}
                                >
                                    Reply as Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('in_process')}
                                    className={`px-4 py-3.5 text-xs text-left transition-colors cursor-pointer ${
                                        modalActiveTab === 'in_process'
                                            ? 'bg-white text-slate-900 font-extrabold border-l-4 border-[#d97706] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                                    }`}
                                >
                                    Set In Process
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('waiting')}
                                    className={`px-4 py-3.5 text-xs text-left transition-colors cursor-pointer ${
                                        modalActiveTab === 'waiting'
                                            ? 'bg-white text-slate-900 font-extrabold border-l-4 border-[#475569] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                                    }`}
                                >
                                    Waiting Action
                                </button>
                            </div>

                            {/* Right Content Area */}
                            {(() => {
                                const modalUser = findUser(actionModalOrder.userId);
                                const serviceName = actionModalOrder.orderDetails?.categoryName || 'Service Order';
                                const qty = actionModalOrder.orderDetails?.quantity || 1;
                                const totalPrice = Number(actionModalOrder.orderDetails?.totalPrice || 0).toFixed(2);
                                const custName = modalUser?.profile?.name || 'Customer';
                                const custEmail = modalUser?.email || 'N/A';
                                const custMobile = modalUser?.mobileNumber || 'N/A';
                                const submittedDate = formatSubmittedOn(actionModalOrder.timestamp);

                                // Custom Fields
                                let details = actionModalOrder.orderDetails;
                                if (typeof details === 'string') {
                                    try { details = JSON.parse(details); } catch(e) {}
                                }
                                const ignored = new Set(['categoryName', 'quantity', 'totalPrice', 'price', 'mobileNumber']);
                                const customEntries = (typeof details === 'object' && details !== null)
                                    ? Object.entries(details).filter(([k]) => !ignored.has(k))
                                    : [];

                                return (
                                    <div className="flex-1 p-6 space-y-3.5 bg-white overflow-y-auto">
                                        {/* Section 1: Service Name & Custom Fields */}
                                        <div className="pb-3 border-b border-slate-100">
                                            <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                                                {serviceName}
                                            </h3>
                                            {customEntries.length > 0 ? (
                                                customEntries.map(([k, v]) => (
                                                    <p key={k} className="text-xs text-slate-800 mt-1">
                                                        <strong className="font-bold text-slate-900 capitalize">
                                                            {k.replace(/([A-Z])/g, ' $1')}:
                                                        </strong>{' '}
                                                        <span>{String(v)}</span>
                                                    </p>
                                                ))
                                            ) : (
                                                primaryField !== '-' && (
                                                    <p className="text-xs text-slate-800 mt-1">
                                                        <strong className="font-bold text-slate-900">Email:</strong>{' '}
                                                        <span>{primaryField}</span>
                                                    </p>
                                                )
                                            )}
                                        </div>

                                        {/* Section 2: Quantity & Total Price */}
                                        <div className="pb-3 border-b border-slate-100 text-xs text-slate-800 space-y-1">
                                            <p><strong className="font-bold text-slate-900">Quantity:</strong> {qty}</p>
                                            <p><strong className="font-bold text-slate-900">Total Price:</strong> {totalPrice} INR</p>
                                        </div>

                                        {/* Section 3: Customer Info */}
                                        <div className="pb-3 border-b border-slate-100 text-xs text-slate-800 space-y-1">
                                            <p><strong className="font-bold text-slate-900">Customer Name:</strong> {custName}</p>
                                            <p><strong className="font-bold text-slate-900">Customer Email:</strong> {custEmail}</p>
                                            <p><strong className="font-bold text-slate-900">Customer Mobile:</strong> {custMobile}</p>
                                        </div>

                                        {/* Section 4: Submitted Date */}
                                        <div className="pb-3 border-b border-slate-100 text-xs text-slate-800">
                                            <strong className="font-bold text-slate-900">Submitted:</strong> {submittedDate}
                                        </div>

                                        {/* Section 5: Order Processing */}
                                        <div className="pb-3 border-b border-slate-100 text-xs text-slate-800">
                                            <strong className="font-bold text-slate-900">Order Processing:</strong> Manual
                                        </div>

                                        {/* Section 6: Order Status */}
                                        <div className="pb-3 border-b border-slate-100 text-xs text-slate-800 flex items-center gap-2.5">
                                            <strong className="font-bold text-slate-900">Order Status</strong>
                                            <StatusBadge status={actionModalOrder.status} />
                                        </div>

                                        {/* Section 7: Comments Textarea */}
                                        <div className="pt-1">
                                            <textarea
                                                rows={4}
                                                placeholder="Comments"
                                                value={modalComments}
                                                onChange={(e) => setModalComments(e.target.value)}
                                                className="w-full border border-slate-200 rounded-md p-3 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 text-slate-900 placeholder-slate-400 resize-y"
                                            />
                                        </div>

                                        {/* Section 8: Action Submit Button */}
                                        <div className="pt-2">
                                            {modalActiveTab === 'success' && (
                                                <button
                                                    type="button"
                                                    onClick={handleModalSuccess}
                                                    className="bg-[#1e9e76] hover:bg-[#168160] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-xs cursor-pointer"
                                                >
                                                    Reply as Success
                                                </button>
                                            )}
                                            {modalActiveTab === 'reject' && (
                                                <button
                                                    type="button"
                                                    onClick={handleModalReject}
                                                    className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-xs cursor-pointer"
                                                >
                                                    Reply as Reject
                                                </button>
                                            )}
                                            {modalActiveTab === 'in_process' && (
                                                <button
                                                    type="button"
                                                    onClick={handleModalInProcess}
                                                    className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-xs cursor-pointer"
                                                >
                                                    Set to In Process
                                                </button>
                                            )}
                                            {modalActiveTab === 'waiting' && (
                                                <button
                                                    type="button"
                                                    onClick={handleModalWaiting}
                                                    className="bg-[#475569] hover:bg-[#334155] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-xs cursor-pointer"
                                                >
                                                    Set to Waiting Action
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
