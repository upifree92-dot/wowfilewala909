import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../types';
import { Search, X, Plus, Edit2, Trash2, ShieldCheck, Zap, Server, Smartphone, FolderCheck, Percent, Layers, CheckCircle } from 'lucide-react';

interface MasterServiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MasterServiceManagerModal: React.FC<MasterServiceManagerModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin, products, categories, createProduct, updateProduct, deleteProduct, setNotification } = useAppContext();

  const [activeTab, setActiveTab] = useState<'all' | 'imei' | 'remote' | 'server' | 'file'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bulkDealerDiscount, setBulkDealerDiscount] = useState<number>(10); // 10% discount default

  // New Service Form State inside 1 Button modal
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'imei' | 'remote' | 'server' | 'file'>('imei');
  const [newCatId, setNewCatId] = useState(categories[0]?.id || 'cat-imei');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newDealerPrice, setNewDealerPrice] = useState<number>(80);
  const [newDeliveryTime, setNewDeliveryTime] = useState('Instant');
  const [newDownloadLink, setNewDownloadLink] = useState('#');
  const [newDesc, setNewDesc] = useState('');

  // Editing Row State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  if (!isOpen || !isAdmin) return null;

  const getServiceType = (p: Product): 'imei' | 'remote' | 'server' | 'file' => {
    if (p.serviceType) return p.serviceType;
    const id = (p.id || '').toLowerCase();
    if (id.startsWith('imei-')) return 'imei';
    if (id.startsWith('remote-') || id.startsWith('tool-')) return 'remote';
    if (id.startsWith('file-') || id.startsWith('pkg-')) return 'file';
    return 'server';
  };

  const filteredProducts = products.filter(p => {
    const st = getServiceType(p);
    const matchType = activeTab === 'all' || st === activeTab;
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    return matchType && matchCat && matchQuery;
  });

  const handleStartEdit = (p: Product) => {
    setEditingServiceId(p.id);
    setEditForm({
      ...p,
      name: p.name || '',
      serviceType: p.serviceType || getServiceType(p),
      categoryId: p.categoryId || (categories.length > 0 ? categories[0].id : ''),
      price: p.price ?? 0,
      dealerPrice: p.dealerPrice ?? Math.round((p.price ?? 0) * 0.85),
      deliveryTime: p.deliveryTime || 'Instant',
      downloadLink: p.downloadLink || '#',
      description: p.description || '',
      size: p.size || 'Auto API',
      isActive: p.isActive !== false
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServiceId || !editForm.name) return;

    const original = products.find(p => p.id === editingServiceId);
    if (!original) return;

    const updated: Product = {
      ...original,
      ...editForm,
      price: Number(editForm.price || 0),
      dealerPrice: Number(editForm.dealerPrice || 0),
      name: editForm.name.trim(),
      serviceType: editForm.serviceType || original.serviceType || 'server',
      categoryId: editForm.categoryId || original.categoryId || (categories[0]?.id || 'cat-general'),
      downloadLink: editForm.downloadLink || '#',
      description: editForm.description || '',
      size: editForm.size || 'Auto API'
    };

    updateProduct(updated);
    setEditingServiceId(null);
    setEditForm({});
    setNotification(`Service "${updated.name}" updated successfully!`, 'success');
  };

  const handleQuickAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setNotification('Please enter a service name', 'error');
      return;
    }

    createProduct({
      name: newName.trim(),
      categoryId: newCatId || categories[0]?.id || 'cat-box-tools',
      serviceType: newType,
      price: Number(newPrice),
      dealerPrice: Number(newDealerPrice),
      deliveryTime: newDeliveryTime,
      downloadLink: newDownloadLink || '#',
      description: newDesc.trim() || `${newName.trim()} - Official ${newType.toUpperCase()} service`,
      size: newType === 'file' ? '100 MB' : 'Auto API',
      tags: ['paid', 'new']
    });

    setIsAddingNew(false);
    setNewName('');
    setNewDesc('');
    setNotification(`New ${newType.toUpperCase()} Service "${newName}" created successfully!`, 'success');
  };

  const handleApplyBulkDealerDiscount = () => {
    if (bulkDealerDiscount < 0 || bulkDealerDiscount > 90) return;
    let count = 0;
    filteredProducts.forEach(p => {
      const discountRatio = (100 - bulkDealerDiscount) / 100;
      const calculatedDealerPrice = Math.round(p.price * discountRatio);
      updateProduct({
        ...p,
        dealerPrice: calculatedDealerPrice
      });
      count++;
    });
    setNotification(`Applied ${bulkDealerDiscount}% Dealer Discount to ${count} services!`, 'success');
  };

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    setNotification(`Service "${name}" deleted!`, 'success');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-teal-500/40 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 px-5 py-4 border-b border-teal-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-extrabold text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                Master Service & Dealer Pricing Manager
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full uppercase font-mono">
                  1-Button Inside All
                </span>
              </h2>
              <p className="text-xs text-teal-200/80">
                Manage IMEI, Remote Tool Rent, Server & File Services + Dealer Rates in one place
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab & Controls Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Service Type Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'all' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('imei')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'imei' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 IMEI Service</span>
              </button>

              <button
                onClick={() => setActiveTab('remote')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'remote' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Rent Tool</span>
              </button>

              <button
                onClick={() => setActiveTab('server')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'server' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>🖥️ Server Service</span>
              </button>

              <button
                onClick={() => setActiveTab('file')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'file' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderCheck className="w-3.5 h-3.5" />
                <span>📁 File Service</span>
              </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNew ? 'Close Add Form' : '+ Quick Add Service'}</span>
            </button>
          </div>

          {/* Quick Add Form Drawer */}
          {isAddingNew && (
            <form onSubmit={handleQuickAddService} className="p-4 bg-slate-900 border border-amber-500/40 rounded-xl space-y-3 animate-fade-in">
              <h3 className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                ➕ Quick Add New Service / Tool
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold rounded-lg p-2 focus:outline-none"
                  >
                    <option value="imei">📱 IMEI Service</option>
                    <option value="remote">⚡ Rent Tool</option>
                    <option value="server">🖥️ Server Service</option>
                    <option value="file">📁 File Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. UnlockTool 6 Hours Rent..."
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Customer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setNewPrice(val);
                      setNewDealerPrice(Math.round(val * 0.85));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono font-bold rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dealer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newDealerPrice}
                    onChange={e => setNewDealerPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 text-xs font-mono font-bold rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Delivery Time</label>
                  <input
                    type="text"
                    value={newDeliveryTime}
                    onChange={e => setNewDeliveryTime(e.target.value)}
                    placeholder="Instant Auto API / 5-15 Mins"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={newCatId}
                    onChange={e => setNewCatId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-2 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-2 px-3 rounded-lg text-xs uppercase tracking-wider shadow cursor-pointer"
                  >
                    + Add To Catalog
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Search & Bulk Dealer Rates Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search services by name..."
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-teal-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Bulk Dealer Rate Setter */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Dealer Discount %:</span>
              <input
                type="number"
                min={0}
                max={90}
                value={bulkDealerDiscount}
                onChange={e => setBulkDealerDiscount(Number(e.target.value))}
                className="w-14 bg-slate-950 border border-slate-800 text-amber-400 font-bold font-mono px-2 py-1 rounded text-center"
              />
              <button
                type="button"
                onClick={handleApplyBulkDealerDiscount}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded font-bold transition-all cursor-pointer"
              >
                Apply To Tab
              </button>
            </div>
          </div>
        </div>

        {/* Services Table List */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-2.5">Service Name</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Customer Price</th>
                <th className="p-2.5">Dealer Price</th>
                <th className="p-2.5">Delivery Time</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(p => {
                const st = getServiceType(p);
                const isEditing = editingServiceId === p.id;
                const catName = categories.find(c => c.id === p.categoryId)?.name || 'General';

                if (isEditing) {
                  return (
                    <tr key={p.id} className="bg-teal-950/40 border-l-2 border-teal-500">
                      <td colSpan={7} className="p-4">
                        <form onSubmit={handleSaveEdit} className="space-y-3">
                          <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
                            ✏️ Editing Service: {p.name}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Title</label>
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                required
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-white font-bold rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Type</label>
                              <select
                                value={editForm.serviceType || 'server'}
                                onChange={e => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-amber-400 font-bold rounded-lg text-xs"
                              >
                                <option value="imei">📱 IMEI Service</option>
                                <option value="server">🖥️ Server Service</option>
                                <option value="remote">⚡ Remote Tool Rent</option>
                                <option value="file">📁 File Service</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                              <select
                                value={editForm.categoryId || ''}
                                onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Price (₹)</label>
                              <input
                                type="number"
                                value={editForm.price ?? 0}
                                onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                required
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dealer Price (₹)</label>
                              <input
                                type="number"
                                value={editForm.dealerPrice ?? 0}
                                onChange={e => setEditForm({ ...editForm, dealerPrice: Number(e.target.value) })}
                                required
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-amber-400 font-bold font-mono rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Delivery Time</label>
                              <input
                                type="text"
                                value={editForm.deliveryTime || ''}
                                onChange={e => setEditForm({ ...editForm, deliveryTime: e.target.value })}
                                required
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Size / Format</label>
                              <input
                                type="text"
                                value={editForm.size || ''}
                                onChange={e => setEditForm({ ...editForm, size: e.target.value })}
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Download / API Link</label>
                              <input
                                type="text"
                                value={editForm.downloadLink || ''}
                                onChange={e => setEditForm({ ...editForm, downloadLink: e.target.value })}
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                              <input
                                type="text"
                                value={editForm.description || ''}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingServiceId(null)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.dealerPrice !== undefined && p.dealerPrice < p.price && (
                          <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold rounded">
                            Dealer Discount
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{p.description}</div>
                    </td>

                    <td className="p-2.5">
                      {st === 'imei' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-bold">📱 IMEI</span>}
                      {st === 'remote' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">⚡ Rent Tool</span>}
                      {st === 'server' && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-bold">🖥️ Server</span>}
                      {st === 'file' && <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-bold">📁 File</span>}
                    </td>

                    <td className="p-2.5 text-slate-400 font-medium">{catName}</td>

                    <td className="p-2.5 font-extrabold text-emerald-400 font-mono">
                      ₹{p.price}
                    </td>

                    <td className="p-2.5 font-extrabold text-amber-400 font-mono">
                      ₹{p.dealerPrice ?? Math.round(p.price * 0.85)}
                    </td>

                    <td className="p-2.5 text-slate-300 font-mono text-[11px]">
                      {p.deliveryTime || 'Instant'}
                    </td>

                    <td className="p-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(p)}
                          className="bg-teal-500/15 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-2 py-1 rounded font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Showing {filteredProducts.length} of {products.length} services
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
          >
            Done / Close Manager
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default MasterServiceManagerModal;
