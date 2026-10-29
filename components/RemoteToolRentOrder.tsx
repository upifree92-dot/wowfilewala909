import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, X, CheckCircle2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export interface RemoteToolItem {
  id: string;
  name: string;
  category: string;
  price: number;
  deliveryTime: string;
  isNew: boolean;
  hasDiscount?: boolean;
}

export const REMOTE_RENTAL_TOOLS: RemoteToolItem[] = [
  {
    id: 'tool-360-6h',
    name: '360 Tool Rent [6 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 105,
    deliveryTime: '1-5 Instant',
    isNew: true,
  },
  {
    id: 'tool-amt-2h',
    name: 'Android Multi Tool Rent [2 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 33,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-awt-6h',
    name: 'AndroidWinTool-[AWT]-Rent [6 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 125,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-api-test',
    name: 'API Test Super Fast Service ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 0,
    deliveryTime: 'Instant',
    isNew: true,
    hasDiscount: true,
  },
  {
    id: 'tool-dft-48h',
    name: 'Dft Pro Tool Rent [48 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 161,
    deliveryTime: 'Instant',
    isNew: true,
  },
  {
    id: 'tool-eft-48h',
    name: 'EFT Pro Digital Login Rent [48 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 130,
    deliveryTime: '1-5 Instant',
    isNew: true,
  },
  {
    id: 'tool-galaxy-2h',
    name: 'Galaxy Multi Tool Rent [2 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 65,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-griffin-pack-5h',
    name: 'Griffin-Unlocker Tool Rent [With Premium Pack]-[5 Hours]-[Instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 168,
    deliveryTime: 'Instant',
    isNew: true,
  },
  {
    id: 'tool-griffin-prem-5h',
    name: 'Griffin-Unlocker Tool-[Premium Pack] Rent [5 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 161,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-hydra-3h',
    name: 'Hydra Tool Rent [Without Dongle]-[3 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 46,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-kgkiller-2h',
    name: 'Kg Killer Tool Rent [2 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 45.08,
    deliveryTime: '5-30 Miniutes',
    isNew: true,
  },
  {
    id: 'tool-mdmfix-6h',
    name: 'MDM Fix Tool Rent [6 Hours]-[Instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 100,
    deliveryTime: 'Instant',
    isNew: true,
  },
  {
    id: 'tool-mrst-2h',
    name: 'MRST Pro Rent [2 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 220,
    deliveryTime: '1-30 Minutes',
    isNew: true,
  },
  {
    id: 'tool-pandora-48h',
    name: 'Pandora Tool-[Digital] Rent [48 Hours]-[Instant-Auto API 24x7] New',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 862.5,
    deliveryTime: '1-30 Miniutes',
    isNew: true,
  },
  {
    id: 'tool-pandora-60d',
    name: 'Pandora Tool-[Digital] Rent [60 Days]-[Instant-Auto API 24x7] New',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 2200,
    deliveryTime: '1-30 Miniutes',
    isNew: true,
  },
  {
    id: 'tool-refund-free',
    name: 'Rent Tool Any Login Issues Refund Free Service ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 0,
    deliveryTime: 'Miniutes',
    isNew: true,
    hasDiscount: true,
  },
  {
    id: 'tool-samsung-12h',
    name: 'Samsungtool-[celltool.io] Rent [12 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 156,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-tfm-6h',
    name: 'TFM Tool Pro-[New] Rent [6 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 34.5,
    deliveryTime: 'Instant',
    isNew: false,
  },
  {
    id: 'tool-tsm-5h',
    name: 'TSM Pro Tool Rent [5 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 68.75,
    deliveryTime: 'Miniutes',
    isNew: true,
  },
  {
    id: 'tool-uat-2h',
    name: 'UAT Pro Tool Rent [2 Hours]-[Instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 35,
    deliveryTime: 'Instant',
    isNew: true,
  },
  {
    id: 'tool-unlocktool-6h',
    name: 'Unlocktool Rent [6 Hours]-[instant-Auto API 24x7] ✅',
    category: 'Rent Digital Tools Username&Password ✅',
    price: 40,
    deliveryTime: 'Instant',
    isNew: true,
  },
];

const RemoteToolRentOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user, products, placeImeiOrder, setNotification } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [discountedOnly, setDiscountedOnly] = useState(false);

  // Selected tool modal state
  const [activeModalTool, setActiveModalTool] = useState<RemoteToolItem | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [userNote, setUserNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge static list with Admin-updated/added Remote Tool Rent products from AppContext
  const liveRemoteTools = useMemo(() => {
    const productById = new Map<string, any>();
    const productByName = new Map<string, any>();
    (products || []).forEach((p) => {
      productById.set(p.id, p);
      productByName.set(p.name.trim().toLowerCase(), p);
    });

    const baseIds = new Set(REMOTE_RENTAL_TOOLS.map((t) => t.id));
    const baseNames = new Set(REMOTE_RENTAL_TOOLS.map((t) => t.name.trim().toLowerCase()));

    const updatedBase = REMOTE_RENTAL_TOOLS.map((tool) => {
      const match = productById.get(tool.id) || productByName.get(tool.name.trim().toLowerCase());
      if (match) {
        return {
          ...tool,
          name: match.name || tool.name,
          price: match.price ?? tool.price,
          deliveryTime: match.deliveryTime || tool.deliveryTime,
        };
      }
      return tool;
    });

    const customRemote: RemoteToolItem[] = (products || [])
      .filter((p) => p.serviceType === 'remote' && !baseIds.has(p.id) && !baseNames.has(p.name.trim().toLowerCase()))
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: 'Rent Digital Tools Username&Password ✅',
        price: p.price ?? 0,
        deliveryTime: p.deliveryTime || 'Instant',
        isNew: p.tags?.includes('new') ?? true,
      }));

    return [...customRemote, ...updatedBase];
  }, [products]);

  // Filter tools based on search, group, and discounted checkbox
  const filteredTools = useMemo(() => {
    return liveRemoteTools.filter((tool) => {
      // Group filter
      if (selectedGroup !== 'All' && tool.category !== selectedGroup) {
        return false;
      }
      // Discounted checkbox filter
      if (discountedOnly && !tool.hasDiscount && tool.price > 50) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = tool.name.toLowerCase().includes(query);
        const matchesCat = tool.category.toLowerCase().includes(query);
        const matchesTime = tool.deliveryTime.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesTime) {
          return false;
        }
      }
      return true;
    });
  }, [liveRemoteTools, searchQuery, selectedGroup, discountedOnly]);

  const handleOpenOrderModal = (tool: RemoteToolItem) => {
    setActiveModalTool(tool);
    setWhatsappNumber(user?.mobileNumber || '');
    setQuantity(1);
    setUserNote('');
  };

  const handleCloseModal = () => {
    setActiveModalTool(null);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTool) return;

    if (!user) {
      setNotification('Please login to place an order.', 'error');
      navigate('/login');
      return;
    }

    if (!whatsappNumber.trim()) {
      setNotification('Please enter your WhatsApp/Mobile number to receive tool credentials.', 'error');
      return;
    }

    const totalCost = activeModalTool.price * quantity;
    const currentBalance = user.wallet?.balance ?? 0;

    if (currentBalance < totalCost) {
      setNotification(`Insufficient wallet balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${currentBalance.toFixed(2)}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      placeImeiOrder({
        serviceName: activeModalTool.name,
        serviceId: activeModalTool.id,
        inputData: `WhatsApp: ${whatsappNumber.trim()}${userNote.trim() ? ` | Note: ${userNote.trim()}` : ''}`,
        quantity,
        price: activeModalTool.price,
        title: `Remote/ Tool-Rent - ${activeModalTool.name}`,
      });

      handleCloseModal();
    } catch (err: any) {
      setNotification(err?.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOrderPrice = (activeModalTool?.price || 0) * quantity;
  const userBalance = user?.wallet?.balance ?? 0;

  return (
    <div className="w-full">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Place A New Remote Order
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          <Link to="/" className="hover:text-amber-500 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            Place A New Remote Order
          </span>
          <span>/</span>
        </div>
      </div>

      {/* Filter Bar matching screenshot: All Group, Search Service..., Discounted */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
        {/* All Group dropdown */}
        <div className="w-full md:w-56 shrink-0">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
          >
            <option value="All">All Group</option>
            <option value="Rent Digital Tools Username&Password ✅">Rent Digital Tools Username&Password ✅</option>
          </select>
        </div>

        {/* Search Service... input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Service..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Discounted Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium shrink-0">
          <input
            type="checkbox"
            checked={discountedOnly}
            onChange={(e) => setDiscountedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
          />
          <span>Discounted</span>
        </label>
      </div>

      {/* Section Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Rent Digital Tools Username&Password</span>
          <span className="text-emerald-500">✅</span>
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {filteredTools.length} Available
        </span>
      </div>

      {/* Tools Grid matching screenshot */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No remote rental tools found.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing your search query or filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedGroup('All'); setDiscountedOnly(false); }}
            className="mt-3 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleOpenOrderModal(tool)}
              className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/70 dark:hover:border-amber-500/70 hover:shadow-md transition-all cursor-pointer relative select-none"
            >
              {/* Gray 'Re' Avatar Box */}
              <div className="w-11 h-11 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-base flex items-center justify-center shrink-0 tracking-tight shadow-inner mt-0.5">
                Re
              </div>

              {/* Tool info & Badges */}
              <div className="flex-1 min-w-0">
                {/* Title and New Badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-1 leading-snug">
                    {tool.name}
                  </h3>
                  {tool.isNew && (
                    <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0">
                      New
                    </span>
                  )}
                </div>

                {/* Subtitle / Category */}
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                  {tool.category}
                </p>

                {/* Bottom Row Badges: Price & Delivery Time */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#16a34a] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    ₹{tool.price}
                  </span>
                  <span className="bg-[#f59e0b] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {tool.deliveryTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Order Modal */}
      {activeModalTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-500 font-bold text-base flex items-center justify-center shrink-0">
                  Re
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    Rent Tool Order
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Instant Auto API 24x7 Delivery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmOrder} className="p-5 space-y-4">
              {/* Selected Tool Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {activeModalTool.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#16a34a] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    ₹{activeModalTool.price}
                  </span>
                  <span className="bg-[#f59e0b] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {activeModalTool.deliveryTime}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto font-mono">
                    Auto API 24x7
                  </span>
                </div>
              </div>

              {/* WhatsApp / Phone Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Your WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Enter 10-digit WhatsApp number (e.g. 9876543210)..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  ⚡ Tool rental Username & Password will be delivered to this WhatsApp number instantly.
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity (Slots / Hours)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 p-2.5 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Optional Note / AnyDesk ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  AnyDesk / TeamViewer ID or Note (Optional)
                </label>
                <input
                  type="text"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Optional AnyDesk ID or remarks..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Wallet and Total Cost Bar */}
              <div className="p-3.5 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Your Wallet Balance:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{userBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-xs uppercase font-bold text-slate-300">Total Order Price:</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    ₹{totalOrderPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Warning if insufficient balance */}
              {user && userBalance < totalOrderPrice && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2">
                  <span>Insufficient balance. Required: ₹{totalOrderPrice.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      navigate('/wallet');
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[11px] shrink-0 transition-colors"
                  >
                    Add Balance
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!!user && userBalance < totalOrderPrice)}
                  className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteToolRentOrder;
