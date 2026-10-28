
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import PricingPage from './pages/PricingPage';
import DownloadsPage from './pages/DownloadsPage';
import DownloadHistoryPage from './pages/DownloadHistoryPage';
import RecentPage from './pages/RecentPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Notification from './components/Notification';
import OrderSuccessModal from './components/OrderSuccessModal';
import ImportantNoticeModal from './components/ImportantNoticeModal';
import EditModal from './components/EditModal';
import WhatsAppButton from './components/WhatsAppButton';
import BackToTop from './components/BackToTop';
import NavItemEditModal from './components/NavItemEditModal';
import ToolsPage from './pages/ToolsPage';
import NotificationsPage from './pages/NotificationsPage';
import ImeiOrderPage from './pages/ImeiOrderPage';
import OurUsersPage from './pages/OurUsersPage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminSupabasePage from './pages/admin/AdminSupabasePage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import WebsitePage from './pages/WebsitePage';
import DirectDownloadPage from './pages/DirectDownloadPage';
import HostingraConnectorPage from './pages/admin/HostingraConnectorPage';
import AdminTokensPage from './pages/admin/AdminTokensPage';
import { TokenVerificationModal } from './components/TokenVerificationModal';
import TextColorEditor from './components/TextColorEditor';



const AppContent = () => {
  const { theme, siteContent } = useAppContext();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const themeColors = siteContent?.themeColors || {
    textColorLight: "#1e293b",
    textMutedLight: "#64748b",
    textColorDark: "#cbd5e1",
    textMutedDark: "#94a3b8",
    accentColor: "#f97316"
  };

  const dynamicStyles = (
    <style>{`
      :root {
        --site-text-light: ${themeColors.textColorLight || '#1e293b'};
        --site-text-muted-light: ${themeColors.textMutedLight || '#64748b'};
        --site-text-dark: ${themeColors.textColorDark || '#cbd5e1'};
        --site-text-muted-dark: ${themeColors.textMutedDark || '#94a3b8'};
        --site-accent: ${themeColors.accentColor || '#f97316'};
      }



      /* Light mode text color overrides (excluding admin portal and dark header/footer) */
      html:not(.dark) main .text-slate-800,
      html:not(.dark) main .text-slate-900,
      html:not(.dark) main .text-gray-800,
      html:not(.dark) main .text-gray-900 {
        color: var(--site-text-light);
      }

      html:not(.dark) main .text-slate-500,
      html:not(.dark) main .text-slate-600,
      html:not(.dark) main .text-gray-500,
      html:not(.dark) main .text-gray-600 {
        color: var(--site-text-muted-light);
      }

      /* Dark mode text color overrides */
      html.dark main .text-slate-100,
      html.dark main .text-slate-200,
      html.dark main .text-slate-300,
      html.dark main .text-gray-100,
      html.dark main .text-gray-200,
      html.dark main .text-gray-300 {
        color: var(--site-text-dark);
      }

      html.dark main .text-slate-400,
      html.dark main .text-slate-500,
      html.dark main .text-gray-400,
      html.dark main .text-gray-500 {
        color: var(--site-text-muted-dark);
      }

      /* Accent overrides */
      .text-orange-500, .text-cyan-400, .text-cyan-500, .text-amber-500 {
        color: var(--site-accent) !important;
      }
      .bg-orange-500, .bg-cyan-500, .bg-amber-500 {
        background-color: var(--site-accent) !important;
      }
      .border-orange-500, .border-cyan-500, .border-amber-500 {
        border-color: var(--site-accent) !important;
      }
    `}</style>
  );

  useEffect(() => {
    // If this window was opened as a google_login_popup, and we now have an active session, close it!
    if (window.opener && window.name === 'google_login_popup') {
      const checkAndClose = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("OAuth session detected inside popup, signaling opener and closing...");
          try {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
          } catch (e) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          }
          window.close();
        }
      };
      
      checkAndClose();
      // Listen for auth change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          checkAndClose();
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  if (isAdminRoute) {
    return (
       <div className="min-h-screen font-['Poppins',_sans-serif] bg-[#f4f6fa] text-slate-800 overflow-x-hidden">
        {dynamicStyles}
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="services" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="groups" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="invoices" element={<AdminOrdersPage />} />
            <Route path="inventory" element={<AdminProductsPage />} />
            <Route path="media" element={<AdminSettingsPage />} />
            <Route path="cms" element={<AdminSettingsPage />} />
            <Route path="automation" element={<HostingraConnectorPage />} />
            <Route path="utilities" element={<HostingraConnectorPage />} />
            <Route path="logs" element={<DashboardPage />} />
            <Route path="tokens" element={<AdminTokensPage />} />
            <Route path="token-keys" element={<AdminTokensPage />} />
            <Route path="theme" element={<Navigate to="/" replace />} />
            <Route path="hostinger" element={<HostingraConnectorPage />} />
            <Route path="hostingra" element={<HostingraConnectorPage />} />
            <Route path="supabase" element={<Navigate to="/admin/hostinger" replace />} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Routes>
        <Notification />
        <OrderSuccessModal />
        <TokenVerificationModal />
        <EditModal />
        <BackToTop />
        <TextColorEditor />
      </div>
    )
  }

  
  return (
    <div 
      className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col font-['Poppins',_sans-serif] ${theme === 'dark' ? 'dark bg-slate-900 text-slate-300' : 'bg-[#F0F2F5] text-slate-800'}`}
    >
      {dynamicStyles}
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/download-history" element={<DownloadHistoryPage />} />
          <Route path="/orders" element={<Navigate to="/profile?tab=orders" replace />} />
          <Route path="/order-history" element={<Navigate to="/profile?tab=orders" replace />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/our-users" element={<OurUsersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/imei-order" element={<ImeiOrderPage />} />
          <Route path="/appointment-booking" element={<AppointmentBookingPage />} />
          <Route path="/website" element={<WebsitePage />} />
          <Route path="/download-direct" element={<DirectDownloadPage />} />
        </Routes>
      </main>
      <Footer />
      <Notification />
      <OrderSuccessModal />
      <ImportantNoticeModal />
      <TokenVerificationModal />
      <EditModal />
      <WhatsAppButton />
      <BackToTop />
      <TextColorEditor />
    </div>
  );
};


function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}

export default App;