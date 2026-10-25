import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import CategoryCard from '../components/CategoryCard';
import ServiceListPanel from '../components/ServiceListPanel';
import { useSEO } from '../hooks/useSEO';

const ToolsPage = () => {
  useSEO('Service List & Tools', 'Browse all GSM services, IMEI services, server activations, RENT-24/7, and file services.');
  const { categories } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeServiceTab, setActiveServiceTab] = useState<string>('group');

  const filteredTopLevelCategories = categories
    .filter(c => !c.parentId)
    .filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Customer Service List View matching GSM Portal design */}
      <div className="max-w-2xl mx-auto">
        <ServiceListPanel
          activeServiceTab={activeServiceTab}
          onSelectServiceTab={(tabId) => setActiveServiceTab(tabId)}
        />
      </div>

      {/* All Service Groups & Categories */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-200">
            Service By Group &amp; File Categories
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-2">
            Browse all available GSM tools, server activations, and firmware categories.
          </p>
        </div>

        <div className="relative w-full sm:max-w-md mx-auto mb-8">
          <input
            type="search"
            placeholder="Search all categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {filteredTopLevelCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopLevelCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => { /* Editing is handled on HomePage */ }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No categories found for "{searchQuery}"</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
