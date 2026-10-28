import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { TokenKey } from '../../types';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Copy,
  Check,
  Trash2,
  Share2,
  Search,
  RefreshCw,
  Clock,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

const AdminTokensPage: React.FC = () => {
  const {
    tokenProtection,
    updateTokenProtection,
    tokenKeys,
    createTokenKey,
    updateTokenKey,
    deleteTokenKey,
    toggleTokenKeyStatus,
    tokenLogs,
    clearTokenLogs,
    siteContent,
    setNotification,
    setTokenVerificationModalOpen,
    setPendingDownloadProduct,
    products
  } = useAppContext();

  // Generator & Create form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [maxUses, setMaxUses] = useState<number>(1);
  const [expiryOption, setExpiryOption] = useState<'1d' | '6m' | '12m'>('1d');
  const [notes, setNotes] = useState('');

  // Master key editing state
  const [masterKeyInput, setMasterKeyInput] = useState(tokenProtection.masterKey || 'FLASH-WOW-9090');
  const [masterKeyEnabled, setMasterKeyEnabled] = useState(tokenProtection.masterKeyEnabled ?? true);
  const [adminWhatsapp, setAdminWhatsapp] = useState(
    tokenProtection.adminWhatsappForTokens || siteContent?.whatsapp?.phoneNumber || '8658465589'
  );
  const [promptMessage, setPromptMessage] = useState(
    tokenProtection.promptMessage || 'This flash file is protected. Please enter an authorized Token Key to proceed.'
  );

  // Table filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'exhausted' | 'expired'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FLASH-${part1}-${part2}`;
  };

  const handleOpenCreateModal = () => {
    setNewKey(generateRandomKey());
    setClientName('');
    setClientPhone('');
    setMaxUses(1);
    setExpiryOption('1d');
    setNotes('');
    setIsCreateModalOpen(true);
  };

  const handleCreateTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      setNotification('Please specify a Token Key code.', 'error');
      return;
    }

    let expiresAt: string | undefined = undefined;
    const now = Date.now();
    if (expiryOption === '1d') {
      expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    } else if (expiryOption === '6m') {
      expiresAt = new Date(now + 180 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expiryOption === '12m') {
      expiresAt = new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString();
    }


    createTokenKey({
      key: newKey.trim().toUpperCase(),
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      maxUses: Number(maxUses),
      expiresAt,
      isActive: true,
      notes: notes.trim() || undefined,
    });

    setNotification(`Token Key ${newKey.toUpperCase()} created successfully!`, 'success');
    setIsCreateModalOpen(false);
  };

  const handleSaveMasterSettings = async () => {
    await updateTokenProtection({
      masterKey: masterKeyInput.trim().toUpperCase(),
      masterKeyEnabled,
      adminWhatsappForTokens: adminWhatsapp.trim(),
      promptMessage: promptMessage.trim(),
    });
    setNotification('Master Token protection settings saved and synced!', 'success');
  };

  const handleToggleProtection = async (enabled: boolean) => {
    await updateTokenProtection({ enabled });
    setNotification(
      enabled
        ? '🔒 Flash File Token Key protection ENABLED! File downloads now require a Token Key.'
        : '🔓 Token Key protection DISABLED. Flash files can now be downloaded directly.',
      enabled ? 'success' : 'error'
    );
  };

  const handleCopyKey = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    setNotification(`Copied ${keyText} to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (token: TokenKey) => {
    const rawPhone = token.clientPhone?.replace(/[^0-9]/g, '') || '';
    const phoneParam = rawPhone ? rawPhone : '';
    const origin = window.location.origin;
    const expiryText = token.expiresAt ? `Valid until: ${new Date(token.expiresAt).toLocaleDateString()}` : 'Validity: Lifetime';
    const usesText = token.maxUses > 0 ? `Download Limit: ${token.maxUses} times` : 'Download Limit: Unlimited';

    const msg = encodeURIComponent(
      `Hello ${token.clientName || 'Customer'}!\n\nHere is your official Token Key to access and download flash files on ${siteContent?.header?.title || 'WowFileWala'}:\n\n🔑 Token Key: ${token.key}\n📊 ${usesText}\n⏰ ${expiryText}\n\nDownload files directly at: ${origin}\nEnter this key when prompted on the download page.\n\nThank you!`
    );

    window.open(`https://wa.me/${phoneParam}?text=${msg}`, '_blank');
  };

  const handleTestModal = () => {
    const sampleProduct = products[0] || {
      id: 'test-product',
      name: 'Sample Flash Firmware Tool.zip',
      price: 0,
      downloadLink: '#',
      description: 'Test firmware file',
      size: '1.2 GB'
    };
    setPendingDownloadProduct(sampleProduct);
    setTokenVerificationModalOpen(true);
  };

  // Filter token keys
  const filteredTokens = tokenKeys.filter((t) => {
    const matchesSearch =
      t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.clientName && t.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.clientPhone && t.clientPhone.includes(searchTerm));

    if (!matchesSearch) return false;

    const isExhausted = t.maxUses > 0 && t.usedCount >= t.maxUses;
    const isExpired = t.expiresAt && new Date(t.expiresAt).getTime() < Date.now();

    if (statusFilter === 'active') {
      return t.isActive && !isExhausted && !isExpired;
    }
    if (statusFilter === 'exhausted') {
      return isExhausted;
    }
    if (statusFilter === 'expired') {
      return isExpired;
    }
    return true;
  });

  const totalTokens = tokenKeys.length;
  const activeTokensCount = tokenKeys.filter(
    (t) => t.isActive && !(t.maxUses > 0 && t.usedCount >= t.maxUses) && !(t.expiresAt && new Date(t.expiresAt).getTime() < Date.now())
  ).length;
  const totalDownloadsLogged = tokenLogs.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-950 border border-neutral-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Flash File Security Gate
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  tokenProtection.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                    : 'bg-slate-700/40 text-slate-400 border-slate-700'
                }`}
              >
                {tokenProtection.enabled ? '● PROTECTION ACTIVE' : '○ PROTECTION DISABLED'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              Flash File Token Key Manager
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              When enabled, anyone downloading a flash file must enter an authorized Token Key. You can set a Master Key or issue custom keys for individual clients with limits and expiration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestModal}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all border border-neutral-700 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-amber-400" />
              Preview User Popup
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Create New Token Key
            </button>
          </div>
        </div>
      </div>

      {/* Main Switch Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protection Toggle Card */}
        <div className="lg:col-span-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                System Lock Status
              </span>
              {tokenProtection.enabled ? (
                <Lock className="w-5 h-5 text-emerald-500" />
              ) : (
                <Unlock className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
              Require Token Key to Download
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-6">
              When turned ON, nobody can access or download any flash file until they input a valid Token Key.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">
              {tokenProtection.enabled ? 'Lock is Active (Strict)' : 'Protection Turned Off'}
            </span>
            <button
              onClick={() => handleToggleProtection(!tokenProtection.enabled)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                tokenProtection.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  tokenProtection.enabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Master Universal Token Key Configuration */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Master Universal Token Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                This master key always unlocks any file without usage limits. Share it with your staff or VIPs.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={masterKeyEnabled}
                onChange={(e) => setMasterKeyEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              Enable Master Key
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Master Key Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={masterKeyInput}
                  onChange={(e) => setMasterKeyInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 font-mono text-xs font-bold tracking-wider text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. FLASH-WOW-9090"
                />
                <button
                  type="button"
                  onClick={() => handleCopyKey(masterKeyInput, 'master')}
                  className="px-3 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-neutral-700"
                  title="Copy Master Key"
                >
                  {copiedId === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                Admin WhatsApp for Token Requests
              </label>
              <input
                type="text"
                value={adminWhatsapp}
                onChange={(e) => setAdminWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. 8658465589"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
              Lock Notice Message (Shown to users before downloading)
            </label>
            <input
              type="text"
              value={promptMessage}
              onChange={(e) => setPromptMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              placeholder="Notice message for the verification dialog"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveMasterSettings}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
            >
              Save Master Token Settings
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
            Total Tokens
          </p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {totalTokens}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Active Tokens
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeTokensCount}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Downloads Unlocked
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalDownloadsLogged}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
            Protection Mode
          </p>
          <p
            className={`text-base font-black mt-1 flex items-center gap-1.5 ${
              tokenProtection.enabled ? 'text-emerald-500' : 'text-slate-400'
            }`}
          >
            {tokenProtection.enabled ? 'Strict Lock Active' : 'Public Download'}
          </p>
        </div>
      </div>

      {/* Tokens List Section */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Issued Token Keys
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-bold">
              {filteredTokens.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search key, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs font-bold text-slate-700 dark:text-neutral-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="exhausted">Limit Reached</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-950/60 border-b border-slate-100 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Token Key Code</th>
                <th className="py-3 px-4">Client / Assigned To</th>
                <th className="py-3 px-4">Usage & Limit</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-neutral-500">
                    <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                    <p className="font-bold text-sm">No Token Keys found</p>
                    <p className="text-xs mt-1">Create your first client Token Key using the button above.</p>
                  </td>
                </tr>
              ) : (
                filteredTokens.map((token) => {
                  const isExhausted = token.maxUses > 0 && token.usedCount >= token.maxUses;
                  const isExpired = token.expiresAt && new Date(token.expiresAt).getTime() < Date.now();
                  const isReady = token.isActive && !isExhausted && !isExpired;

                  return (
                    <tr
                      key={token.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg border border-amber-500/20 tracking-wider">
                            {token.key}
                          </span>
                          <button
                            onClick={() => handleCopyKey(token.key, token.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            title="Copy Key"
                          >
                            {copiedId === token.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-neutral-200">
                          {token.clientName || 'Unassigned / Generic'}
                        </div>
                        {token.clientPhone && (
                          <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {token.clientPhone}
                          </div>
                        )}
                        {token.notes && (
                          <div className="text-[10px] text-slate-400 dark:text-neutral-500 italic mt-0.5">
                            Note: {token.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800 dark:text-neutral-200">
                          {token.maxUses === 0 ? (
                            <span className="text-cyan-600 dark:text-cyan-400">
                              Unlimited ({token.usedCount} used)
                            </span>
                          ) : (
                            <span
                              className={
                                isExhausted
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }
                            >
                              {token.usedCount} / {token.maxUses} downloads used
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-neutral-300">
                        {token.expiresAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(token.expiresAt).toLocaleDateString()}</span>
                            {isExpired && (
                              <span className="text-[10px] text-rose-500 font-bold ml-1">
                                (Expired)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Lifetime
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        ) : isExhausted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            Limit Reached
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send WhatsApp */}
                          <button
                            onClick={() => handleShareWhatsApp(token)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => toggleTokenKeyStatus(token.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              token.isActive
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:bg-slate-200'
                            }`}
                            title={token.isActive ? 'Deactivate Key' : 'Activate Key'}
                          >
                            {token.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete token ${token.key}?`)) {
                                deleteTokenKey(token.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                            title="Delete Token Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download History & Token Usage Logs */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-500" />
              Token Download Activity Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Live record of flash files unlocked and downloaded using Token Keys.
            </p>
          </div>

          {tokenLogs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all token download history logs?')) {
                  clearTokenLogs();
                }
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
            >
              Clear Logs
            </button>
          )}
        </div>

        {tokenLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-neutral-500 text-xs">
            No download activities logged yet. As users enter Token Keys to download flash files, history will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-neutral-800 text-[10px] text-slate-400 uppercase font-bold">
                  <th className="py-2 px-3">Date & Time</th>
                  <th className="py-2 px-3">Token Key Used</th>
                  <th className="py-2 px-3">Downloaded File</th>
                  <th className="py-2 px-3">User / Identity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/50">
                {tokenLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-2.5 px-3 text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                      {new Date(log.downloadedAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {log.tokenKey}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white truncate max-w-xs">
                      {log.productName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-neutral-400">
                      {log.userEmail || 'Guest User'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE TOKEN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Generate New Token Key</h3>
                  <p className="text-xs text-amber-100">Create download access pass for a client</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTokenSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1 flex items-center justify-between">
                  <span>Token Key Code *</span>
                  <button
                    type="button"
                    onClick={() => setNewKey(generateRandomKey())}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Random
                  </button>
                </label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 font-mono font-bold tracking-wider text-sm text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. FLASH-9821-XK20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Client / Shop Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Vikram GSM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Client WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Maximum Allowed Downloads
                  </label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={1}>1 Download Only (Single Use)</option>
                    <option value={3}>3 Downloads</option>
                    <option value={5}>5 Downloads</option>
                    <option value={10}>10 Downloads</option>
                    <option value={0}>Unlimited Downloads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                    Token Expiration Period
                  </label>
                  <select
                    value={expiryOption}
                    onChange={(e) => setExpiryOption(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="1d">1 Day (24 Hours)</option>
                    <option value="6m">6 Months</option>
                    <option value="12m">12 Months (1 Year)</option>
                  </select>

                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1">
                  Private Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid ₹150 via PhonePe"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save & Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTokensPage;
