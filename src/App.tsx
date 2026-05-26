/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { INITIAL_TRANSACTIONS, MENU_ITEMS } from './data';
import { MenuItem, Transaction, CartItem } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Pos from './components/Pos';
import History from './components/History';
import SheetsDatabase from './components/SheetsDatabase';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cashierName, setCashierName] = useState('admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'history' | 'sheets'>('dashboard');
  
  // Backing states synchronized with Client Storage
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Session verification & Data loading on mount
  useEffect(() => {
    // Check local credential session
    const session = localStorage.getItem('js_resto_session');
    if (session) {
      setIsLoggedIn(true);
      setCashierName(session);
    }

    // Load initial or local menu items
    const savedMenu = localStorage.getItem('js_resto_menu');
    if (savedMenu) {
      try {
        setMenuItems(JSON.parse(savedMenu));
      } catch (e) {
        setMenuItems(MENU_ITEMS);
      }
    } else {
      setMenuItems(MENU_ITEMS);
      localStorage.setItem('js_resto_menu', JSON.stringify(MENU_ITEMS));
    }

    // Load initial or local history logs
    const savedTxs = localStorage.getItem('js_resto_txs');
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch (e) {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('js_resto_txs', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    // Load persistent checkout drawer
    const savedCart = localStorage.getItem('js_resto_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // 2. Synchronize Cart Changes
  useEffect(() => {
    localStorage.setItem('js_resto_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. User operations
  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    setCashierName(username);
    setActiveTab('dashboard'); // Auto-redirect to dashboard upon login
  };

  const handleLogout = () => {
    localStorage.removeItem('js_resto_session');
    setIsLoggedIn(false);
    setCart([]); // Clear cart of active session
    setActiveTab('dashboard');
  };

  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [...transactions, newTx];
    setTransactions(updated);
    localStorage.setItem('js_resto_txs', JSON.stringify(updated));

    // Handle background auto-sync to Google Sheets Apps Script
    const sheetsUrl = localStorage.getItem('js_resto_sheets_url');
    const autoSyncToken = localStorage.getItem('js_resto_sheets_token') || '';
    const isAutoSyncEnabled = localStorage.getItem('js_resto_sheets_autosync') !== 'false';

    if (sheetsUrl && isAutoSyncEnabled) {
      fetch(sheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: 'addTransaction',
          token: autoSyncToken,
          transaction: newTx
        })
      })
        .then(res => res.json())
        .then(data => {
          const savedLogs = localStorage.getItem('js_resto_sheets_synclogs') || '[]';
          let logs = [];
          try { logs = JSON.parse(savedLogs); } catch(e) {}
          const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logs = [{ 
            time, 
            type: 'Auto-Sync Transaksi', 
            status: data.success ? 'success' : 'error', 
            message: data.success ? `Invoice #${newTx.invoiceNumber} terunggah otomatis.` : `Gagal: ${data.message}` 
          }, ...logs].slice(0, 50);
          localStorage.setItem('js_resto_sheets_synclogs', JSON.stringify(logs));
          
          // Dispatch storage event to alert rendered components to reload local logs
          window.dispatchEvent(new Event('storage'));
        })
        .catch(err => {
          const savedLogs = localStorage.getItem('js_resto_sheets_synclogs') || '[]';
          let logs = [];
          try { logs = JSON.parse(savedLogs); } catch(e) {}
          const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          logs = [{ 
            time, 
            type: 'Auto-Sync Transaksi', 
            status: 'error', 
            message: `Gagal otomatis: ${err.message}` 
          }, ...logs].slice(0, 50);
          localStorage.setItem('js_resto_sheets_synclogs', JSON.stringify(logs));
          window.dispatchEvent(new Event('storage'));
        });
    }
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    localStorage.setItem('js_resto_menu', JSON.stringify(updated));
  };

  const handleImportMenu = (importedItems: MenuItem[]) => {
    setMenuItems(importedItems);
    localStorage.setItem('js_resto_menu', JSON.stringify(importedItems));
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    const updated = menuItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    setMenuItems(updated);
    localStorage.setItem('js_resto_menu', JSON.stringify(updated));
    
    // Update matching items in cart to reflect new pricing/metadata
    setCart(prevCart => prevCart.map(c => c.menuId === updatedItem.id ? { ...c, price: updatedItem.price } : c));
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    localStorage.setItem('js_resto_menu', JSON.stringify(updated));
    
    // Evict deleted menu from the current active cart
    setCart(prevCart => prevCart.filter(c => c.menuId !== id));
  };

  // Compute total elements count for mobile cart badge
  const totalCartUnits = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Unauthenticated boundary check
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased" id="main-resto-pos-app">
      
      {/* 1. Left hand static navigation Sidebar for Desktop layout patterns */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        cashierName={cashierName}
      />

      {/* 2. Main content viewport area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative" id="main-viewport-pane">
        
        {/* Dynamic active screen router based on active tab state */}
        <div className="flex-1 h-full w-full overflow-hidden flex flex-col">
          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              menuItems={menuItems}
              onNavigateToPos={() => setActiveTab('pos')} 
            />
          )}

          {activeTab === 'pos' && (
            <Pos 
              menuItems={menuItems}
              onAddMenuItem={handleAddMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onAddTransaction={handleAddTransaction} 
              cart={cart} 
              setCart={setCart} 
              cashierName={cashierName}
            />
          )}

          {activeTab === 'history' && (
            <History 
              transactions={transactions} 
            />
          )}

          {activeTab === 'sheets' && (
            <SheetsDatabase 
              menuItems={menuItems}
              transactions={transactions}
              onImportMenu={handleImportMenu}
              cashierName={cashierName}
            />
          )}
        </div>

        {/* 3. Bottom Navigation bar for mobile viewports */}
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
          cartCount={totalCartUnits}
        />
        
      </main>
    </div>
  );
}
