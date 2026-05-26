/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Transaction, MenuItem, SalesStat } from '../types';
import { SALES_HISTORY_BY_DAY } from '../data';
import { 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  Crown, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight,
  TrendingDown,
  Percent,
  CalendarDays
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  transactions: Transaction[];
  menuItems: MenuItem[];
  onNavigateToPos: () => void;
}

export default function Dashboard({ transactions, menuItems, onNavigateToPos }: DashboardProps) {
  const [chartType, setChartType] = useState<'revenue' | 'volume'>('revenue');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Helper helper to format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Compute live calculations from localStorage state transactions
  const stats = useMemo(() => {
    let todayRevenue = 0;
    let todayTransactionsCount = 0;
    let todayItemsCount = 0;
    const itemQuantityMap: Record<string, { name: string; qty: number; image: string; price: number }> = {};

    // Seed bestseller calculation with global items
    menuItems.forEach(item => {
      itemQuantityMap[item.id] = { name: item.name, qty: 0, image: item.image, price: item.price };
    });

    // Extract stats
    transactions.forEach(tx => {
      todayRevenue += tx.total;
      todayTransactionsCount += 1;
      
      tx.items.forEach(item => {
        todayItemsCount += item.quantity;
        if (itemQuantityMap[item.id]) {
          itemQuantityMap[item.id].qty += item.quantity;
        } else {
          itemQuantityMap[item.id] = { 
            name: item.name, 
            qty: item.quantity, 
            image: menuItems.find(m => m.id === item.id)?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100',
            price: item.price
          };
        }
      });
    });

    // Find bestselling item
    let topItem = { name: 'Belum Ada', qty: 0, image: '', price: 0 };
    Object.keys(itemQuantityMap).forEach(id => {
      if (itemQuantityMap[id].qty > topItem.qty) {
        topItem = {
          name: itemQuantityMap[id].name,
          qty: itemQuantityMap[id].qty,
          image: itemQuantityMap[id].image,
          price: itemQuantityMap[id].price
        };
      }
    });

    // If no transactions have occurred yet, fallback to a sensible state
    if (topItem.qty === 0) {
      const fallbackBest = menuItems.find(item => item.isPopular) || menuItems[0] || { name: 'Belum Ada', image: '', price: 0 };
      topItem = {
        name: fallbackBest.name,
        qty: 12,
        image: fallbackBest.image,
        price: fallbackBest.price
      };
    }

    return {
      todayRevenue,
      todayTransactionsCount,
      todayItemsCount,
      topItem
    };
  }, [transactions]);

  // Combine static daily history with today's transactions for the chart
  const weeklyChartData = useMemo((): SalesStat[] => {
    // We represent static daily history
    // Today's actual accumulated transactions can merge or represent the latest node 'Hari Ini' or 'Minggu'
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    // Default stats map
    const defaultStats: Record<string, SalesStat> = {};
    SALES_HISTORY_BY_DAY.forEach(s => {
      defaultStats[s.day] = { ...s };
    });

    // Add current session stats into 'Selasa' as local time in metadata is 2026-05-26T01:57:12 (Tuesday)
    // Dynamic mapping: May 26 2026 is indeed a Tuesday (Selasa).
    if (defaultStats['Selasa']) {
      defaultStats['Selasa'].revenue += stats.todayRevenue;
      defaultStats['Selasa'].itemsSold += stats.todayItemsCount;
    }

    return days.map(d => defaultStats[d] || { day: d, revenue: 0, itemsSold: 0 });
  }, [stats]);

  // SVG Chart rendering helpers
  const chartHeight = 220;
  const chartWidth = 500;
  const maxVal = useMemo(() => {
    const values = weeklyChartData.map(d => chartType === 'revenue' ? d.revenue : d.itemsSold);
    const max = Math.max(...values, 1);
    return max * 1.15; // add 15% headroom inside the box
  }, [weeklyChartData, chartType]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-8 pb-24 md:pb-8" id="dashboard-container">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="dashboard-header-block">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Ringkasan Dasbor</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Pantau kinerja penjualan, menu, transaksi kasir hari ini.
          </p>
        </div>
        
        {/* Date Stamp & Action */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 text-xs text-slate-500 shadow-sm">
            <CalendarDays className="h-4 w-4 stroke-[1.8] text-sky-500" />
            <span className="font-medium">Selasa, 26 Mei 2026</span>
          </div>
          <button 
            onClick={onNavigateToPos}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:opacity-95 text-white font-medium text-xs md:text-sm rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-sky-200/50"
          >
            Buka Kasir <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" id="kpi-cards-grid">
        {/* Total Pendapatan */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-soft relative overflow-hidden"
          id="kpi-revenue"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Total Pendapatan</span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-mono tracking-tight pt-1">
                {formatRupiah(stats.todayRevenue)}
              </h3>
            </div>
            <div className="p-3 bg-brand-50 text-sky-500 rounded-xl">
              <DollarSign className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-4.5 w-4.5 stroke-[2]" />
            <span>+14.2% dari kemarin</span>
          </div>
          {/* Subtle decoration wave */}
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-sky-350 to-blue-500 opacity-60" />
        </motion.div>

        {/* Jumlah Transaksi */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-soft relative overflow-hidden"
          id="kpi-tx"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Jumlah Transaksi</span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-mono tracking-tight pt-1">
                {stats.todayTransactionsCount} <span className="text-sm font-normal text-slate-400">TX</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
              <Receipt className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-4.5 w-4.5 stroke-[2]" />
            <span>+8.5% dari rata-rata</span>
          </div>
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-indigo-500 opacity-60" />
        </motion.div>

        {/* Item Terjual */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-soft relative overflow-hidden"
          id="kpi-items"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Item Terjual</span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-mono tracking-tight pt-1">
                {stats.todayItemsCount} <span className="text-sm font-normal text-slate-400">porsi</span>
              </h3>
            </div>
            <div className="p-3 bg-violet-50 text-violet-500 rounded-xl">
              <ShoppingBag className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-4.5 w-4.5 stroke-[2]" />
            <span>+12.1% penjualan naik</span>
          </div>
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-violet-500 opacity-60" />
        </motion.div>

        {/* Menu Terlaris */}
        <motion.div 
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-soft relative overflow-hidden flex flex-col justify-between"
          id="kpi-bestseller"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 min-w-0 pr-2">
              <span className="text-xs font-medium text-slate-400 block truncate">Menu Terlaris</span>
              <h3 className="text-sm font-bold text-slate-800 truncate leading-snug pt-1">
                {stats.topItem.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Terjual {stats.topItem.qty} porsi hari ini</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
              <Crown className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100/85">
            <img 
              src={stats.topItem.image} 
              alt={stats.topItem.name}
              className="h-7 w-7 rounded-lg object-cover bg-slate-100" 
            />
            <span className="text-[11px] text-slate-500 font-mono font-medium truncate">{formatRupiah(stats.topItem.price)}</span>
          </div>
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-amber-500 opacity-60" />
        </motion.div>
      </div>

      {/* Main Stats Layout (Visual Graph and Best Sellers Detail Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-analytics-section">
        
        {/* Sales Statistics Custom SVG Graph Widget */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-soft lg:col-span-2 space-y-6" id="dashboard-chart-block">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-md md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-500 stroke-[2.2]" />
                Grafik Statistik Penjualan
              </h3>
              <p className="text-xs text-slate-400">Total akumulasi penjualan periode minggu ini.</p>
            </div>

            {/* Selector Pill */}
            <div className="flex p-0.5 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/20">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  chartType === 'revenue' 
                    ? 'bg-white text-sky-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Omzet (IDR)
              </button>
              <button
                onClick={() => setChartType('volume')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  chartType === 'volume' 
                    ? 'bg-white text-sky-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Porsi (Item)
              </button>
            </div>
          </div>

          {/* Render the Custom SVGs Bar Chart to be robust across screens */}
          <div className="relative w-full overflow-hidden" id="chart-svg-container">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = 20 + ratio * 150;
                const value = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={i} className="opacity-40">
                    <line 
                      x1="60" 
                      y1={y} 
                      x2="480" 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1.2" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x="50" 
                      y={y + 4} 
                      textAnchor="end" 
                      className="fill-slate-400 font-mono font-medium text-[9px]"
                    >
                      {chartType === 'revenue' 
                        ? value >= 1000000 
                          ? `${(value/1000000).toFixed(1)}M` 
                          : `${value/1000}k`
                        : value
                      }
                    </text>
                  </g>
                );
              })}

              {/* Dynamic Bars for 7 weekdays */}
              {weeklyChartData.map((dataPoint, index) => {
                const currentMetric = chartType === 'revenue' ? dataPoint.revenue : dataPoint.itemsSold;
                
                // Calculate height relative to viewport
                const barHeight = (currentMetric / maxVal) * 150;
                
                // Determine layout
                const barSpacing = (420 / 7);
                const x = 70 + index * barSpacing;
                const y = 170 - barHeight;
                const barWidth = 32;
                
                // Colors state
                const isHovered = hoveredBarIndex === index;
                const isTuesday = dataPoint.day === 'Selasa'; // Current active day

                return (
                  <g 
                    key={dataPoint.day}
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="cursor-pointer"
                  >
                    {/* Shadow block */}
                    {isHovered && (
                      <rect
                        x={x - 4}
                        y="15"
                        width={barWidth + 8}
                        height="170"
                        fill="#f0f9ff"
                        rx="12"
                        className="opacity-40 transition-all duration-300 pointer-events-none"
                      />
                    )}

                    {/* Gradient Bar */}
                    <defs>
                      <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isTuesday ? '#0ea5e9' : '#38bdf8'} />
                        <stop offset="100%" stopColor={isTuesday ? '#2563eb' : '#0284c7'} />
                      </linearGradient>
                    </defs>

                    {/* The bar element */}
                    <rect
                      x={x}
                      y={y < 12 ? 12 : y}
                      width={barWidth}
                      height={Math.max(barHeight, 6)}
                      rx="8"
                      fill={`url(#grad-${index})`}
                      className="transition-all duration-300"
                      opacity={isHovered ? 1 : isTuesday ? 0.95 : 0.72}
                    />

                    {/* Day text labels */}
                    <text
                      x={x + barWidth / 2}
                      y="190"
                      textAnchor="middle"
                      className={`text-[10px] font-semibold tracking-tight transition-all duration-200 ${
                        isTuesday 
                          ? 'fill-sky-600 font-bold' 
                          : isHovered 
                            ? 'fill-slate-800' 
                            : 'fill-slate-400'
                      }`}
                    >
                      {dataPoint.day}
                    </text>

                    {/* Today indicator label */}
                    {isTuesday && (
                      <circle 
                        cx={x + barWidth / 2} 
                        cy="198" 
                        r="2.5" 
                        className="fill-sky-500 animate-pulse" 
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Custom floating chart tooltip inside HTML */}
            {hoveredBarIndex !== null && (
              <div 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-xl shadow-md border border-slate-800 z-10 flex flex-col items-center gap-0.5 pointer-events-none transition-all duration-150"
              >
                <span className="font-semibold text-[10px] text-sky-400 uppercase tracking-widest">{weeklyChartData[hoveredBarIndex].day}</span>
                <span className="font-mono font-bold text-sm">
                  {chartType === 'revenue' 
                    ? formatRupiah(weeklyChartData[hoveredBarIndex].revenue)
                    : `${weeklyChartData[hoveredBarIndex].itemsSold} Porsi`
                  }
                </span>
                {weeklyChartData[hoveredBarIndex].day === 'Selasa' && (
                  <span className="text-[9px] text-emerald-400 font-medium">Termasuk sesi hari ini</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-medium" id="chart-legend">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-sky-500/80" />
              <span>Hari Biasa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              <span>Hari Ini (Aktif)</span>
            </div>
          </div>
        </div>

        {/* Popular Items Showcase Panel */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-soft flex flex-col pt-6 font-sans space-y-5" id="dashboard-popular-pane">
          <div>
            <h3 className="text-md md:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500 stroke-[2]" />
              Item Terlaris Pekan Ini
            </h3>
            <p className="text-xs text-slate-400">Daftar item favorit tamu di J's Resto.</p>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[230px] pr-1" id="top-products-checklist">
            {menuItems.filter(item => item.isPopular).slice(0, 4).map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl transition-colors shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                    />
                    <span className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-slate-800 text-white font-mono text-[10px] font-bold flex items-center justify-center border border-white">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full font-medium inline-block text-[10px] mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 font-mono block">{formatRupiah(item.price)}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-1.5 py-0.5 rounded-md">HOT SELLER</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Summary Footer Banner */}
          <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100/30 text-xs text-sky-800 flex items-center justify-between mt-auto">
            <div className="space-y-0.5">
              <span className="font-bold">Info Layanan</span>
              <p className="text-[10px] text-sky-600">Pelayanan meja meningkat 18%.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
