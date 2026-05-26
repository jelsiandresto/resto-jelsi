/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Check, AlertCircle } from 'lucide-react';
import RestaurantLogo from './RestaurantLogo';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'kasir' | 'admin'>('kasir');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-fill form values based on chosen role selector tab
  useEffect(() => {
    if (selectedRole === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('kasir');
      setPassword('kasir123');
    }
  }, [selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);

    // Simulate database network check for premium feel
    setTimeout(() => {
      const lowerUser = username.trim().toLowerCase();
      if (lowerUser === 'admin' && password === 'admin123') {
        setSuccess(true);
        setTimeout(() => {
          localStorage.setItem('js_resto_session', 'admin');
          onLoginSuccess('admin');
        }, 1200);
      } else if (lowerUser === 'kasir' && password === 'kasir123') {
        setSuccess(true);
        setTimeout(() => {
          localStorage.setItem('js_resto_session', 'kasir');
          onLoginSuccess('kasir');
        }, 1200);
      } else {
        setError('Username atau password tidak cocok!');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center p-4 bg-slate-50 overflow-hidden"
      id="login-page-container"
    >
      {/* Dynamic graphic background elements representing premium restaurant ambiance */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-100/50 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-sky-100/50 blur-3xl" />
      <div className="absolute top-1/2 left-3/4 w-72 h-72 rounded-full bg-blue-50/40 blur-3xl -translate-y-1/2" />
      
      {/* Decorative Food Elements / Background Aesthetic Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[radial-gradient(#0ea5e9_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-slate-100 p-8 shadow-card md:p-10"
        id="login-card"
      >
        <div className="flex flex-col items-center text-center">
          {/* Brand Identity */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white mb-4 shadow-lg shadow-slate-900/20 border border-slate-800"
            id="brand-logo-container"
          >
            <RestaurantLogo size={36} color="currentColor" />
          </motion.div>
          
          <h1 className="text-3xl font-bold tracking-tight text-slate-800" id="brand-title">
            J's Resto
          </h1>
          <p className="mt-2 text-sm text-slate-500" id="brand-tagline">
            Sistem Point of Sale Modern & Kasir Premium
          </p>
        </div>

        {/* User Role Selector Tab */}
        <div className="mt-6 space-y-3" id="role-selector-section">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            PILIH PERAN PENGGUNA (USER ROLE)
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
            {[
              { id: 'kasir', label: '🤵 Kasir Utama', desc: 'Kelola Transaksi' },
              { id: 'admin', label: '🛡️ Administrator', desc: 'Atur Menu & POS' }
            ].map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`py-2 px-1.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-white text-sky-600 shadow-md border border-slate-100 font-bold'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                  }`}
                  id={`role-btn-${role.id}`}
                >
                  <span className="text-xs">{role.label}</span>
                  <span className="text-[9px] text-slate-400 font-normal mt-0.5">{role.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Demo Credentials Hint based on selection */}
        <div className="mt-4 flex flex-col gap-1 rounded-2xl bg-sky-50/50 p-4 border border-sky-100/40 text-[13px] text-sky-700">
          <div className="font-semibold flex items-center gap-1.5 text-sky-800">
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            Detail Akun Demo ({selectedRole === 'admin' ? 'Admin' : 'Kasir'})
          </div>
          <div className="grid grid-cols-2 gap-x-2 mt-1 font-mono text-slate-600">
            <span>User: <strong className="text-sky-900">{selectedRole}</strong></span>
            <span>Pass: <strong className="text-sky-900">{selectedRole}123</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" id="login-form">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 border border-rose-100 text-sm text-rose-600"
                id="login-error-container"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[2]" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="h-4 w-4 stroke-[2]" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/35 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100/50"
                id="login-username-input"
                disabled={isLoading || success}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-4 w-4 stroke-[2]" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/35 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100/50"
                id="login-password-input"
                disabled={isLoading || success}
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || success}
            className={`relative w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white transition-all duration-300 shadow-md ${
              success 
                ? 'bg-emerald-500 shadow-emerald-200/50' 
                : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:opacity-95 shadow-sky-100/80 hover:shadow-sky-200/70'
            }`}
            id="login-submit-button"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Memproses...</span>
              </div>
            ) : success ? (
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5 stroke-[3]" />
                <span>Berhasil Masuk!</span>
              </motion.div>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Hak Cipta © {new Date().getFullYear()} J's Resto. Jaringan POS Kasir Terpercaya. <br/>Semua hak dilindungi undang-undang.
        </p>
      </motion.div>
    </div>
  );
}
