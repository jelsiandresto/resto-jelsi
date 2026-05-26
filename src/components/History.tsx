/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import { 
  Search, 
  History as HistoryIcon, 
  ChevronRight, 
  ArrowLeft, 
  Printer, 
  Calendar,
  Layers,
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface HistoryProps {
  transactions: Transaction[];
}

export default function History({ transactions }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('Semua');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Helper formatter
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Extract unique payment methods for filtering
  const paymentMethods = useMemo(() => {
    const list = new Set<string>(['Semua']);
    transactions.forEach(t => list.add(t.paymentMethod));
    return Array.from(list);
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    // Reverse chronology to show latest transactions on top! This is vital for cashing!
    return [...transactions].reverse().filter((t) => {
      const matchSearch = t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchMethod = filterMethod === 'Semua' || t.paymentMethod === filterMethod;
      return matchSearch && matchMethod;
    });
  }, [transactions, searchQuery, filterMethod]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50" id="tx-history-screen">
      
      {/* LEFT: List panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-6 pb-28 md:pb-6 space-y-4 md:space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-400">Arsip seluruh bukti transaksi lunas penjualan J's Resto</p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          {/* Invoice search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <Search className="h-4 w-4 stroke-[2]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode invoice atau nama pesanan..."
              className="w-full text-xs md:text-sm pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
              id="history-search-input"
            />
          </div>

          {/* Payment Method filter select dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 appearance-none cursor-pointer text-slate-650 font-medium"
              id="history-filter-select"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method === 'Semua' ? 'Semua Metode' : method}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 pointer-events-none text-xs">▼</span>
          </div>
        </div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto pr-1" id="history-scroller">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3" id="history-grid">
                {filteredTransactions.map((tx) => {
                  const itemsCount = tx.items.reduce((sum, i) => sum + i.quantity, 0);
                  const isSelected = selectedTx?.id === tx.id;
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`p-3.5 md:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center bg-white ${
                        isSelected 
                          ? 'border-sky-450 ring-4 ring-sky-100/40 bg-sky-50/20' 
                          : 'border-slate-100/80 hover:border-slate-250 shadow-soft'
                      }`}
                      id={`tx-card-${tx.id}`}
                    >
                      <div className="space-y-2.5 min-w-0 flex-1 pr-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800 tracking-tight">{tx.invoiceNumber}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-sky-50 text-sky-600 rounded-md">
                            {tx.paymentMethod}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Summary caption */}
                        <div className="text-xs text-slate-500 font-medium truncate">
                          {tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium font-sans flex items-center gap-1">
                          <span>Total {itemsCount} porsi</span>
                          <span>•</span>
                          <span>Kasir: {tx.cashier}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">Total Bayar</span>
                          <span className="font-mono font-bold text-sm md:text-base text-slate-850 block">{formatRupiah(tx.total)}</span>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-sky-500' : ''}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center animate-pulse">
                  <HistoryIcon className="h-6 w-6 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Tidak ada riwayat</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">Belum ada transaksi lunas terdaftar dalam riwayat atau pencarian Anda nihil.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT PREVIEW COLUMN (For tablet/desktop detailed thermal preview) */}
      <div 
        className={`hidden lg:flex flex-col w-96 bg-white border-l border-slate-100 h-full p-6 justify-between shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.01)]`}
        id="desktop-invoice-preview-column"
      >
        {selectedTx ? (
          <div className="flex flex-col h-full justify-between" id="preview-active-transaction">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="preview-header">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-sky-500" />
                Detil Nota Pembayaran
              </h2>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="p-1.5 text-slate-500 hover:text-sky-600 rounded bg-slate-50 hover:bg-sky-100/50 transition-colors cursor-pointer"
                title="Cetak Salinan"
              >
                <Printer className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable detailed mock Receipt blueprint */}
            <div className="flex-1 overflow-y-auto py-4 font-mono text-xs text-slate-650 scroll-receipt-container" id="thermal-receipt-blueprint">
              <div className="border border-slate-200 bg-slate-50/50 p-5 rounded-2xl text-[11px] leading-relaxed shadow-sm space-y-4">
                
                {/* Brand Header */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200">
                  <span className="text-sm font-bold text-slate-800 tracking-tight select-all">J's Resto</span>
                  <p className="text-[10px] text-slate-400">Margonda, Beji, Kota Depok<br />Telp: (021) 7712345</p>
                </div>

                {/* Meta details */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="text-slate-850 font-bold select-all">{selectedTx.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(selectedTx.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{new Date(selectedTx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-slate-100 pt-1">
                    <span>Metode:</span>
                    <span className="font-bold text-slate-800">{selectedTx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{selectedTx.cashier}</span>
                  </div>
                </div>

                {/* Items loop */}
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                  <div className="font-bold flex justify-between text-slate-800">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  {selectedTx.items.map((item) => (
                    <div key={item.id} className="space-y-0.5">
                      <div className="flex justify-between text-slate-800">
                        <span>{item.name}</span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {item.quantity} porsi x {formatRupiah(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial breakdown */}
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(selectedTx.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN Tagihan (10%):</span>
                    <span>{formatRupiah(selectedTx.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-800 text-xs">
                    <span>TOTAL HARGA:</span>
                    <span>{formatRupiah(selectedTx.total)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-1 text-[10px]">
                    <span>Diterima:</span>
                    <span>{formatRupiah(selectedTx.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(selectedTx.change)}</span>
                  </div>
                </div>

                {/* Footer greeting card */}
                <div className="text-center pt-3 border-t border-dashed border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">Terima Kasih Atas Kunjungan Anda!</span>
                  <p className="text-[10px] text-slate-400">Kritik & saran hubungi cs@jsresto.com. Layanan kepuasan Anda adalah janji kami.</p>
                </div>

              </div>
            </div>

            {/* Bottom Reprint and Copy Block */}
            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
              <p>Mendukung pencetakan ganda ke kasir utama, dapur lobi, dan meja tamu.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400 space-y-3">
            <Info className="h-8 w-8 stroke-[1.5] text-slate-300" />
            <h4 className="text-xs font-semibold text-slate-650">Tidak ada struk terpilih</h4>
            <p className="text-[10px] max-w-[180px] leading-relaxed">Klik salah satu riwayat transaksi di sebelah kiri untuk meninjau secara penuh salinan struk thermal kasir.</p>
          </div>
        )}
      </div>

      {/* MOBILE POPUP MODAL DETIL STRUK PREVIEW CLONE (Because right panel is hidden on mobile) */}
      <AnimatePresence>
        {selectedTx && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-100 flex flex-col gap-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">Rincian Belanja</span>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-1 rounded-full bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Duplicate Receipt display */}
              <div className="font-mono text-[11px] leading-relaxed bg-slate-50 p-4 border border-slate-200/50 rounded-2xl space-y-3">
                <div className="text-center border-b border-dashed border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 block text-xs">J's Resto</span>
                  <span className="text-[9px] text-slate-400">Margonda, Depok / Telp: 0812-3456</span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold text-slate-800">{selectedTx.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span>{selectedTx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{selectedTx.cashier}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-2 space-y-1.5">
                  {selectedTx.items.map(item => (
                    <div className="flex justify-between" key={item.id}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-2 font-bold text-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] font-normal">
                    <span>PPN (10%):</span>
                    <span>{formatRupiah(selectedTx.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(selectedTx.total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Cetak Salinan
                </button>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
