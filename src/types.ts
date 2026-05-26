/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'makanan' | 'minuman';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  isPopular?: boolean;
}

export interface CartItem {
  menuId: string;
  quantity: number;
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: Category;
}

export type PaymentMethod = 'Tunai' | 'QRIS' | 'E-Wallet' | 'Debit/Kredit';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashier: string;
}

export interface SalesStat {
  day: string;
  revenue: number;
  itemsSold: number;
}
