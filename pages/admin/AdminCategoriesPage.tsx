import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Category } from '../../types';

const AdminCategoriesPage = () => {
  const { categories, createCategory, updateCategory, duplicateCategory, deleteCategory, notification } = useAppContext();
  
  // State for search and forms
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('folder');

  // Open modal for Create Folder
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParentId('');
    setImageUrl('folder');
    setIsModalOpen(true);
  };

  // Open modal for Edit Folder
  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setParentId(category.parentId || '');
    setImageUrl(category.imageUrl || 'folder');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Save changes
      updateCategory({
        ...editingCategory,
        name,
        description,
        parentId: parentId || undefined,
        imageUrl: imageUrl || 'folder'
      });
    } else {
      // Create new
      createCategory(name, description, parentId || undefined);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete folder "${category.name}" and all of its subfolders and files? This action cannot be undone.`)) {
      deleteCategory(category.id);
    }
  };

  const handleDuplicate = (category: Category) => {
    if (window.confirm(`Create a copy of folder "${category.name}" and all of its contents?`)) {
      duplicateCategory(category.id);
    }
  };

  // Helper to get parent category name
  const getParentName = (pId?: string) => {
    if (!pId) return <span className="text-gray-400 italic">None (Top-Level)</span>;
    const parent = categories.find(c => c.id === pId);
    return parent ? parent.name : <span className="text-red-400 italic">Unknown Folder</span>;
  };

  // Filtered categories
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-slate-100">Manage Folders & Categories</h2>
          <p className="text-xs text-slate-400 mt-1">Create, edit, duplicate, and delete directories across the catalog directory hierarchy.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10"
          id="btn-admin-new-folder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create New Folder
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="search"
            placeholder="Search folders by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 pl-10 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table of categories */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        {filteredCategories.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="font-semibold text-base text-slate-300">No folders found</p>
            <p className="text-xs text-slate-500 mt-1">Try search queries or click "Create New Folder" to build one.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="p-4">Folder Details</th>
                <th className="p-4">Parent Directory</th>
                <th className="p-4">Icon/Visuals</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredCategories.map(category => (
                <tr key={category.id} className="hover:bg-slate-900/30 transition-colors duration-150">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-amber-500 dark:text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-sm sm:text-base">{category.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-md" title={category.description}>
                          {category.description || '(No description)'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs sm:text-sm text-slate-300 font-medium">
                    {getParentName(category.parentId)}
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-400">
                    {category.imageUrl || 'folder'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDuplicate(category)}
                        className="p-2 bg-slate-950 border border-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm"
                        title="Duplicate/Copy Folder"
                        id={`btn-dup-${category.id}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2h-6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h1m-1-4h1m-1 4a2 2 0 012-2h1m-3 4V9a2 2 0 012-2h.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="p-2 bg-slate-950 border border-slate-800 text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm"
                        title="Edit Folder"
                        id={`btn-edit-${category.id}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm"
                        title="Delete Folder"
                        id={`btn-del-${category.id}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Polish form overlay / modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              {editingCategory ? 'Edit Folder Details' : 'Create New Folder'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-sm">Folder Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 dark:text-white text-sm"
                  placeholder="e.g. Samsung Files"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-sm">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-2.5 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 dark:text-white text-sm"
                  placeholder="Provide a detailed description of the contents..."
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-sm">Parent Folder (Select destination)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full p-2.5 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 dark:text-white text-sm"
                >
                  <option value="">None (Make Top-Level Folder)</option>
                  {categories
                    // Exclude the current category and its children to prevent circular references
                    .filter(c => !editingCategory || c.id !== editingCategory.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-sm">Custom Icon Key (e.g. folder, samsung, xiaomi)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 dark:text-white text-sm"
                  placeholder="e.g. folder"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
