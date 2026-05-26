/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, ShoppingCart, History, LogOut, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'pos' | 'history' | 'sheets';
  setActiveTab: (tab: 'dashboard' | 'pos' | 'history' | 'sheets') => void;
  onLogout: () => void;
  cartCount: number;
}

export default function BottomNav({ activeTab, setActiveTab, onLogout, cartCount }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir', icon: ShoppingCart },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'sheets', label: 'Sheets', icon: Database }
  ] as const;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-100/80 px-2 py-1.5 flex items-center justify-between shadow-[0_-4px_24px_rgba(0,0,0,0.04)] md:hidden safe-bottom"
      id="mobile-bottom-nav"
    >
      <div className="flex w-full items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-16 text-center select-none cursor-pointer"
              id={`mobile-tab-${tab.id}`}
            >
              <div className="relative">
                <Icon 
                  className={`h-5 w-5 stroke-[1.8] transition-colors duration-200 ${
                    isActive ? 'text-sky-500' : 'text-slate-400'
                  }`} 
                />
                
                {/* Cart badge overlay for real-time item counts */}
                {tab.id === 'pos' && cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2.5 bg-sky-500 text-white font-mono text-[9px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full border border-white z-10"
                    id="mobile-cart-badge"
                  >
                    {cartCount}
                  </motion.div>
                )}
              </div>

              <span 
                className={`text-[10px] font-medium mt-1 transition-colors duration-200 ${
                  isActive ? 'text-sky-500 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Bouncy active tab highlight line */}
              {isActive && (
                <motion.div
                  layoutId="active-mobile-tab-pill"
                  className="absolute bottom-0 h-1 w-8 bg-sky-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}

        {/* Small Logout Button for Mobile Nav */}
        <button
          onClick={() => {
            if (confirm('Yakin ingin keluar dari sistem?')) {
              onLogout();
            }
          }}
          className="flex flex-col items-center justify-center py-1.5 px-3 min-w-16 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          id="mobile-logout-button"
        >
          <LogOut className="h-5 w-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium mt-1">Keluar</span>
        </button>
      </div>
    </nav>
  );
}
