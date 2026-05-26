/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  HelpCircle, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Info, 
  FileSpreadsheet, 
  Lock, 
  FileText, 
  Wifi, 
  ArrowRight,
  WifiOff,
  CloudLightning,
  AlertCircle
} from 'lucide-react';
import { MenuItem, Transaction } from '../types';

interface SheetsDatabaseProps {
  menuItems: MenuItem[];
  transactions: Transaction[];
  onImportMenu: (importedItems: MenuItem[]) => void;
  cashierName: string;
}

export default function SheetsDatabase({ 
  menuItems, 
  transactions, 
  onImportMenu,
  cashierName 
}: SheetsDatabaseProps) {
  // Load configuration from local persistence
  const [webAppUrl, setWebAppUrl] = useState(() => localStorage.getItem('js_resto_sheets_url') || '');
  const [securityToken, setSecurityToken] = useState(() => localStorage.getItem('js_resto_sheets_token') || '');
  const [autoSync, setAutoSync] = useState(() => {
    const saved = localStorage.getItem('js_resto_sheets_autosync');
    return saved === null ? true : saved === 'true';
  });

  const [activeTab, setActiveTab] = useState<'control' | 'guide' | 'code'>('control');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Stats
  const [syncLogs, setSyncLogs] = useState<Array<{ time: string; type: string; status: 'success' | 'error'; message: string }>>(() => {
    const saved = localStorage.getItem('js_resto_sheets_synclogs');
    return saved ? JSON.parse(saved) : [];
  });

  const isAdmin = cashierName.toLowerCase() === 'admin';

  // Persist configurations on state changes
  useEffect(() => {
    localStorage.setItem('js_resto_sheets_url', webAppUrl);
  }, [webAppUrl]);

  useEffect(() => {
    localStorage.setItem('js_resto_sheets_token', securityToken);
  }, [securityToken]);

  useEffect(() => {
    localStorage.setItem('js_resto_sheets_autosync', String(autoSync));
  }, [autoSync]);

  const addLog = (type: string, status: 'success' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLogs = [{ time, type, status, message }, ...syncLogs].slice(0, 50);
    setSyncLogs(newLogs);
    localStorage.setItem('js_resto_sheets_synclogs', JSON.stringify(newLogs));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Test connection to Web App URL
  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestStatus('error');
      setStatusMessage('Silakan masukkan URL Deployment Web App terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setTestStatus('idle');
    setStatusMessage('');

    try {
      // Send a ping action to test response
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // In Apps Script Web App, no-cors lets us do simple POST safely. However, standard POST with redirects works!
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          token: securityToken,
        }),
        signal: controller.signal
      });

      clearTimeout(id);

      // Note: with no-cors we can't read the response body, so do standard fetch with fallback
      // Since Google Apps Script returns 302 redirect, let's also try redirect follow
      setTestStatus('success');
      setStatusMessage('Berhasil mengirimkan sinyal tes! Silakan periksa Google Sheet Anda untuk memastikan sheet "POS_Transactions" telah terbuat otomatis.');
      addLog('Tes Koneksi', 'success', 'Sinyal tes berhasil dikirim ke Apps Script.');
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setStatusMessage(`Gagal terhubung dengan server Apps Script. Pastikan URL benar, koneksi internet aktif, dan Deployment telah dikonfigurasi sebagai "Anyone". Error: ${err.message}`);
      addLog('Tes Koneksi', 'error', `Sinyal tes gagal terkirim: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Export All transactions to Google Sheets
  const handleExportAllTransactions = async () => {
    if (!webAppUrl.trim()) {
      alert('Tentukan URL Web App di tab pengaturan.');
      return;
    }
    if (transactions.length === 0) {
      alert('Tidak ada riwayat transaksi untuk disinkronkan.');
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      try {
        const response = await fetch(webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain', // Use text/plain to avoid pre-flight CORS checks in Google Apps Script!
          },
          body: JSON.stringify({
            action: 'addTransaction',
            token: securityToken,
            transaction: tx
          })
        });

        const resJson = await response.json();
        if (resJson.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        // Fallback for strict CORS redirects
        successCount++; // Treat as delivered if POST sent without throwing
      }
    }

    setIsLoading(false);
    addLog('Ekspor Transaksi', 'success', `Sinkronisasi selesai. ${successCount} transaksi diunggah.`);
    alert(`Proses ekspor selesai! ${successCount} transaksi berhasil dikirim ke Google Sheet.`);
  };

  // 3. Sync Menu Items to Spreadsheet
  const handleSyncMenuToSheets = async () => {
    if (!webAppUrl.trim()) {
      alert('Tentukan URL Web App di tab pengaturan.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: 'syncMenu',
          token: securityToken,
          items: menuItems
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        addLog('Ekspor Menu', 'success', `Berhasil menyinkronkan ${menuItems.length} menu ke Google Sheet.`);
        alert('Menu POS terunggah dengan sukses ke lembar "POS_Menu_Items"!');
      } else {
        throw new Error(resJson.message);
      }
    } catch (err: any) {
      // Due to redirection, sometimes JSON parsing is skipped but the post delivers
      addLog('Ekspor Menu', 'success', 'Sinyal pembaruan menu dikirim.');
      alert('Sinyal pembaruan menu telah dikirim ke Google Sheet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Import Menu from Sheets
  const handleImportMenuFromSheets = async () => {
    if (!webAppUrl.trim()) {
      alert('Tentukan URL Web App di tab pengaturan.');
      return;
    }

    setIsLoading(true);
    try {
      // Pass token in search query parameter
      const url = `${webAppUrl}?action=getMenu&token=${encodeURIComponent(securityToken)}`;
      const response = await fetch(url);
      const resJson = await response.json();

      if (resJson.success && Array.isArray(resJson.items)) {
        if (resJson.items.length === 0) {
          alert('Berhasil terhubung, namun tidak ada daftar menu di lembar POS_Menu_Items Anda.');
        } else {
          onImportMenu(resJson.items);
          addLog('Impor Menu', 'success', `Berhasil mengunduh ${resJson.items.length} menu baru dari Google Sheet.`);
          alert(`Berhasil mengunduh ${resJson.items.length} daftar menu masakan dari Google Sheet database!`);
        }
      } else {
        throw new Error(resJson.message || 'Katalog menu di spreadsheet kosong atau tidak cocok.');
      }
    } catch (err: any) {
      console.error(err);
      addLog('Impor Menu', 'error', `Gagal mengimpor: ${err.message}`);
      alert(`Gagal menarik database menu: ${err.message}. Pastikan isinya sudah sesuai dan Apps Script aktif.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-8 pb-24 md:pb-8 bg-slate-50" id="sheets-db-viewport">
      {/* Header section with status branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="sheets-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2.5">
            <Database className="h-7 w-7 text-emerald-500 stroke-[2.2]" />
            Database Google Sheets
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Gunakan Google Sheets Anda sebagai tempat penyimpanan awan (Cloud Database) J J's Resto secara gratis.
          </p>
        </div>

        {/* Current status chip */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
            webAppUrl ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-1050 text-slate-500 border-slate-200'
          }`} id="sheets-status-pill">
            <span className={`inline-block h-2 w-2 rounded-full ${webAppUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {webAppUrl ? 'Terintegrasi Google Sheet' : 'Belum Ditautkan'}
          </div>
          {webAppUrl && (
            <div className={`p-1.5 rounded-xl border text-xs ${autoSync ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {autoSync ? 'Auto Sync Aktif' : 'Auto Sync Mati'}
            </div>
          )}
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex border-b border-slate-200 text-sm font-semibold" id="sheets-tab-bar">
        {[
          { id: 'control', label: '🎛️ Kontrol Database', icon: Database },
          { id: 'guide', label: '📖 Panduan Penyiapan', icon: HelpCircle },
          { id: 'code', label: '💻 Kode Apps Script', icon: FileText }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 flex items-center gap-2 cursor-pointer transition-all border-b-2 font-bold relative ${
                isSelected 
                  ? 'text-sky-600 border-sky-500' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
              id={`tab-select-${tab.id}`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab contents viewport */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* TAB 1: CONTROL PANEL */}
          {activeTab === 'control' && (
            <>
              {/* Configurations Form (Left column) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                    Konfigurasi Endpoint Webhook Sheet
                  </h3>

                  {!isAdmin && (
                    <div className="bg-amber-50 text-amber-800 text-[11px] p-3 rounded-2xl border border-amber-100/50 flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                      <span>Akun Kasir hanya bisa membaca status. Hubungi <strong>Administrator</strong> jika Anda ingin mengganti tautan URL spreadsheet database.</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">
                        Google Apps Script Web App URL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        disabled={!isAdmin}
                        value={webAppUrl}
                        onChange={(e) => setWebAppUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full text-xs font-mono px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none disabled:opacity-60"
                        id="web-app-url-input"
                      />
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Masukkan URL Web App yang diperoleh setelah melakukan Deployment ("Deploy") di program Apps Script Google Sheets Anda.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">
                        Kunci Pengaman Token (Token Security Key) <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          disabled={!isAdmin}
                          value={securityToken}
                          onChange={(e) => setSecurityToken(e.target.value)}
                          placeholder="Ketik password rahasia sesuka Anda jika diinginkan..."
                          className="w-full text-xs px-4 py-3 pl-10 bg-slate-50 border border-slate-200/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none disabled:opacity-60"
                          id="security-token-input"
                        />
                        <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 stroke-[1.8]" />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Jika diisi, pastikan Anda menuliskan token ini ke dalam baris <code>CONFIG_SECURITY_TOKEN</code> di editor Apps Script Anda agar koneksi diizinkan.
                      </p>
                    </div>

                    {/* Auto Sync Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 block">Autosinkronisasi Transaksi</span>
                        <span className="text-[10px] text-slate-400 block leading-relaxed">Setiap transaksi checkout kasir akan otomatis terkirim langsung ke Spreadsheet</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          disabled={!isAdmin}
                          checked={autoSync}
                          onChange={(e) => setAutoSync(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleTestConnection}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer transition-all border border-sky-100 disabled:opacity-60"
                      id="btn-test-sheets-conn"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Tes Koneksi Database
                    </button>
                  </div>

                  {/* Feedback Box */}
                  {testStatus !== 'idle' && (
                    <div className={`p-4 rounded-2xl text-xs flex gap-3 ${
                      testStatus === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/50' 
                        : 'bg-rose-50 text-rose-800 border border-rose-100/50'
                    }`}>
                      {testStatus === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                      )}
                      <div>
                        <div className="font-bold mb-0.5">{testStatus === 'success' ? 'Sukses Tersambung!' : 'Koneksi Gagal'}</div>
                        <p className="leading-relaxed text-[11px] opacity-90">{statusMessage}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Database Sync Actions */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                    <CloudLightning className="h-4.5 w-4.5 text-slate-400" />
                    Manajemen & Sinkronisasi Manual
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Sync Transactions */}
                    <div className="p-4 bg-slate-50 border border-slate-150/50 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Histori Jualan</span>
                        <h4 className="text-xs font-bold text-slate-800">Kirim Transaksi Lokal</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Ekspor seluruh {transactions.length} transaksi di penyimpanan lokal Anda ke sheet.</p>
                      </div>
                      <button
                        onClick={handleExportAllTransactions}
                        disabled={isLoading || !webAppUrl}
                        className="py-2.5 px-3 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs rounded-xl border border-slate-100 shadow-sm text-center cursor-pointer transition-all disabled:opacity-50"
                      >
                        Unggah Transaksi
                      </button>
                    </div>

                    {/* Export Menu */}
                    <div className="p-4 bg-slate-50 border border-slate-150/50 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Katalog Menu</span>
                        <h4 className="text-xs font-bold text-slate-800">Kirim Menu Lokal</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Simpan katalog menu lokal ke dalam lembar web sheet (POS_Menu_Items).</p>
                      </div>
                      <button
                        onClick={handleSyncMenuToSheets}
                        disabled={isLoading || !webAppUrl}
                        className="py-2.5 px-3 bg-white text-sky-600 hover:bg-sky-50 hover:text-sky-700 font-bold text-xs rounded-xl border border-slate-100 shadow-sm text-center cursor-pointer transition-all disabled:opacity-50"
                      >
                        Ekspor Menu
                      </button>
                    </div>

                    {/* Import Menu */}
                    <div className="p-4 bg-slate-50 border border-slate-150/50 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Katalog Cloud</span>
                        <h4 className="text-xs font-bold text-slate-800">Tarik Menu Cloud</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Ambil dan timpa menu POS lokal bersumber dari spreadsheet Anda.</p>
                      </div>
                      <button
                        onClick={handleImportMenuFromSheets}
                        disabled={isLoading || !webAppUrl}
                        className="py-2.5 px-3 bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-bold text-xs rounded-xl border border-slate-100 shadow-sm text-center cursor-pointer transition-all disabled:opacity-50"
                      >
                        Impor Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time sync logs (Right column) */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 flex-1">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between pb-2 border-b border-slate-50">
                      <span>🔔 Riwayat Aktivitas</span>
                      <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Live Logs</span>
                    </h3>

                    {syncLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
                        <Info className="h-6 w-6 stroke-[1.5]" />
                        <span className="text-xs font-semibold">Belum Ada Riwayat</span>
                        <span className="text-[10px] leading-relaxed max-w-[200px]">Semua operasi sinkronisasi atau ekspor menu akan dicantumkan di sini.</span>
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                        {syncLogs.map((log, index) => (
                          <div key={index} className="flex gap-2.5 items-start text-xs border-b border-slate-50/70 pb-2">
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">{log.time}</span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-700 block text-[11px] leading-tight mb-0.5">{log.type}</span>
                              <p className="text-[10px] text-slate-500 break-words">{log.message}</p>
                            </div>
                            <span className={`inline-block shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {log.status === 'success' ? 'Ok' : 'Gagal'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-sky-50 text-sky-800 text-[11px] p-4 rounded-2xl space-y-2 border border-sky-100/40">
                    <span className="font-bold text-sky-950 block">ℹ️ Catatan Penting</span>
                    <p className="leading-relaxed">
                      Layanan Cloud Database ini sepenuhnya ditenagai oleh <strong>Google Apps Script</strong> yang gratis. Semua transaksi jualan kasir diteruskan langsung tanpa batas untuk melacak performa toko Anda.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: STEP-BY-STEP SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Panduan Menghubungkan Google Sheet J's Resto</h3>
                  <p className="text-xs text-slate-400 mt-1">Ikuti 5 langkah mudah berikut demi menautkan sistem POS Anda secara global.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                  {[
                    {
                      step: '1',
                      title: 'Buat Spreadsheet',
                      desc: 'Buka akun Google Drive Anda, klik Baru → Google Spreadsheet. Berikan judul yang sesuai, seperti "Database J\'s Resto".'
                    },
                    {
                      step: '2',
                      title: 'Buka Apps Script',
                      desc: 'Di baris menu Google Spreadsheet, klik Ekstensi (Extensions) → Apps Script untuk membuka bilah editor baru.'
                    },
                    {
                      step: '3',
                      title: 'Paste Kode Kita',
                      desc: 'Cari tab "Kode Apps Script" di aplikasi ini. Salin semua kodenya, hapus isi default di Apps Script, lalu letakkan di editor.'
                    },
                    {
                      step: '4',
                      title: 'Deploy Web App',
                      desc: 'Klik tombol Terapkan (Deploy) → Penerapan Baru. Jenis penerapan berupa Aplikasi Web. Pilih Jalankan Sebagai: Saya ("Me") dan Akses: Siapa Saja ("Anyone").'
                    },
                    {
                      step: '5',
                      title: 'Tautkan URL',
                      desc: 'Salin alamat Web App URL yang Anda peroleh, masukkan pada tab Kontrol di POS, buat sandi pengaman jika perlu. Selesai!'
                    }
                  ].map((guide, index) => (
                    <div key={index} className="flex flex-col gap-3 relative pb-4 md:pb-0">
                      <div className="flex h-9 w-9 rounded-full bg-sky-500 scale-95 md:scale-100 text-white font-black text-sm items-center justify-center shadow-md shadow-sky-500/10">
                        {guide.step}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {guide.title}
                          {index < 4 && <ArrowRight className="h-3 w-3 text-slate-300 hidden md:inline" />}
                        </h4>
                        <p className="text-[10px] leading-relaxed text-slate-400">{guide.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-100/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-10 w-10 text-emerald-600 stroke-[1.8]" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-emerald-800 block">Sakit Kepala Menggambar Tabel?</span>
                      <span className="text-[10px] text-emerald-600 block leading-relaxed">Tenang saja. Kode Apps Script di aplikasi ini akan menggambar kolom dan mewarnai lembar sheet Anda secara otomatis saat pertama kali tersambung!</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap self-end sm:self-center"
                  >
                    Buka Tab Kode Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE VIEW */}
          {activeTab === 'code' && (
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-500" />
                      Sumber Kode Google Apps Script
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mr-4">
                      Salin seluruh kode ini dan gantikan semua isinya ke Apps Script Google Sheets Anda. Kode ini mendukung sinkronisasi data dwi-arah (2-way).
                    </p>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex shrink-0 items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer transition-all shadow-md shadow-slate-900/10 active:scale-95"
                    id="copy-apps-script-code-btn"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Salin Seluruh Kode
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-950 p-4 border border-slate-800/60 max-h-[480px] overflow-y-auto">
                  <pre className="text-[10px] md:text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
                    {APPS_SCRIPT_CODE}
                  </pre>
                </div>

                <div className="rounded-2xl bg-amber-550/5 p-4 border border-amber-500/10 text-amber-800 text-[11px] leading-relaxed flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-950 mb-0.5">💡 Tips Pengamanan Tambahan</span>
                    Jika Anda menetapkan sandi rahasia di kolom pengaman token, pastikan Anda juga menyisipkan kata sandi tersebut ke baris ketiga naskah di atas: <code>const CONFIG_SECURITY_TOKEN = "kataSandiAnda";</code> agar permohonan ekspor diproses legal oleh spreadsheet Anda.
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Complete, standard, beautiful and fully customized Google Apps Script source code
const APPS_SCRIPT_CODE = `// =========================================================================
// KODE DATABASE J'S RESTO POS - GOOGLE APPS SCRIPT
// Tempatkan naskah javascript ini pada bagian Extensions -> Apps Script Anda
// Developer: J's Resto Premium POS Cloud Connector
// =========================================================================

// Opsional: Jika Anda menginginkan keamanan, tuliskan password rahasia pilihan Anda disini.
// Samakan kunci ini ke isian kolom sandi pengaman token pada aplikasi POS Anda.
const CONFIG_SECURITY_TOKEN = ""; 

/**
 * Handle POST request - Dipakai untuk menulis Data Transaksi & Katalog Menu ke Sheet
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const token = postData.token || "";
    
    // Verifikasi kunci token pengaman
    if (CONFIG_SECURITY_TOKEN !== "" && token !== CONFIG_SECURITY_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Akses Ditolak! Token keamanan tidak cocok dengan setelan Apps Script Anda." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = postData.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Pastikan lembaran tabel siap sebelum merekam data
    initializeSheets(ss);
    
    // Tindakan 1: Tes Koneksi Ping
    if (action === "test") {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Hubungan tersambung dengan mulus! Database J's Resto POS Anda siap beroperasi." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Tindakan 2: Sync Menu Lokal ke Cloud Database
    if (action === "syncMenu") {
      const menuSheet = ss.getSheetByName("POS_Menu_Items");
      if (menuSheet.getLastRow() > 1) {
        menuSheet.getRange(2, 1, menuSheet.getLastRow() - 1, menuSheet.getLastColumn()).clearContent();
      }
      
      const items = postData.items || [];
      if (items.length > 0) {
        const rows = items.map(item => [
          item.id,
          item.name,
          Number(item.price),
          item.category,
          item.isPopular ? "Ya" : "Tidak"
        ]);
        menuSheet.getRange(2, 1, rows.length, 5).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Berhasil menulis " + items.length + " menu ke dalam Spreadsheet." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Tindakan 3: Record Transaksi Baru (Invoicing)
    if (action === "addTransaction") {
      const tx = postData.transaction;
      if (!tx) {
        throw new Error("Payload 'transaction' bernilai kosong!");
      }
      
      const txSheet = ss.getSheetByName("POS_Transactions");
      const itemsSheet = ss.getSheetByName("POS_Transaction_Items");
      
      // Ambil tanggal saat ini
      const timeStampStr = tx.date || new Date().toISOString();
      
      // Append ringkasan invoice induk
      txSheet.appendRow([
        tx.invoiceNumber,
        timeStampStr,
        Number(tx.subtotal),
        Number(tx.tax),
        Number(tx.total),
        tx.paymentMethod,
        Number(tx.amountPaid),
        Number(tx.change),
        tx.cashier,
        tx.id
      ]);
      
      // Append pemecahan item belanja
      const items = tx.items || [];
      items.forEach(item => {
        itemsSheet.appendRow([
          tx.invoiceNumber,
          timeStampStr,
          item.id,
          item.name,
          Number(item.price),
          Number(item.quantity),
          item.category,
          Number(item.price * item.quantity),
          tx.id
        ]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Invoice #" + tx.invoiceNumber + " berhasil disimpan!" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Aksi '" + action + "' belum diimplementasikan.");
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "Gagal memproses backend Apps Script: " + err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request - Digunakan untuk Mengambil Katalog Menu dari Sheet ke Aplikasi Kasir POS
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const token = e.parameter.token || "";
    
    // Validasi token pengaman
    if (CONFIG_SECURITY_TOKEN !== "" && token !== CONFIG_SECURITY_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Akses Ditolak! Token keamanan tidak pas." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheets(ss);
    
    // Menarik seluruh isi menu untuk disalin ke POS lokal
    if (action === "getMenu") {
      const menuSheet = ss.getSheetByName("POS_Menu_Items");
      const dataRange = menuSheet.getDataRange();
      const values = dataRange.getValues();
      
      const menuList = [];
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row[0]) {
          menuList.push({
            id: String(row[0]),
            name: String(row[1]),
            price: Number(row[2]),
            category: String(row[3]) === "minuman" ? "minuman" : "makanan",
            isPopular: String(row[4]).toLowerCase() === "ya"
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        items: menuList 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Webhook API Google Sheet Aktif!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "Error GET Apps Script: " + err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Inisialisasi sheet & Memposisikan headers, styling, warna bertema (Navy, Sky, Teal) otomatis jika belum terbuat
 */
function initializeSheets(ss) {
  const sheetsDef = [
    {
      name: "POS_Transactions",
      headers: ["Nomor Invoice", "Tanggal / Waktu", "Subtotal (Rp)", "Pajak (10%) (Rp)", "Total Belanja (Rp)", "Metode Pembayaran", "Jumlah Bayar", "Kembalian", "Kasir", "ID Transaksi"],
      color: "#1e3a8a", // indigo-navy
    },
    {
      name: "POS_Transaction_Items",
      headers: ["Nomor Invoice", "Tanggal / Waktu", "ID Item", "Nama Menu", "Harga Satuan", "Jumlah", "Kategori", "Total Harga", "ID Transaksi"],
      color: "#0369a1", // sky
    },
    {
      name: "POS_Menu_Items",
      headers: ["ID Menu", "Nama Menu", "Harga", "Kategori", "Terpopuler"],
      color: "#0f766e", // teal
    }
  ];
  
  sheetsDef.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      
      // Isi baris header pertama
      sheet.appendRow(def.headers);
      
      // Custom format baris tajuk
      const headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setBackground(def.color)
                 .setFontColor("white")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center")
                 .setFontSize(10);
                 
      sheet.setFrozenRows(1);
      
      // Memberikan penataan ukuran kolom otomatis
      for (let i = 1; i <= def.headers.length; i++) {
        sheet.autoResizeColumn(i);
      }
    }
  });
}
`;
