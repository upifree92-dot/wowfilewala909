

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import { useSEO } from '../hooks/useSEO';

const CartPage = () => {
  useSEO('Shopping Cart', 'Review and checkout your selected services.');
  const { cart, removeFromCart, checkout, user, notification } = useAppContext();
  const navigate = useNavigate();
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    if (checkout()) {
      navigate('/downloads');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
       {!user ? (
          <div className="text-center p-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">Please Log In</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">You need to be logged in to view your cart and check out.</p>
            <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Login Now
            </Link>
          </div>
        ) : (
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-xl shadow-lg">
          <BackButton />
          <h1 className="text-4xl font-bold mb-8 border-b-2 border-cyan-500 pb-4 text-slate-800 dark:text-slate-200">Shopping Cart</h1>
          {/* FIX: Render notification.message instead of the notification object */}
          {notification && <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 p-3 rounded-md mb-6">{notification.message}</div>}
          
          {cart.length === 0 ? (
            <div className="text-center p-10 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">Your Cart is Empty</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Browse our categories to find digital products to download.</p>
              <Link to="/" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Start Browsing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white/80 dark:bg-slate-700/80 p-4 rounded-lg flex justify-between items-center shadow-md">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{item.name}</h3>
                      <p className="text-cyan-600 dark:text-cyan-400 font-semibold">₹{item.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-200/50 dark:bg-slate-700/50 p-6 rounded-lg self-start">
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Order Summary</h2>
                <div className="space-y-2 mb-6 text-lg text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Your Balance:</span>
                    <span className="font-semibold">₹{user.wallet.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-semibold">
                    <span>Total Cost:</span>
                    <span>- ₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <hr className="border-slate-300 dark:border-slate-600 my-2" />
                  <div className="flex justify-between font-bold text-xl text-slate-800 dark:text-slate-100">
                    <span>Remaining:</span>
                    <span>₹{(user.wallet.balance - totalPrice).toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={user.wallet.balance < totalPrice}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-md"
                >
                  Pay from Wallet
                </button>
                {user.wallet.balance < totalPrice && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-300 text-left">
                      <div className="flex items-start gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="font-bold text-sm">Insufficient Balance</p>
                          <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                            You need ₹{(totalPrice - user.wallet.balance).toFixed(2)} more to purchase these files.
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate('/pricing', { state: { insufficientPoints: true, requiredAmount: totalPrice - user.wallet.balance } })}
                            className="mt-3 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <span>🪙 Add Points Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}
    </div>
  );
};

export default CartPage;