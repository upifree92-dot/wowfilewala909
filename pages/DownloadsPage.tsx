
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import DownloadItem from '../components/DownloadItem';
import { TokenSubscriptionCard } from '../components/TokenSubscriptionCard';
import { useSEO } from '../hooks/useSEO';

const DownloadsPage = () => {
    useSEO('My Downloads', 'Access and download your purchased files.');
    const { user, products } = useAppContext();

    return (
        <div className="container mx-auto px-4 py-8">
             {!user ? (
                <div className="text-center p-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl shadow-lg">
                  <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">Access Denied</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">You must be logged in to view your purchased downloads.</p>
                  <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Login Now
                  </Link>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-xl shadow-lg">
                    <BackButton />
                    <h1 className="text-4xl font-bold mb-8 border-b-2 border-cyan-500 pb-4 text-slate-800 dark:text-slate-200">My Downloads</h1>
                    
                    {/* Active Token Plan Quota Card (Shows ONLY when Token Key is verified/active) */}
                    <TokenSubscriptionCard className="mb-6" />

                    
                    {(() => {
                        const purchasedProducts = products.filter(product => user?.purchasedProductIds.includes(product.id));
                        if (purchasedProducts.length === 0) {
                            return (
                                <div className="text-center p-10 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
                                    <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">No Downloads Yet</h2>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">You haven't purchased any products. Browse our store to get started!</p>
                                    <Link to="/" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                        Browse Products
                                    </Link>
                                </div>
                            );
                        }
                        return (
                            <div className="space-y-4">
                                {purchasedProducts.map(product => (
                                    <DownloadItem key={product.id} product={product} />
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default DownloadsPage;