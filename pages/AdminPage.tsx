
import React from 'react';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import type { AdminNotification, User } from '../types';

const AdminPage = () => {
    const { getAdminNotifications, approveActivationOrder, getAllUsers, notification, user: currentUser, isAdmin } = useAppContext();

    const users = getAllUsers();
    
    // Create a map for quick user lookup
    const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);

    // Add admin to map for cases where admin is the user
    if (isAdmin && currentUser) {
        userMap[currentUser.id] = currentUser;
    }

    const findUser = (userId?: string): User | undefined => {
        return userId ? userMap[userId] : undefined;
    };

    const pendingOrders = getAdminNotifications().filter(
        (n): n is Required<AdminNotification> => n.type === 'order' && n.status === 'pending'
    );
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl animate-in fade-in duration-300">
                <BackButton />
                <div className="flex items-center space-x-2.5 mt-4 mb-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-100">Pending Activation Orders</h1>
                </div>
                {notification && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl mb-6 text-sm">{notification.message}</div>}
                
                <div className="overflow-x-auto">
                    {pendingOrders.length === 0 ? (
                         <div className="bg-slate-950 p-10 rounded-2xl border border-slate-800 text-center">
                            <h2 className="text-lg font-bold text-slate-200">No Pending Orders</h2>
                            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-xs">
                                All activation orders have been processed. New orders will appear here for your approval.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                                    <th className="p-3 pb-4">User</th>
                                    <th className="p-3 pb-4">Category</th>
                                    <th className="p-3 pb-4">Order Info</th>
                                    <th className="p-3 pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {pendingOrders.map(order => {
                                    const user = findUser(order.userId);
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-900/30 transition-colors duration-150 align-top">
                                            <td className="p-3 py-4">
                                                <div className="font-bold text-slate-100 text-sm">{user?.profile.name || '(No Name)'}</div>
                                                <div className="text-xs text-slate-400 mt-1">{user?.email || 'Unknown Email'}</div>
                                                <div className="text-xs text-slate-400 mt-1">{user?.mobileNumber || ''}</div>
                                            </td>
                                            <td className="p-3 py-4 text-xs sm:text-sm">
                                                <p className="font-bold text-slate-200">{order.orderDetails.categoryName}</p>
                                            </td>
                                             <td className="p-3 py-4 text-xs">
                                                <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-slate-300 text-xs">
                                                    <div className="font-semibold text-slate-500">Quantity:</div>
                                                    <div className="font-mono">{order.orderDetails.quantity} units</div>
                                                    
                                                    <div className="font-semibold text-slate-500">Total Cost:</div>
                                                    <div className="font-mono font-bold text-amber-400">₹{order.orderDetails.totalPrice.toFixed(2)}</div>
                                                    
                                                    {Object.entries(order.orderDetails)
                                                        .filter(([key]) => !['quantity', 'totalPrice', 'categoryName'].includes(key))
                                                        .map(([key, value]) => {
                                                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                                                            return (
                                                                <React.Fragment key={key}>
                                                                    <div className="font-semibold text-slate-500">{label}:</div>
                                                                    <div className="font-mono bg-slate-950 border border-slate-800 text-amber-500 px-1.5 py-0.5 rounded-md truncate max-w-xs">{String(value)}</div>
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-3 py-4 text-right">
                                                <button onClick={() => approveActivationOrder(order.id)} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/10 transition-all">
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;