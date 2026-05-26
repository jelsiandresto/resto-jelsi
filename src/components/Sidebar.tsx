/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, ShoppingCart, History, LogOut, User, Database } from 'lucide-react';
import { motion } from 'motion/react';
import RestaurantLogo from './RestaurantLogo';

interface SidebarProps {
  activeTab: 'dashboard' | 'pos' | 'history' | 'sheets';
  setActiveTab: (tab: 'dashboard' | 'pos' | 'history' | 'sheets') => void;
  onLogout: () => void;
  cashierName: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, cashierName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir POS', icon: ShoppingCart },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'sheets', label: 'Data Sheets', icon: Database }
  ] as const;

  return (
    <aside 
      className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 min-h-screen py-6 px-4 shrink-0 justify-between shadow-[2px_0_12px_rgba(0,0,0,0.01)]"
      id="desktop-sidebar"
    >
      <div className="space-y-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3 px-2" id="sidebar-logo-block">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10 border border-slate-800">
            <RestaurantLogo size={24} color="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-none">J's Resto</h2>
            <span className="text-[10px] font-semibold text-sky-500 uppercase tracking-widest leading-none mt-1 block">Premium POS</span>
          </div>
        </div>

        {/* Navigation block */}
        <nav className="space-y-1.5" id="sidebar-nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-sky-600 bg-sky-50/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/55'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                {/* Active highlight pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-pill"
                    className="absolute left-0 top-3 bottom-3 w-1.5 bg-sky-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 stroke-[1.8] ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer profiling and log out */}
      <div className="space-y-4" id="sidebar-footer-block">
        {/* Cashier Badge */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-2xl border border-slate-100/50">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold ${
            cashierName.toLowerCase() === 'admin' 
              ? 'bg-amber-50 text-amber-600 border border-amber-100' 
              : 'bg-sky-50 text-sky-600 border border-sky-100'
          }`}>
            {cashierName.toLowerCase() === 'admin' ? '👑' : '🤵'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate capitalize">
              {cashierName}
            </div>
            <div className="text-[9px] font-bold mt-0.5 text-slate-400 uppercase tracking-wider">
              {cashierName.toLowerCase() === 'admin' ? '🛡️ Administrator' : '💼 Petugas Kasir'}
            </div>
          </div>
        </div>

        {/* Log Out button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/40 rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer"
          id="sidebar-logout-button"
        >
          <LogOut className="h-5 w-5 stroke-[1.8] text-slate-400 btn-logout-icon" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
