/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, Transaction, SalesStat } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // Makanan Indonesia (10 Items)
  {
    id: 'food-01',
    name: 'Nasi Goreng Spesial',
    price: 28000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1603133872878-a5c60144975d?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'food-02',
    name: 'Mie Goreng Jawa',
    price: 24000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'food-03',
    name: 'Ayam Geprek',
    price: 22000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'food-04',
    name: 'Soto Ayam',
    price: 20000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'food-05',
    name: 'Rendang Padang',
    price: 35000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'food-06',
    name: 'Pecel Lele',
    price: 18000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1580442151529-343f2f5e0e27?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'food-07',
    name: 'Bakso Urat',
    price: 23000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'food-08',
    name: 'Sate Ayam',
    price: 30000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'food-09',
    name: 'Gado-Gado',
    price: 19000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'food-10',
    name: 'Nasi Ayam Bakar',
    price: 27000,
    category: 'makanan',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?auto=format&fit=crop&q=80&w=500'
  },

  // Minuman (12 Items)
  {
    id: 'drink-01',
    name: 'Es Teh Manis',
    price: 8000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-02',
    name: 'Es Jeruk',
    price: 10000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-03',
    name: 'Kopi Susu Gula Aren',
    price: 22000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'drink-04',
    name: 'Cappuccino',
    price: 25000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a720ebf?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-05',
    name: 'Latte',
    price: 27000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-06',
    name: 'Matcha Latte',
    price: 30000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'drink-07',
    name: 'Chocolate Milkshake',
    price: 28000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-08',
    name: 'Lemon Tea',
    price: 15000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-09',
    name: 'Mojito Mint',
    price: 20000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=500',
    isPopular: true
  },
  {
    id: 'drink-10',
    name: 'Strawberry Smoothie',
    price: 26000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-11',
    name: 'Americano',
    price: 23000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1551046713-2d5d5df9a245?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'drink-12',
    name: 'Thai Tea',
    price: 18000,
    category: 'minuman',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=500'
  }
];

// Initial Transactions to give the application beautiful and realistic metrics from onset
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-01',
    invoiceNumber: 'INV-20260525-001',
    date: '2026-05-25T11:45:00Z',
    items: [
      { id: 'food-01', name: 'Nasi Goreng Spesial', price: 28000, quantity: 2, category: 'makanan' },
      { id: 'drink-03', name: 'Kopi Susu Gula Aren', price: 22000, quantity: 2, category: 'minuman' },
      { id: 'food-05', name: 'Rendang Padang', price: 35000, quantity: 1, category: 'makanan' }
    ],
    subtotal: 135000,
    tax: 13500,
    total: 148500,
    paymentMethod: 'QRIS',
    amountPaid: 148500,
    change: 0,
    cashier: 'admin'
  },
  {
    id: 'tx-02',
    invoiceNumber: 'INV-20260525-002',
    date: '2026-05-25T12:20:00Z',
    items: [
      { id: 'food-03', name: 'Ayam Geprek', price: 22000, quantity: 3, category: 'makanan' },
      { id: 'drink-01', name: 'Es Teh Manis', price: 8000, quantity: 3, category: 'minuman' }
    ],
    subtotal: 90000,
    tax: 9000,
    total: 99000,
    paymentMethod: 'Tunai',
    amountPaid: 100000,
    change: 1000,
    cashier: 'admin'
  },
  {
    id: 'tx-03',
    invoiceNumber: 'INV-20260525-003',
    date: '2026-05-25T13:10:00Z',
    items: [
      { id: 'food-08', name: 'Sate Ayam', price: 30000, quantity: 1, category: 'makanan' },
      { id: 'food-09', name: 'Gado-Gado', price: 19000, quantity: 1, category: 'makanan' },
      { id: 'drink-09', name: 'Mojito Mint', price: 20000, quantity: 2, category: 'minuman' }
    ],
    subtotal: 89000,
    tax: 8900,
    total: 97900,
    paymentMethod: 'E-Wallet',
    amountPaid: 97900,
    change: 0,
    cashier: 'admin'
  },
  {
    id: 'tx-04',
    invoiceNumber: 'INV-20260525-004',
    date: '2026-05-25T15:30:00Z',
    items: [
      { id: 'food-01', name: 'Nasi Goreng Spesial', price: 28000, quantity: 4, category: 'makanan' },
      { id: 'food-04', name: 'Soto Ayam', price: 20000, quantity: 2, category: 'makanan' },
      { id: 'drink-06', name: 'Matcha Latte', price: 30000, quantity: 3, category: 'minuman' },
      { id: 'drink-02', name: 'Es Jeruk', price: 10000, quantity: 3, category: 'minuman' }
    ],
    subtotal: 272000,
    tax: 27200,
    total: 299200,
    paymentMethod: 'Debit/Kredit',
    amountPaid: 300000,
    change: 800,
    cashier: 'admin'
  },
  {
    id: 'tx-05',
    invoiceNumber: 'INV-20260525-005',
    date: '2026-05-25T17:50:00Z',
    items: [
      { id: 'food-07', name: 'Bakso Urat', price: 23000, quantity: 2, category: 'makanan' },
      { id: 'drink-03', name: 'Kopi Susu Gula Aren', price: 22000, quantity: 2, category: 'minuman' }
    ],
    subtotal: 90000,
    tax: 9000,
    total: 99000,
    paymentMethod: 'Tunai',
    amountPaid: 100000,
    change: 1000,
    cashier: 'admin'
  },
  {
    id: 'tx-06',
    invoiceNumber: 'INV-20260525-006',
    date: '2026-05-25T19:15:00Z',
    items: [
      { id: 'food-05', name: 'Rendang Padang', price: 35000, quantity: 2, category: 'makanan' },
      { id: 'food-10', name: 'Nasi Ayam Bakar', price: 27000, quantity: 2, category: 'makanan' },
      { id: 'drink-08', name: 'Lemon Tea', price: 15000, quantity: 4, category: 'minuman' }
    ],
    subtotal: 184000,
    tax: 18400,
    total: 202400,
    paymentMethod: 'QRIS',
    amountPaid: 202400,
    change: 0,
    cashier: 'admin'
  }
];

export const SALES_HISTORY_BY_DAY: SalesStat[] = [
  { day: 'Senin', revenue: 942200, itemsSold: 28 },
  { day: 'Selasa', revenue: 1120000, itemsSold: 35 },
  { day: 'Rabu', revenue: 845000, itemsSold: 24 },
  { day: 'Kamis', revenue: 1250000, itemsSold: 40 },
  { day: 'Jumat', revenue: 1480000, itemsSold: 45 },
  { day: 'Sabtu', revenue: 2100000, itemsSold: 65 },
  { day: 'Minggu', revenue: 1950000, itemsSold: 58 }
];
