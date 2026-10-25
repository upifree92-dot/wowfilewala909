
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useAppContext } from '../context/AppContext';
// FIX: Changed to a named import as FileListItem is not a default export.
import { FileListItem } from '../components/FileListItem';
import BackButton from '../components/BackButton';
import { useSEO } from '../hooks/useSEO';

const RecentPage = () => {
  useSEO('Recent Files', 'View your recently visited files.');
  const { products, user, anonymousRecents, siteContent } = useAppContext();

  const recentProductIds = user ? user.visitedProductIds : anonymousRecents;

  const recentFiles = recentProductIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
            <BackButton />
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-200">Recently Visited Files</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-3">Here are the files you've recently interacted with.</p>
            </div>
            
            {recentFiles.length > 0 ? (
                <div className="space-y-4">
                    {recentFiles.map(product => (
                        <FileListItem key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">No Recent Files</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">You haven't visited any files recently. Start browsing to see them here!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default RecentPage;