
import React from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const IconProducts = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4a1 1 0 001 1h10a1 1 0 100-2H5a1 1 0 00-1 1zM2 9a1 1 0 001 1h14a1 1 0 100-2H3a1 1 0 00-1 1zm1 4a1 1 0 100 2h14a1 1 0 100-2H3z" clipRule="evenodd" /></svg>;
const IconCategories = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const IconOrders = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const IconWebsite = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const IconSupabase = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3M3 12c0 1.657 3.134 3 7 3s7-1.343 7-3M3 12c0-1.657 3.134-3 7-3s7 1.343 7 3M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7M3 7c0 1.657 3.134 3 7 3s7-1.343 7-3M3 7c0-1.657 3.134-3 7-3s7 1.343 7 3" /></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const IconTools = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;


const IconNotifications = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;


const AdminLayout = () => {
    const { isAdmin, logout, user, getAdminNotifications } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (!isAdmin) {
            navigate('/login', { replace: true });
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) {
        return <div className="h-screen w-screen flex items-center justify-center">Access Denied</div>;
    }
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const unreadCount = getAdminNotifications().filter(n => !n.read).length;

    const navItems = [
        { to: "/admin", icon: <IconDashboard />, label: "Dashboard" },
        { to: "/admin/products", icon: <IconProducts />, label: "Products" },
        { to: "/admin/categories", icon: <IconCategories />, label: "Categories" },
        { to: "/admin/orders", icon: <IconOrders />, label: "Orders" },
        { to: "/notifications", icon: <IconNotifications />, label: "Order Notifications", badge: unreadCount },
        { to: "/admin/users", icon: <IconUsers />, label: "Users" },
        { to: "/admin/settings", icon: <IconSettings />, label: "Settings" },
        { to: "/admin/tools", icon: <IconTools />, label: "Advanced Tools" },
        { to: "/admin/hostinger", icon: <IconSupabase />, label: "Hostinger MySQL" },
        { to: "/", icon: <IconWebsite />, label: "View Website" },
    ];
    
    const pageTitle = React.useMemo(() => {
        const currentPath = location.pathname;
        const bestMatch = navItems
            .filter(item => currentPath.startsWith(item.to))
            .sort((a, b) => b.to.length - a.to.length)[0];
        return bestMatch ? bestMatch.label : "Admin";
    }, [location.pathname, navItems]);
    
    const baseLinkClass = "flex items-center px-4 py-3.5 transition-all duration-200 border-l-4";
    const activeLinkClass = "bg-gradient-to-r from-amber-500/15 to-orange-500/5 text-amber-400 border-amber-500 font-semibold shadow-sm";
    const inactiveLinkClass = "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100 border-transparent font-medium";

    return (
        <div className="admin-portal flex flex-col lg:flex-row min-h-screen bg-gray-50 text-slate-800">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-gray-200">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link to="/admin" className="flex items-center space-x-2.5">
                        <span className="text-lg font-bold text-slate-800">
                            GSM THEME
                        </span>
                    </Link>
                </div>
                <nav className="flex-grow mt-5 space-y-1 px-3">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.to}
                            to={item.to}
                            end={item.to === "/admin"}
                            className={({ isActive }) => 
                                `flex items-center px-4 py-3 rounded-lg transition-all ${
                                    isActive 
                                    ? "bg-red-50 text-red-600 font-semibold" 
                                    : "text-slate-600 hover:bg-gray-50"
                                }`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span className="text-sm tracking-wide flex-1">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white font-bold text-xs rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="search"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm w-64 focus:outline-none"
                            />
                            <svg className="w-5 h-5 absolute left-3 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                        <IconNotifications />
                        <IconSettings />
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                    </div>
                </header>


                {/* Mobile Navigation */}
                <nav className="lg:hidden flex items-center gap-1 overflow-x-auto px-2 py-2 bg-white border-b border-gray-200">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/admin"}
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                                    isActive
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 md:p-8 z-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;