import React, { useState, FormEvent, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import type { User, AdminNotification } from '../types';
import CopyButton from '../components/CopyButton';
import { Search, X } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import {
  playOrderPlacedSound,
  playOrderApprovedSound,
  playOrderRejectedSound,
  playAdminIncomingOrderSound,
  isSoundEnabled,
  setSoundEnabled
} from '../lib/audio';

// Modal for entering rejection reason
const RejectionModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (reason: string) => void }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onSubmit(reason);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 text-slate-800 dark:text-slate-200">Rejection Reason</h2>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">Please provide a reason for rejecting this order. The user will see this comment.</p>
                <form onSubmit={handleSubmit}>
                    <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 h-28 text-base dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="e.g., Incorrect username or password provided..."
                        autoFocus
                    />
                    <button type="submit" className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">Confirm Rejection</button>
                </form>
            </div>
        </div>
    );
};

const ReplyModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (message: string) => void }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSubmit(message);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 text-slate-800 dark:text-slate-200">Reply to User</h2>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-5">Your message will be sent as a new notification to the user.</p>
                <form onSubmit={handleSubmit}>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 h-28 text-base dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Type your reply here..."
                        autoFocus
                    />
                    <button type="submit" className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">Send Reply</button>
                </form>
            </div>
        </div>
    );
};

const NotificationsPage = () => {
    useSEO('Notifications', 'View your notifications and alerts.');
    const { 
        user, isAdmin, 
        getUserNotifications, markUserNotificationAsRead,
        getAllUsers, siteContent 
    } = useAppContext();
    const navigate = useNavigate();
    const [rejectingNotification, setRejectingNotification] = useState<AdminNotification | null>(null);
    const [replyingNotification, setReplyingNotification] = useState<AdminNotification | null>(null);
    const [soundsActive, setSoundsActive] = useState(isSoundEnabled());
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update currentTime every second for automatic real-time countdown updates
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleSounds = () => {
        const newVal = !soundsActive;
        setSoundsActive(newVal);
        setSoundEnabled(newVal);
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    const allUsers = getAllUsers();
    const userMap = allUsers.reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
    }, {} as Record<string, User>);
    
    if (isAdmin && user) {
        userMap[user.id] = user;
    }

    const findUser = (userId?: string): User | undefined => {
        return userId ? userMap[userId] : undefined;
    };
    
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const baseClasses = 'px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full capitalize inline-block border';
        const styles: { [key: string]: string } = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-300/30',
            processing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-300/30',
            approved: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border-green-300/30',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-300/30',
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300/30',
        };
        return <span className={`${baseClasses} ${styles[status] || styles.info}`}>{status}</span>;
    };

    const AdminView = () => {
        const notifications = getAdminNotifications();

        const filteredNotifications = useMemo(() => {
            const sorted = [...notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (!searchQuery.trim()) return sorted;
            const query = searchQuery.toLowerCase();
            return sorted.filter(n => {
                const orderUser = findUser(n.userId);
                const desc = n.message || '';
                return (
                    desc.toLowerCase().includes(query) ||
                    (n.status && n.status.toLowerCase().includes(query)) ||
                    (n.orderId && n.orderId.toLowerCase().includes(query)) ||
                    (orderUser && (
                        orderUser.profile.name.toLowerCase().includes(query) ||
                        orderUser.email.toLowerCase().includes(query) ||
                        (orderUser.mobileNumber && orderUser.mobileNumber.toLowerCase().includes(query))
                    )) ||
                    (n.orderDetails && (
                        n.orderDetails.categoryName.toLowerCase().includes(query) ||
                        Object.entries(n.orderDetails).some(([k, v]) => String(v).toLowerCase().includes(query))
                    ))
                );
            });
        }, [notifications]);

        return (
            <div>
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                     <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                         {siteContent.notificationsPage.adminTitle}
                     </h1>
                     
                     {/* Search Input Bar */}
                     <div className="relative w-full md:max-w-xs">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                             <Search className="h-4 w-4" />
                         </div>
                         <input
                             type="text"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             placeholder="Search users, orders, specs..."
                             className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 dark:text-slate-100 transition-all"
                         />
                         {searchQuery && (
                             <button
                                 onClick={() => setSearchQuery('')}
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                             >
                                 <X className="h-3.5 w-3.5" />
                             </button>
                         )}
                     </div>
                 </div>

                 {filteredNotifications.length === 0 ? (
                    <p className="text-center p-8 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-400 text-sm">
                        {searchQuery ? 'No notifications match your search.' : siteContent.notificationsPage.noAdminNotifications}
                    </p>
                 ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white dark:bg-slate-800 rounded-lg shadow text-xs sm:text-sm">
                            <thead className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase text-2xs tracking-wider">
                                <tr>
                                    <th className="p-3">{siteContent.notificationsPage.userColumn}</th>
                                    <th className="p-3">{siteContent.notificationsPage.categoryAndCostColumn}</th>
                                    <th className="p-3">{siteContent.notificationsPage.submittedCredentialsColumn}</th>
                                    <th className="p-3">{siteContent.notificationsPage.statusColumn}</th>
                                    <th className="p-3">{siteContent.notificationsPage.dateColumn}</th>
                                    <th className="p-3 text-right">{siteContent.notificationsPage.actionsColumn}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNotifications.map(n => {
                                    const orderUser = findUser(n.userId);
                                    return (
                                    <tr key={n.id} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 align-top ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="p-3">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{orderUser?.profile.name || '(No Name)'}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{orderUser?.email || 'System'}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{orderUser?.mobileNumber || ''}</div>
                                        </td>
                                        
                                        {n.type === 'order' && n.orderDetails ? (
                                            <>
                                                <td className="p-3 text-xs">
                                                    <p className="font-bold text-slate-700 dark:text-slate-300">{n.orderDetails.categoryName}</p>
                                                    <p><strong>Qty:</strong> {n.orderDetails.quantity}</p>
                                                    <p><strong>Cost:</strong> ₹{n.orderDetails.totalPrice.toFixed(2)}</p>
                                                </td>
                                                <td className="p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                                    {Object.entries(n.orderDetails).map(([key, value]) => {
                                                        if (['categoryName', 'quantity', 'totalPrice'].includes(key)) return null;
                                                        return <p key={key}><strong>{key}:</strong> {String(value)}</p>
                                                    })}
                                                </td>
                                            </>
                                        ) : (
                                            <td className="p-3 text-xs text-slate-600 dark:text-slate-400" colSpan={2}>{n.message}</td>
                                        )}

                                        <td className="p-3"><StatusBadge status={n.status || 'info'} /></td>
                                        <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{new Date(n.timestamp).toLocaleString()}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {n.type === 'order' && !n.isReplied && (
                                                    <button onClick={() => setReplyingNotification(n)} className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" title={siteContent.notificationsPage.replyButton}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    </button>
                                                )}
                                                {n.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => approveActivationOrder(n.id)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title={siteContent.notificationsPage.approveButton}><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></button>
                                                        <button onClick={() => setRejectingNotification(n)} className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" title={siteContent.notificationsPage.rejectButton}><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.365 8.365zm1.414-1.414L6.524 5.11a6 6 0 018.365 8.365zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg></button>

                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 )}
                <RejectionModal
                    isOpen={!!rejectingNotification}
                    onClose={() => setRejectingNotification(null)}
                    onSubmit={(reason) => {
                        if (rejectingNotification) {
                            rejectActivationOrder(rejectingNotification.id, reason);
                        }
                        setRejectingNotification(null);
                    }}
                />
                <ReplyModal
                    isOpen={!!replyingNotification}
                    onClose={() => setReplyingNotification(null)}
                    onSubmit={(message) => {
                        if (replyingNotification) {
                            adminReplyToNotification(replyingNotification.id, message);
                        }
                        setReplyingNotification(null);
                    }}
                />
            </div>
        )
    }

    const UserView = () => {
        const notifications = getUserNotifications();

        const filteredNotifications = useMemo(() => {
            const now = Date.now();
            const sorted = [...notifications].filter(n => !n.expiresAt || new Date(n.expiresAt).getTime() > now).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (!searchQuery.trim()) return sorted;
            const query = searchQuery.toLowerCase();
            return sorted.filter(n => {
                const messageParts = n.message.split('\n\nSubmitted Details:\n');
                const mainMessage = messageParts[0] || '';
                const submittedDetails = messageParts[1] || '';
                return (
                    n.title.toLowerCase().includes(query) ||
                    mainMessage.toLowerCase().includes(query) ||
                    submittedDetails.toLowerCase().includes(query) ||
                    (n.orderId && n.orderId.toLowerCase().includes(query)) ||
                    (n.status && n.status.toLowerCase().includes(query)) ||
                    (n.rejectionReason && n.rejectionReason.toLowerCase().includes(query)) ||
                    (n.adminReply && n.adminReply.toLowerCase().includes(query))
                );
            });
        }, [notifications, searchQuery]);

        return (
            <div>
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                     <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                         {siteContent.notificationsPage.userTitle}
                     </h1>
                     
                     {/* Search Input Bar */}
                     <div className="relative w-full md:max-w-xs">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                             <Search className="h-4 w-4" />
                         </div>
                         <input
                             type="text"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             placeholder="Search your orders, status, comments..."
                             className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 dark:text-slate-100 transition-all"
                         />
                         {searchQuery && (
                             <button
                                 onClick={() => setSearchQuery('')}
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                             >
                                 <X className="h-3.5 w-3.5" />
                             </button>
                         )}
                     </div>
                 </div>

                 {filteredNotifications.length === 0 ? (
                    <div className="text-center p-8 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {searchQuery ? 'No notifications match your search query.' : siteContent.notificationsPage.noNotifications}
                        </p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map(n => {
                            const messageParts = n.message.split('\n\nSubmitted Details:\n');
                            const hasDetails = messageParts.length > 1;

                            const isApproved = n.status === 'approved';

                            return (
                            <div key={n.id} className={`p-3 sm:p-3.5 rounded-xl flex flex-col gap-3 border-l-4 shadow-sm transition-all duration-200 ${!n.read ? 'bg-white dark:bg-slate-700/70 border-l-cyan-500' : 'bg-slate-50/50 dark:bg-slate-800/50 border-l-slate-300 dark:border-l-slate-700'}
                                ${n.status === 'approved' ? '!border-l-green-500' : n.status === 'rejected' ? '!border-l-red-500' : n.status === 'pending' ? '!border-l-yellow-500' : ''}`}>
                                <div className="flex items-start gap-3 justify-between w-full">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 truncate" title={n.title}>{n.title}</h3>
                                            {n.status && <StatusBadge status={n.status} />}
                                        </div>
                                        
                                        {n.orderId && (
                                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                <span>Order ID:</span>
                                                <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] sm:text-xs text-slate-700 dark:text-slate-300">{n.orderId}</span>
                                                <CopyButton textToCopy={n.orderId} className="w-5 h-5 !p-0.5" />
                                            </div>
                                        )}

                                        {hasDetails ? (
                                            <>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 whitespace-pre-wrap">{messageParts[0]}</p>
                                                <div className="mt-2 bg-slate-100/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                                    <h4 className="font-bold text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Submitted Details</h4>
                                                    <ul className="space-y-1">
                                                        {messageParts[1].split('\n- ').filter(item => item.trim() !== '').map(item => {
                                                            const itemParts = item.split(': ');
                                                            const key = itemParts[0];
                                                            const value = itemParts.slice(1).join(': ');
                                                            return (
                                                                <li key={key} className="grid grid-cols-2 text-xs gap-x-2">
                                                                    <span className="text-slate-500 dark:text-slate-400 font-medium truncate" title={key}>{key}</span>
                                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate" title={value}>{value}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 whitespace-pre-wrap">{n.message}</p>
                                        )}
                                        
                                        {n.rejectionReason && (
                                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                                                <p className="text-xs font-bold text-red-800 dark:text-red-400">Rejection Comment:</p>
                                                <p className="text-xs text-red-700 dark:text-red-300/90 whitespace-pre-wrap mt-0.5">{n.rejectionReason}</p>
                                            </div>
                                        )}

                                        {n.adminReply && (
                                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                                <p className="text-xs font-bold text-blue-800 dark:text-blue-400">Admin Comment:</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300/90 whitespace-pre-wrap mt-0.5">{n.adminReply}</p>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-1.5 self-center flex-shrink-0">
                                        {!n.read && (
                                            <button 
                                                onClick={() => markUserNotificationAsRead(n.id)} 
                                                className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors" 
                                                title="Mark as read"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>


                            </div>
                        )})}
                    </div>
                 )}
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-5 sm:p-6 rounded-xl shadow-lg">
                <BackButton />

                {/* Acoustic Sound Center */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-4 rounded-lg mb-6 shadow-sm mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span>🔊 Order Sound Notification Center</span>
                                <span className="px-2 py-0.5 text-[10px] bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-full font-semibold">Enhanced Synthesizer</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                High-fidelity, custom-synthesized hardware-inspired sounds for order transactions.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {soundsActive ? 'On (Enabled)' : 'Off (Muted)'}
                            </span>
                            <button
                                onClick={toggleSounds}
                                type="button"
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                                    soundsActive ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        soundsActive ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Test Synthesized Alerts</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                                onClick={() => { playOrderPlacedSound(); }}
                                className="py-2 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                                title="Played when user places an order"
                            >
                                <span>🔔</span>
                                <span>Order Placed</span>
                            </button>
                            <button
                                onClick={() => { playAdminIncomingOrderSound(); }}
                                className="py-2 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                                title="Played on admin view for incoming alert"
                            >
                                <span>⚡</span>
                                <span>Admin Alert</span>
                            </button>
                            <button
                                onClick={() => { playOrderApprovedSound(); }}
                                className="py-2 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                                title="Played when admin approves an order"
                            >
                                <span>✅</span>
                                <span>Order Approved</span>
                            </button>

                        </div>
                    </div>
                </div>

                {isAdmin ? <AdminView /> : <UserView />}
            </div>
        </div>
    );
};

export default NotificationsPage;
