import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
    Gauge,
    ShoppingBag,
    Server,
    Layers,
    FileText,
    Briefcase,
    Image,
    Users,
    PenTool,
    RefreshCw,
    Box,
    Calendar,
    Settings,
    Info,
    ChevronRight,
    Bell,
    User,
    Eye,
    LogOut,
    Menu,
    X,
    ExternalLink
} from 'lucide-react';

const AdminLayout = () => {
    const { isAdmin, logout, getAdminNotifications } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    React.useEffect(() => {
        if (!isAdmin) {
            navigate('/login', { replace: true });
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) {
        return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Access Denied</div>;
    }

    const unreadCount = getAdminNotifications().filter(n => !n.read).length;

    // Exact menu items matching the photo from user
    const navItems = [
        { to: "/admin", icon: <Gauge className="w-4 h-4 shrink-0" />, label: "Dashboard", hasSubmenu: false, end: true },
        { to: "/admin/orders", icon: <ShoppingBag className="w-4 h-4 shrink-0" />, label: "Order History", hasSubmenu: true, badge: unreadCount > 0 ? unreadCount : undefined },
        { to: "/admin/services", icon: <Server className="w-4 h-4 shrink-0" />, label: "Services List", hasSubmenu: true },
        { to: "/admin/groups", icon: <Layers className="w-4 h-4 shrink-0" />, label: "Services Group", hasSubmenu: true },
        { to: "/admin/invoices", icon: <FileText className="w-4 h-4 shrink-0" />, label: "Invoice", hasSubmenu: false },
        { to: "/admin/inventory", icon: <Briefcase className="w-4 h-4 shrink-0" />, label: "Inventory", hasSubmenu: false },
        { to: "/admin/media", icon: <Image className="w-4 h-4 shrink-0" />, label: "Media Gallery", hasSubmenu: false },
        { to: "/admin/users", icon: <Users className="w-4 h-4 shrink-0" />, label: "User", hasSubmenu: true },
        { to: "/admin/cms", icon: <PenTool className="w-4 h-4 shrink-0" />, label: "CMS", hasSubmenu: true },
        { to: "/admin/automation", icon: <RefreshCw className="w-4 h-4 shrink-0" />, label: "Automation", hasSubmenu: true },
        { to: "/admin/utilities", icon: <Box className="w-4 h-4 shrink-0" />, label: "Utilities", hasSubmenu: true },
        { to: "/admin/logs", icon: <Calendar className="w-4 h-4 shrink-0" />, label: "Activity Log", hasSubmenu: true },
        { to: "/admin/settings", icon: <Settings className="w-4 h-4 shrink-0" />, label: "Settings", hasSubmenu: true },
        { to: "/admin/theme", icon: <Info className="w-4 h-4 shrink-0" />, label: "GSM Theme", hasSubmenu: false },
    ];

    return (
        <div className="flex h-screen bg-[#f4f6fa] text-slate-800 font-sans overflow-hidden">
            {/* Desktop Left Sidebar (Pure Black #000000 exactly matching photo) */}
            <aside className="hidden lg:flex flex-col w-64 bg-black text-white shrink-0 border-r border-neutral-900 select-none z-30">
                {/* Brand Logo & Version matching screenshot */}
                <div className="h-16 flex items-center px-4 border-b border-neutral-900 gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-white text-base shadow-inner">
                        G
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="text-sm font-extrabold text-white tracking-wide uppercase leading-tight">
                            GSM THEME
                        </h1>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            Version: 2027.63.0
                        </p>
                    </div>
                </div>

                {/* Sidebar Navigation Items List */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                    isActive
                                        ? "bg-[#242424] text-white shadow-xs"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-red-600 text-white font-black rounded-full min-w-4 text-center">
                                        {item.badge}
                                    </span>
                                )}
                                {item.hasSubmenu && (
                                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400" />
                                )}
                            </div>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
                    <div className="relative w-64 max-w-[80%] bg-black text-white flex flex-col h-full shadow-2xl z-50">
                        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-900">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-white text-base">
                                    G
                                </div>
                                <div>
                                    <h1 className="text-sm font-extrabold text-white tracking-wide uppercase">GSM THEME</h1>
                                    <p className="text-[10px] text-neutral-400 font-mono">Version: 2027.63.0</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-400 hover:text-white p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold ${
                                            isActive ? "bg-[#242424] text-white" : "text-neutral-400 hover:text-white"
                                        }`
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.hasSubmenu && <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Right Main Container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f6fa]">
                {/* Top Navbar Header (Matching screenshot exactly) */}
                <header className="h-16 bg-[#f4f6fa] border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-100"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Top Right 3 Dark Circular Buttons (Matches the photo) */}
                    <div className="flex items-center gap-2.5 ml-auto">
                        {/* 1. Camera / View Site circular icon button */}
                        <Link
                            to="/"
                            title="View Public Website"
                            className="w-9 h-9 rounded-full bg-[#24272c] hover:bg-[#34383f] text-white flex items-center justify-center transition-all shadow-xs"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>

                        {/* 2. Notification Bell circular icon button */}
                        <Link
                            to="/notifications"
                            title="Order Notifications"
                            className="relative w-9 h-9 rounded-full bg-[#24272c] hover:bg-[#34383f] text-white flex items-center justify-center transition-all shadow-xs"
                        >
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#f4f6fa] animate-pulse" />
                            )}
                        </Link>

                        {/* 3. User Avatar circular icon button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                title="Admin Profile & Logout"
                                className="w-9 h-9 rounded-full bg-[#24272c] hover:bg-[#34383f] text-white flex items-center justify-center transition-all shadow-xs"
                            >
                                <User className="w-4 h-4" />
                            </button>

                            {/* Dropdown menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-2 border-b border-slate-100">
                                        <p className="font-bold text-slate-900">Administrator</p>
                                        <p className="text-slate-400 text-[10px] truncate">Admin Panel</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setUserDropdownOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link
                                        to="/admin/settings"
                                        onClick={() => setUserDropdownOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" />
                                        <span>Site Settings</span>
                                    </Link>
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            logout();
                                            navigate('/');
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 w-full text-left font-semibold transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;