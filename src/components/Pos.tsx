/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem, PaymentMethod, Transaction, TransactionItem } from '../types';
import { 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  QrCode, 
  Wallet, 
  CreditCard, 
  Banknote,
  CheckCircle2,
  Receipt,
  FileText,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Edit,
  AlertTriangle
} from 'lucide-react';

const PRESET_IMAGES = [
  { name: 'Nasi Goreng', url: 'https://images.unsplash.com/photo-1603133872878-a5c60144975d?auto=format&fit=crop&q=80&w=500' },
  { name: 'Mie Goreng', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=500' },
  { name: 'Ayam Geprek', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=500' },
  { name: 'Soto Ayam', url: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&q=80&w=500' },
  { name: 'Rendang', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=500' },
  { name: 'Pecel Lele', url: 'https://images.unsplash.com/photo-1580442151529-343f2f5e0e27?auto=format&fit=crop&q=80&w=500' },
  { name: 'Bakso Urat', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=500' },
  { name: 'Sate Ayam', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=500' },
  { name: 'Gado-Gado', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500' },
  { name: 'Es Teh Manis', url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=500' },
  { name: 'Kopi Susu', url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=500' },
  { name: 'Es Jeruk', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=500' },
  { name: 'Thai Tea', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=500' }
];

interface PosProps {
  menuItems: MenuItem[];
  onAddMenuItem: (newItem: MenuItem) => void;
  onUpdateMenuItem: (updatedItem: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onAddTransaction: (transaction: Transaction) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  cashierName: string;
}

interface Toast {
  id: string;
  message: string;
  image?: string;
}

export default function Pos({ 
  menuItems, 
  onAddMenuItem, 
  onUpdateMenuItem, 
  onDeleteMenuItem, 
  onAddTransaction, 
  cart, 
  setCart,
  cashierName
}: PosProps) {
  // POS UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'makanan' | 'minuman'>('semua');
  
  // Modals & Flows
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Add Menu Modal states
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'makanan' | 'minuman'>('makanan');
  const [imageSourceType, setImageSourceType] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Edit Menu Modal states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemCategory, setEditItemCategory] = useState<'makanan' | 'minuman'>('makanan');
  const [editImageSourceType, setEditImageSourceType] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedEditPresetUrl, setSelectedEditPresetUrl] = useState('');
  const [customEditImageUrl, setCustomEditImageUrl] = useState('');
  const [uploadedEditImageBase64, setUploadedEditImageBase64] = useState('');
  const [editDragOver, setEditDragOver] = useState(false);

  // Delete Confirmation states
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  // Form submit & handle functions
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setEditItemCategory(item.category);
    
    if (item.image.startsWith('data:image')) {
      setEditImageSourceType('upload');
      setUploadedEditImageBase64(item.image);
      setCustomEditImageUrl('');
      setSelectedEditPresetUrl(PRESET_IMAGES[0].url);
    } else if (PRESET_IMAGES.some(p => p.url === item.image)) {
      setEditImageSourceType('preset');
      setSelectedEditPresetUrl(item.image);
      setUploadedEditImageBase64('');
      setCustomEditImageUrl('');
    } else {
      setEditImageSourceType('url');
      setCustomEditImageUrl(item.image);
      setUploadedEditImageBase64('');
      setSelectedEditPresetUrl(PRESET_IMAGES[0].url);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal adalah 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedEditImageBase64(reader.result as string);
        showToast('Gambar baru berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setEditDragOver(true);
  };

  const handleEditDragLeave = () => {
    setEditDragOver(false);
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setEditDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.indexOf('image/') === -1) {
        showToast('Harap jatuhkan file gambar saja!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal adalah 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedEditImageBase64(reader.result as string);
        showToast('Gambar baru berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const getSelectedEditImage = () => {
    if (editImageSourceType === 'preset') return selectedEditPresetUrl;
    if (editImageSourceType === 'url') return customEditImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
    return uploadedEditImageBase64 || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editItemName.trim()) {
      showToast('Nama menu tidak boleh kosong!');
      return;
    }
    const parsedPrice = parseFloat(editItemPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Harga harus valid dan lebih dari 0!');
      return;
    }

    const finalImage = getSelectedEditImage();

    const updatedProduct: MenuItem = {
      ...editingItem,
      name: editItemName.trim(),
      price: parsedPrice,
      category: editItemCategory,
      image: finalImage,
    };

    onUpdateMenuItem(updatedProduct);
    showToast(`Menu ${updatedProduct.name} berhasil diubah!`, finalImage);
    setEditingItem(null);
  };

  const handleDeleteSubmit = () => {
    if (!deletingItem) return;
    onDeleteMenuItem(deletingItem.id);
    showToast(`Menu ${deletingItem.name} berhasil dihapus!`);
    setDeletingItem(null);
  };

  // Formatting helpers
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Toast Notifier
  const showToast = (message: string, image?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, image }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // Image Upload processors
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal adalah 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result as string);
        showToast('Gambar berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.indexOf('image/') === -1) {
        showToast('Harap jatuhkan file gambar saja!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal adalah 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result as string);
        showToast('Gambar berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const getSelectedImage = () => {
    if (imageSourceType === 'preset') return selectedPresetUrl;
    if (imageSourceType === 'url') return customImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
    return uploadedImageBase64 || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      showToast('Nama menu tidak boleh kosong!');
      return;
    }
    const parsedPrice = parseFloat(newItemPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Harga harus valid dan lebih dari 0!');
      return;
    }

    const finalImage = getSelectedImage();

    const newId = `menu-custom-${Date.now()}`;
    const newProduct: MenuItem = {
      id: newId,
      name: newItemName.trim(),
      price: parsedPrice,
      category: newItemCategory,
      image: finalImage,
      isPopular: true
    };

    onAddMenuItem(newProduct);
    showToast(`Menu ${newProduct.name} berhasil ditambahkan!`, finalImage);

    // Reset fields
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory('makanan');
    setImageSourceType('preset');
    setSelectedPresetUrl(PRESET_IMAGES[0].url);
    setCustomImageUrl('');
    setUploadedImageBase64('');
    setIsAddMenuModalOpen(false);
  };

  // Sync / Load cart items from localStorage on mount (handled in App, passed via props)
  // Let's filter products lists
  const filteredProducts = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'semua' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Aggregate cart details
  const cartDetails = useMemo(() => {
    return cart.map((item) => {
      const product = menuItems.find((p) => p.id === item.menuId)!;
      return {
        product,
        quantity: item.quantity,
        totalItemPrice: product.price * item.quantity,
      };
    }).filter(item => item.product !== undefined);
  }, [menuItems, cart]);

  const subtotal = useMemo(() => {
    return cartDetails.reduce((sum, item) => sum + item.totalItemPrice, 0);
  }, [cartDetails]);

  const tax = useMemo(() => {
    return Math.round(subtotal * 0.1); // Pajak 10%
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  // Handle Cart Operations
  const addToCart = (product: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.menuId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menuId: product.id, quantity: 1 }];
    });
    showToast(`${product.name} ditambahkan ke keranjang`, product.image);
  };

  const decrementCartItem = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.menuId === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.menuId !== productId);
    });
  };

  const incrementCartItem = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuId === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const removeCartItem = (productId: string) => {
    const product = menuItems.find((p) => p.id === productId);
    setCart((prev) => prev.filter((item) => item.menuId !== productId));
    if (product) {
      showToast(`${product.name} dihapus dari keranjang`);
    }
  };

  const clearAllCart = () => {
    setCart([]);
    showToast('Keranjang belanja dikosongkan');
  };

  // Payment calculations
  const parsedAmountPaid = useMemo(() => {
    const parsed = parseInt(amountPaidInput.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [amountPaidInput]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Tunai') return 0;
    return Math.max(parsedAmountPaid - total, 0);
  }, [paymentMethod, parsedAmountPaid, total]);

  const isAmountSufficient = useMemo(() => {
    if (paymentMethod !== 'Tunai') return true;
    return parsedAmountPaid >= total;
  }, [paymentMethod, parsedAmountPaid, total]);

  // Quick cash triggers
  const cashShortcuts = useMemo(() => {
    if (total <= 0) return [];
    // Generate logical round numbers above total
    const increments = [10000, 20000, 50000, 100000];
    const pas = total;
    const shortcutsSet = new Set<number>([pas]);
    
    // Add multiple roundings
    increments.forEach(inc => {
      const option = Math.ceil(total / inc) * inc;
      if (option > total) {
        shortcutsSet.add(option);
      }
    });

    return Array.from(shortcutsSet).sort((a,b) => a-b).slice(0, 4);
  }, [total]);

  // Handle Cash Input Preset Click
  const handleCashShortcutClick = (val: number) => {
    setAmountPaidInput(val.toString());
  };

  // Payment method selection cleanup
  useEffect(() => {
    if (paymentMethod !== 'Tunai') {
      setAmountPaidInput('');
    } else {
      setAmountPaidInput(total.toString());
    }
  }, [paymentMethod, total]);

  // Open Checkout triggers
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }
    setPaymentMethod('Tunai');
    setAmountPaidInput(total.toString());
    setIsCheckoutModalOpen(true);
  };

  // Final Action: Complete transaction & checkout
  const handleConfirmPayment = () => {
    if (!isAmountSufficient) {
      alert('Uang pembayaran tunai belum mencukupi!');
      return;
    }

    const txItems: TransactionItem[] = cartDetails.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      category: item.product.category,
    }));

    const finalAmountPaid = paymentMethod === 'Tunai' ? parsedAmountPaid : total;
    const finalChange = paymentMethod === 'Tunai' ? changeDue : 0;

    // Generate invoice id
    const now = new Date();
    const dateStr = now.toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 10).replace(/-/g, '');
    const serial = Math.floor(100 + Math.random() * 900); // 3-digit serial ID
    const invoiceNumber = `INV-${dateStr}-${serial}`;

    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber,
      date: now.toISOString(),
      items: txItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      amountPaid: finalAmountPaid,
      change: finalChange,
      cashier: cashierName,
    };

    onAddTransaction(newTx);
    setCompletedTx(newTx);
    setIsCheckoutModalOpen(false);
    setCart([]); // Reset Cart
    showToast('Transaksi Sukses & Terpeta!', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100');
  };

  // Floating mobile panel state trigger
  const [isMobileCartDrawerOpen, setIsMobileCartDrawerOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 relative" id="pos-cashier-screen">
      
      {/* LEFT: Menu list, search, filters */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-6 pb-28 md:pb-6 space-y-4 md:space-y-6">
        
        {/* Header containing responsive controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">Layanan Kasir</h1>
            <p className="text-[11px] md:text-xs text-slate-400">Pilih menu makanan & minuman terbaik tamu J's Resto</p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search className="h-4 w-4 stroke-[2]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari makanan / minuman..."
              className="w-full text-xs md:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
              id="search-menu-input"
            />
          </div>
        </div>

        {/* Categories selector tabs & Add Menu button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0" id="category-line-bar">
          <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar" id="category-selector-tabs">
            {[
              { id: 'semua', label: 'Semua Menu' },
              { id: 'makanan', label: 'Makanan Utama' },
              { id: 'minuman', label: 'Aneka Minuman' },
            ].map((cat) => {
              const isSel = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 shrink-0 border ${
                    isSel
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-100'
                      : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200/50 hover:border-slate-300'
                  }`}
                  id={`cat-tab-${cat.id}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {cashierName.toLowerCase() === 'admin' && (
            <button
              onClick={() => setIsAddMenuModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-xs md:text-sm font-bold text-sky-600 bg-sky-50 hover:bg-sky-100/80 rounded-xl cursor-pointer transition-all border border-sky-100/60 self-start sm:self-center"
              id="btn-add-new-menu"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Tambah Menu Baru
            </button>
          )}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1" id="menu-items-grid-container">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-4"
                id="menu-grid"
              >
                {filteredProducts.map((p) => {
                  const cartQty = cart.find(item => item.menuId === p.id)?.quantity || 0;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="group bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-soft overflow-hidden flex flex-col justify-between"
                      key={p.id}
                      id={`menu-card-${p.id}`}
                    >
                      {/* Image section with premium badge overlays */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Selected quantity highlight */}
                        {cartQty > 0 && (
                          <div className="absolute top-2.5 right-2.5 h-6.5 min-w-6.5 px-2 bg-sky-500 text-white rounded-full font-mono text-xs font-bold flex items-center justify-center border border-white shadow-sm">
                            {cartQty}x
                          </div>
                        )}

                        {/* Popular badge */}
                        {p.isPopular && (
                          <div className="absolute top-2.5 left-2.5 bg-amber-400/95 backdrop-blur-sm text-slate-950 font-semibold text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <Sparkles className="h-3 w-3 fill-slate-950/20" /> POPULER
                          </div>
                        )}

                        {/* Category tiny badge */}
                        <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wide font-bold px-2 py-0.5 bg-slate-900/60 backdrop-blur-sm text-white rounded-md">
                          {p.category}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="p-3 md:p-4 flex flex-col justify-between flex-1">
                        <div className="space-y-1">
                          <h3 className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">
                            {p.name}
                          </h3>
                          <p className="text-xs md:text-sm font-bold text-slate-950 font-mono">
                            {formatRupiah(p.price)}
                          </p>
                        </div>

                        {/* Add to basket and modifier buttons */}
                        <div className="flex gap-1.5 mt-3" id={`actions-div-${p.id}`}>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addToCart(p)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white transition-all duration-300 rounded-xl font-bold text-[11px] md:text-xs select-none cursor-pointer border border-sky-100/50"
                            id={`add-btn-${p.id}`}
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Pesan</span>
                          </motion.button>

                          {cashierName.toLowerCase() === 'admin' && (
                            <>
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-1.5 text-slate-500 bg-slate-50 hover:text-sky-600 hover:bg-sky-50/50 border border-slate-200/60 hover:border-sky-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                title="Edit Detail Menu"
                                id={`edit-btn-${p.id}`}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => setDeletingItem(p)}
                                className="p-1.5 text-slate-500 bg-slate-50 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200/60 hover:border-rose-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                                title="Hapus Menu"
                                id={`delete-btn-${p.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-3"
                id="no-match-menu-container"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-2">
                  <X className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Menu tidak ditemukan</h3>
                <p className="text-xs text-slate-400 max-w-xs">Ganti kata kunci pencarian Anda atau sesuaikan filter kategori menu.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDEBAR / BASKET SHEET (Desktop View) */}
      <div 
        className="hidden md:flex flex-col w-96 bg-white border-l border-slate-100 h-full p-5 justify-between shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.01)]"
        id="desktop-basket-sidebar"
      >
        <div className="flex flex-col h-full overflow-hidden justify-between space-y-4">
          
          {/* Basket Header */}
          <div className="flex items-center justify-between shrink-0 border-b border-slate-50 pb-3" id="basket-header">
            <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-sky-500" />
              Keranjang Pesanan ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearAllCart}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                id="clear-basket-btn"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Basket Items List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3" id="basket-items-list">
            <AnimatePresence initial={false}>
              {cartDetails.length > 0 ? (
                cartDetails.map((item) => (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex justify-between items-center gap-3 p-2 bg-slate-50/50 rounded-xl border border-slate-100/50 hover:border-slate-200/50 transition-colors"
                    key={item.product.id}
                  >
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="h-10 w-10 rounded-lg object-cover bg-slate-100" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">{item.product.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">{formatRupiah(item.product.price)}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-slate-200/50 shrink-0">
                      <button
                        onClick={() => decrementCartItem(item.product.id)}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="w-5 text-center font-mono text-xs font-bold text-slate-850 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementCartItem(item.product.id)}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>

                    {/* Remove trigger */}
                    <button
                      onClick={() => removeCartItem(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 stroke-[1.8]" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 animate-pulse">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600">Keranjang masih kosong</h4>
                    <p className="text-[10px] text-slate-400 max-w-[180px] mt-1 mx-auto">Klik pesan pada kartu menu untuk memasukkan pesanan tamu.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing Summary & Buttons Footer */}
          <div className="space-y-3 border-t border-slate-50 pt-3.5 shrink-0" id="basket-calculations">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-mono font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Pajak Pertambahan Nilai 
                  <span className="bg-slate-100 text-[9px] font-bold text-slate-600 px-1 rounded">10%</span>
                </span>
                <span className="font-mono font-medium">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-800 font-bold border-t border-slate-50 pt-2.5">
                <span>Total Pembayaran</span>
                <span className="font-mono text-base text-sky-600 select-all">{formatRupiah(total)}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={cart.length === 0}
              onClick={handleOpenCheckout}
              className={`w-full py-3 px-4 font-bold rounded-xl text-white text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                cart.length > 0
                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 shadow-sky-100/50 hover:opacity-95'
                  : 'bg-slate-200 cursor-not-allowed shadow-none'
              }`}
              id="desktop-submit-checkout-btn"
            >
              <Banknote className="h-4.5 w-4.5 stroke-[2]" />
              <span>Selesaikan Pembayaran</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FLOATING CART PANEL BAR / ACTOR (Gofood Style) */}
      {cart.length > 0 && !isMobileCartDrawerOpen && (
        <div className="md:hidden fixed bottom-18 left-4 right-4 z-30" id="mobile-sticky-basket-banner">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsMobileCartDrawerOpen(true)}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-sky-400 select-none cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold font-mono text-sm">
                {cartDetails.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-left">
                <span className="text-[10px] text-sky-100 uppercase tracking-widest block font-bold leading-none">Keranjang POS</span>
                <p className="text-xs font-semibold">Tinjau pesanan makan tamu berjalan</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-1.5 font-mono font-bold text-sm">
              <span>{formatRupiah(total)}</span>
              <Plus className="h-4 w-4 stroke-[3]" />
            </div>
          </motion.button>
        </div>
      )}

      {/* MOBILE FULLSCREEN DRAWER OVERLAY FOR BASKET */}
      <AnimatePresence>
        {isMobileCartDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full bg-white rounded-t-3xl mt-24 flex flex-col justify-between overflow-hidden shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-sky-500 stroke-[2]" />
                  <h3 className="font-bold text-slate-800 text-sm">Pesanan Kasir ({cart.length})</h3>
                </div>
                <button 
                  onClick={() => setIsMobileCartDrawerOpen(false)}
                  className="p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Items scroll */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {cartDetails.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100/50"
                  >
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0 px-2">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">{item.product.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{formatRupiah(item.product.price)}</span>
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-slate-200/50 shrink-0">
                      <button
                        onClick={() => decrementCartItem(item.product.id)}
                        className="p-1 text-slate-400"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="w-5 text-center font-mono text-xs font-bold text-slate-850">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementCartItem(item.product.id)}
                        className="p-1 text-slate-400"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeCartItem(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Drawer Summary Footer */}
              <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/40">
                <div className="space-y-1.5 text-xs text-slate-500 font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (10%)</span>
                    <span className="font-mono">{formatRupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200/30 pt-2 text-sm">
                    <span>Total Tagihan</span>
                    <span className="font-mono text-sky-600">{formatRupiah(total)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if(confirm('Yakin kosongan keranjang?')){
                        clearAllCart();
                        setIsMobileCartDrawerOpen(false);
                      }
                    }}
                    className="px-4 py-3 border border-rose-200 text-rose-500 rounded-xl text-xs font-bold bg-white"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileCartDrawerOpen(false);
                      handleOpenCheckout();
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-100 flex items-center justify-center gap-1.5"
                  >
                    <Banknote className="h-4 w-4 stroke-[2]" />
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MULTIMETHOD CHECOUT PAYMENT POPUP MODAL */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            id="checkout-payment-modal"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden my-auto"
            >
              {/* Modal header */}
              <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-850 text-md md:text-lg flex items-center gap-1.5">
                    <Receipt className="h-5 w-5 text-sky-500" />
                    Selesaikan Pembayaran
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-400">Pilih metode pembayaran dan masukkan nominal bayar</p>
                </div>
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-4 md:p-6 space-y-5 flex flex-col">
                
                {/* Due banner */}
                <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 text-center space-y-1">
                  <span className="text-[10px] text-sky-600 font-bold tracking-widest uppercase">Total Tagihan Pesanan</span>
                  <h2 className="text-2xl md:text-3xl font-black font-mono text-sku text-sky-700 tracking-tight leading-none">
                    {formatRupiah(total)}
                  </h2>
                </div>

                {/* Methods Toggle Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Tunai', icon: Banknote, label: 'Tunai / Cash', desc: 'Uang Fisik' },
                      { id: 'QRIS', icon: QrCode, label: 'QRIS', desc: 'Scan Instan' },
                      { id: 'E-Wallet', icon: Wallet, label: 'E-Wallet', desc: 'Dompet Digital' },
                      { id: 'Debit/Kredit', icon: CreditCard, label: 'Kartu Bank', desc: 'EDC EDC' },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSel = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                            isSel
                              ? 'bg-sky-50 border-sky-400 text-sky-600 shadow-sm'
                              : 'bg-white border-slate-250/50 hover:border-slate-350 text-slate-650 hover:bg-slate-50/60'
                          }`}
                          id={`p-method-${m.id}`}
                        >
                          <Icon className={`h-5.5 w-5.5 mb-1 bg-transparent shrink-0 ${isSel ? 'text-sky-500' : 'text-slate-450'}`} />
                          <span className="text-xs font-bold leading-none">{m.id}</span>
                          <span className="text-[9px] text-slate-400 mt-1">{m.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Fields depending on selection */}
                <div className="min-h-[140px]" id="selected-payment-fields">
                  
                  {/* METODE CASH/TUNAI FIELDS */}
                  {paymentMethod === 'Tunai' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Shortcuts */}
                      <div className="space-y-1.5">
                        <span className="block text-xs font-semibold text-slate-400">Pilih Uang Presisi</span>
                        <div className="flex gap-2 flex-wrap pb-1">
                          {cashShortcuts.map((val) => (
                            <button
                              key={val}
                              onClick={() => handleCashShortcutClick(val)}
                              className="px-3 py-2 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer border border-transparent hover:border-sky-305"
                            >
                              {val === total ? 'Uang Pas' : formatRupiah(val)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cash Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Diterima (Rupiah)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-sm">Rp</span>
                            <input
                              type="text"
                              value={amountPaidInput === '' ? '' : formatRupiah(parsedAmountPaid).replace('Rp', '').trim()}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/[^0-9]/g, '');
                                setAmountPaidInput(digits);
                              }}
                              placeholder="0"
                              className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-sky-400 font-mono text-sm font-bold text-slate-800"
                              id="cash-input-field"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 font-sans">Uang Kembalian</label>
                          <div className={`p-3 rounded-xl border font-mono text-sm font-bold flex items-center justify-between ${
                            changeDue > 0 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : isAmountSufficient 
                                ? 'bg-slate-50 border-slate-100 text-slate-650'
                                : 'bg-rose-50 border-rose-100 text-rose-500'
                          }`}>
                            <span>Rp</span>
                            <span className="text-right select-all">
                              {isAmountSufficient ? formatRupiah(changeDue).replace('Rp', '').trim() : 'Kurang Bayar!'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* METODE QRIS DISPLAY */}
                  {paymentMethod === 'QRIS' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50"
                    >
                      {/* Dynamic Mock QR Code drawn in clean SVG */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-90">
                          {/* Outer markers standard to QR codes */}
                          <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="2" />
                          <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                          <rect x="13" y="13" width="9" height="9" fill="#0ea5e9" />

                          <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="2" />
                          <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                          <rect x="78" y="13" width="9" height="9" fill="#0ea5e9" />

                          <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="2" />
                          <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                          <rect x="13" y="78" width="9" height="9" fill="#0ea5e9" />

                          {/* Mock Data blocks */}
                          <rect x="38" y="10" width="8" height="8" fill="#1e293b" />
                          <rect x="52" y="12" width="6" height="12" fill="#1e293b" />
                          <rect x="35" y="24" width="14" height="6" fill="#1e293b" />
                          <rect x="55" y="22" width="8" height="8" fill="#0ea5e9" />
                          
                          <rect x="35" y="38" width="28" height="28" fill="#1e293b" rx="2" />
                          <rect x="42" y="45" width="14" height="14" fill="#ffffff" />
                          <rect x="46" y="49" width="6" height="6" fill="#0ea5e9" />

                          <rect x="75" y="42" width="12" height="12" fill="#1e293b" />
                          <rect x="80" y="58" width="6" height="18" fill="#1e293b" />
                          <rect x="12" y="42" width="8" height="12" fill="#1e293b" />
                          
                          <rect x="38" y="74" width="12" height="8" fill="#1e293b" />
                          <rect x="55" y="78" width="12" height="12" fill="#0ea5e9" />
                          <rect x="75" y="75" width="18" height="8" fill="#1e293b" />
                        </svg>
                        <span className="text-[9px] font-bold text-center text-slate-400 block mt-1 tracking-widest font-mono">GPN INDONESIA</span>
                      </div>

                      <div className="space-y-1 text-center sm:text-left">
                        <span className="inline-block bg-sky-100 text-sky-850 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">QRIS Statis J's Resto</span>
                        <h4 className="text-xs font-bold text-slate-800">Dynamic Scan Engine Active</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Minta tamu membuka e-wallet/m-banking favorit mereka dan memindai kode QR dinominalkan di kiri. Status akan terverifikasi secara instant.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* METODE E-WALLET PRESETS */}
                  {paymentMethod === 'E-Wallet' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50"
                    >
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Pilih Provider E-Wallet</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['GoPay', 'OVO', 'ShopeePay'].map((provider) => (
                          <div 
                            key={provider}
                            className="bg-white p-3 rounded-xl border border-slate-200/50 hover:border-sky-300 text-center font-bold text-xs text-slate-700 cursor-pointer flex flex-col items-center gap-1.5 transition-colors"
                          >
                            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                            <span>{provider}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center leading-normal">Verifikasi pembayaran saldo e-wallet diselesaikan terhubung ke nomor m-POS.</p>
                    </motion.div>
                  )}

                  {/* METODE CARD DEBIT/KREDIT */}
                  {paymentMethod === 'Debit/Kredit' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col justify-center space-y-3"
                    >
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide font-sans">EDC Terminal Connector</span>
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-14 bg-slate-800 text-white font-mono text-[9px] rounded-lg p-2 flex flex-col justify-between shrink-0 shadow-sm">
                          <span className="font-semibold block text-[7px] leading-tight text-slate-400">BANK READER</span>
                          <span className="tracking-widest">**** 7712</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-700">Menunggu gesek/tempel kartu...</h4>
                          <p className="text-[11px] text-slate-450 leading-tight">Tekan tombol konfirmasi di bawah jika proses di mesin EDC bank telah dinyatakan BERHASIL.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Confirm actions */}
                <div className="flex gap-3 border-t border-slate-50 pt-4" id="modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-500 text-xs md:text-sm transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!isAmountSufficient}
                    onClick={handleConfirmPayment}
                    className={`flex-1 py-3 rounded-xl font-bold text-white text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                      isAmountSufficient
                        ? 'bg-gradient-to-r from-sky-500 to-blue-500 hover:opacity-95 shadow-sky-100/50'
                        : 'bg-slate-200 shadow-none cursor-not-allowed'
                    }`}
                    id="modal-confirm-checkout-btn"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 stroke-[2]" />
                    <span>Konfirmasi Lunas</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOAT TOASTS NOTIFIER */}
      <div 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        id="toast-notifications-container"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              layout
              initial={{ y: -20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className="bg-slate-900/95 backdrop-blur-sm text-white px-3.5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800"
              key={t.id}
            >
              {t.image && (
                <img 
                  src={t.image} 
                  alt="" 
                  className="h-8 w-8 rounded-lg object-cover bg-slate-50 shrink-0" 
                />
              )}
              <span className="text-xs font-medium">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* COMPLETED TRANSACTION STRUK REFRESHPOP */}
      <AnimatePresence>
        {completedTx && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 md:p-6 w-full max-w-sm relative shadow-2xl flex flex-col gap-4 border border-slate-100 my-auto"
            >
              <div className="text-center space-y-1.5" id="tx-success-greetings">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-slate-850 text-md">Pembayaran Sukses</h3>
                <p className="text-xs text-slate-400">Struk siap dicetak untuk pelanggan dan dapur.</p>
              </div>

              {/* Minimal Struk Preview card */}
              <div 
                className="bg-slate-50/50 border border-slate-150/70 p-4 rounded-2xl text-[11px] font-mono text-slate-650 space-y-2.5 shadow-sm"
                id="receipt--invoice-brief-block"
              >
                <div className="text-center border-b border-dashed border-slate-200 pb-2">
                  <span className="font-bold text-slate-850 text-xs block">J's Resto</span>
                  <span>Margonda, Depok / Telp: 0812-3456</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="text-slate-850 font-bold">{completedTx.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span>{completedTx.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{new Date(completedTx.date).toLocaleTimeString('id-ID')}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                  {completedTx.items.map(item => (
                    <div className="flex justify-between" key={item.id}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-2 font-bold text-slate-850 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] font-normal">
                    <span>PPN (10%):</span>
                    <span>{formatRupiah(completedTx.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(completedTx.total)}</span>
                  </div>
                </div>
              </div>

              {/* Receipt Modal Trigger */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Trigger native print flow centered on receipt formatting
                    window.print();
                  }}
                  className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Cetak Struk Thermal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedTx(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Lanjutkan Pelayanan Baru
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW MENU MODAL */}
      <AnimatePresence>
        {isAddMenuModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto" id="add-menu-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto"
              id="add-menu-modal-body"
            >
              {/* MODAL LEFT PANEL: LIVE CARD PREVIEW (Real-time render) */}
              <div className="w-full md:w-[260px] bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between shrink-0">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Preview Kartu Menu</h3>
                  
                  {/* Realistic Menu Card emulation */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col justify-between aspect-[4/3] w-full max-w-[210px] mx-auto">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100/50 flex items-center justify-center">
                      <img
                        src={getSelectedImage()}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 text-[9px] text-slate-450 font-bold bg-white/95 px-2 py-0.5 rounded-full capitalize border border-slate-100/50">
                        {newItemCategory}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2">
                       <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{newItemName || 'Nama Menu Baru'}</h4>
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-sky-600 font-mono">
                           {formatRupiah(parseFloat(newItemPrice) || 0)}
                         </span>
                         <span className="h-6 w-6 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                           <Plus className="h-3 w-3" />
                         </span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="hidden md:block text-[11px] text-slate-400 space-y-1.5 border-t border-slate-200/60 pt-4 mt-4">
                  <p className="font-semibold text-slate-500">💡 Tips Gambar Menu:</p>
                  <p>Gunakan format persegi agar presisi, atau pilih salah satu preset kuliner lezat yang kami sediakan!</p>
                </div>
              </div>

              {/* MODAL RIGHT PANEL: FORM INPUTS */}
              <form onSubmit={handleAddSubmit} className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
                
                {/* Title Row */}
                <div className="flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Tambah Menu Kuliner</h2>
                    <p className="text-xs text-slate-400">Buat item menu baru yang terintegrasi otomatis ke POS</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddMenuModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Fields Grid */}
                <div className="space-y-4">
                  {/* Name and Price list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Menu</label>
                      <input
                        type="text"
                        required
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Es Teh Leci Segar"
                        className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga Jual (Rp)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Categories selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kategori Menu</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'makanan', label: '🥘 Makanan Utama' },
                        { id: 'minuman', label: '🍹 Aneka Minuman' }
                      ].map((cat) => {
                        const isSel = newItemCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewItemCategory(cat.id as any)}
                            className={`py-3 px-4 rounded-xl border font-semibold text-xs md:text-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                              isSel
                                ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                                : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                            }`}
                          >
                             {cat.label}
                          </button>
                        );
                      })}
                    </div>
                                    {/* Custom Tabbed Image input interface */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="h-4 w-4 text-sky-500" />
                      Sumber Gambar Menu (Wajib Pilih)
                    </label>
                    
                    {/* Visual Segment Control Indicator */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner w-full">
                      {[
                        { id: 'preset', label: '🔮 Preset', desc: 'Gambar Lezat' },
                        { id: 'upload', label: '📤 Upload', desc: 'HP / Laptop' },
                        { id: 'url', label: '🔗 URL', desc: 'Link Internet' }
                      ].map((tab) => {
                        const isSelected = imageSourceType === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setImageSourceType(tab.id as any)}
                            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-white text-sky-600 shadow-md border border-slate-100 font-bold'
                                : 'text-slate-505 hover:text-slate-700 hover:bg-white/40'
                            }`}
                          >
                            <span className="text-xs">{tab.label}</span>
                            <span className="text-[9px] text-slate-400 font-normal mt-0.5">{tab.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                    {/* Tab content 1: PRESETS Grid selection */}
                    {imageSourceType === 'preset' && (
                      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100/60 max-h-[140px] overflow-y-auto">
                        {PRESET_IMAGES.map((preset) => {
                          const isSel = selectedPresetUrl === preset.url;
                          return (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => setSelectedPresetUrl(preset.url)}
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                                isSel ? 'border-sky-500 ring-2 ring-sky-100 scale-[0.96]' : 'border-slate-200/20 hover:border-slate-300'
                              }`}
                              title={preset.name}
                            >
                              <img 
                                src={preset.url} 
                                alt={preset.name} 
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                <p className="text-[8px] font-bold text-white leading-tight truncate text-center capitalize">{preset.name}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Tab content 2: Direct local File Upload Area */}
                    {imageSourceType === 'upload' && (
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[110px] cursor-pointer ${
                          dragOver ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input 
                          type="file" 
                          id="menu-file-upload-input" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[0px]"
                        />
                        {uploadedImageBase64 ? (
                          <div className="flex items-center gap-3">
                            <img src={uploadedImageBase64} className="h-12 w-12 rounded-xl object-cover border border-slate-200" alt="Uploaded Thumbnail" />
                            <div className="text-left">
                              <p className="text-xs font-semibold text-slate-800">File Terunggah!</p>
                              <p className="text-[10px] text-sky-600 font-bold underline">Klik / Seret untuk mengganti</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="h-6 w-6 text-slate-400 mx-auto stroke-[2]" />
                            <p className="text-xs font-semibold text-slate-600">Seret gambar Anda ke sini, atau <span className="text-sky-500 underline">pilih file</span></p>
                            <p className="text-[9px] text-slate-400">Format PNG, JPG, WEBP (Maksimal 2MB)</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab content 3: Direct URL pasting */}
                    {imageSourceType === 'url' && (
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                          <LinkIcon className="h-4 w-4" />
                        </span>
                        <input
                          type="url"
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
                          className="w-full text-xs md:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button row */}
                <div className="flex gap-3 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddMenuModalOpen(false)}
                    className="flex-1 py-3 text-xs md:text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs md:text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl cursor-pointer shadow-md shadow-sky-100 transition-colors"
                  >
                    Simpan & Pasang Menu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MENU MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto" id="edit-menu-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto"
              id="edit-menu-modal-body"
            >
              {/* MODAL LEFT PANEL: LIVE CARD PREVIEW */}
              <div className="w-full md:w-[260px] bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between shrink-0">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Preview Perubahan</h3>
                  
                  {/* Realistic Menu Card emulation */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col justify-between aspect-[4/3] w-full max-w-[210px] mx-auto">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100/50 flex items-center justify-center">
                      <img
                        src={getSelectedEditImage()}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 text-[9px] text-slate-450 font-bold bg-white/95 px-2 py-0.5 rounded-full capitalize border border-slate-100/50">
                        {editItemCategory}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2">
                       <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{editItemName || 'Nama Menu Baru'}</h4>
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-sky-600 font-mono">
                           {formatRupiah(parseFloat(editItemPrice) || 0)}
                         </span>
                         <span className="h-6 w-6 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                           <Plus className="h-3 w-3" />
                         </span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block text-[11px] text-slate-400 space-y-1.5 border-t border-slate-200/60 pt-4 mt-4">
                  <p className="font-semibold text-slate-500">Edit Mode:</p>
                  <p>Anda sedang mengubah menu yang sudah ada. Perubahan harga akan tersinkronisasi ke keranjang belanja saat ini.</p>
                </div>
              </div>

              {/* MODAL RIGHT PANEL: FORM INPUTS */}
              <form onSubmit={handleEditSubmit} className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
                
                {/* Title Row */}
                <div className="flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Ubah Menu Kuliner</h2>
                    <p className="text-xs text-slate-400">Modifikasi informasi kuliner dan harga jual menu</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Fields Grid */}
                <div className="space-y-4">
                  {/* Name and Price list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Menu</label>
                      <input
                        type="text"
                        required
                        value={editItemName}
                        onChange={(e) => setEditItemName(e.target.value)}
                        placeholder="e.g. Es Teh Leci Segar"
                        className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga Jual (Rp)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Categories selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kategori Menu</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'makanan', label: '🥘 Makanan Utama' },
                        { id: 'minuman', label: '🍹 Aneka Minuman' }
                      ].map((cat) => {
                        const isSel = editItemCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setEditItemCategory(cat.id as any)}
                            className={`py-3 px-4 rounded-xl border font-semibold text-xs md:text-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                              isSel
                                ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                                : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                            }`}
                          >
                             {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Tabbed Image input interface */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="h-4 w-4 text-sky-500" />
                      Ubah Gambar Menu (Wajib Pilih)
                    </label>
                    
                    {/* Visual Segment Control Indicator */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner w-full font-sans">
                      {[
                        { id: 'preset', label: '🔮 Preset', desc: 'Gambar Lezat' },
                        { id: 'upload', label: '📤 Upload', desc: 'HP / Laptop' },
                        { id: 'url', label: '🔗 URL', desc: 'Link Internet' }
                      ].map((tab) => {
                        const isSelected = editImageSourceType === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setEditImageSourceType(tab.id as any)}
                            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-white text-sky-600 shadow-md border border-slate-100 font-bold'
                                : 'text-slate-505 hover:text-slate-700 hover:bg-white/40'
                            }`}
                          >
                            <span className="text-xs">{tab.label}</span>
                            <span className="text-[9px] text-slate-400 font-normal mt-0.5">{tab.desc}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab content 1: PRESETS Grid selection */}
                    {editImageSourceType === 'preset' && (
                      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100/60 max-h-[140px] overflow-y-auto">
                        {PRESET_IMAGES.map((preset) => {
                          const isSel = selectedEditPresetUrl === preset.url;
                          return (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => setSelectedEditPresetUrl(preset.url)}
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                                isSel ? 'border-sky-500 ring-2 ring-sky-100 scale-[0.96]' : 'border-slate-200/20 hover:border-slate-300'
                              }`}
                              title={preset.name}
                            >
                              <img 
                                src={preset.url} 
                                alt={preset.name} 
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                <p className="text-[8px] font-bold text-white leading-tight truncate text-center capitalize">{preset.name}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Tab content 2: Direct local File Upload Area */}
                    {editImageSourceType === 'upload' && (
                      <div 
                        onDragOver={handleEditDragOver}
                        onDragLeave={handleEditDragLeave}
                        onDrop={handleEditDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[110px] cursor-pointer ${
                          editDragOver ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input 
                          type="file" 
                          id="edit-menu-file-upload-input" 
                          accept="image/*" 
                          onChange={handleEditFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[0px]"
                        />
                        {uploadedEditImageBase64 ? (
                          <div className="flex items-center gap-3">
                            <img src={uploadedEditImageBase64} className="h-12 w-12 rounded-xl object-cover border border-slate-200" alt="Uploaded Thumbnail" />
                            <div className="text-left">
                              <p className="text-xs font-semibold text-slate-800">File Baru Terunggah!</p>
                              <p className="text-[10px] text-sky-600 font-bold underline">Klik / Seret untuk mengganti</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="h-6 w-6 text-slate-400 mx-auto stroke-[2]" />
                            <p className="text-xs font-semibold text-slate-600">Seret gambar baru ke sini, atau <span className="text-sky-500 underline">pilih file</span></p>
                            <p className="text-[9px] text-slate-400">Format PNG, JPG, WEBP (Maksimal 2MB)</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab content 3: Direct URL pasting */}
                    {editImageSourceType === 'url' && (
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                          <LinkIcon className="h-4 w-4" />
                        </span>
                        <input
                          type="url"
                          value={customEditImageUrl}
                          onChange={(e) => setCustomEditImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
                          className="w-full text-xs md:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button row */}
                <div className="flex gap-3 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 text-xs md:text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs md:text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl cursor-pointer shadow-md shadow-sky-100 transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" id="delete-confirmation-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6"
              id="delete-confirmation-modal-body"
            >
              {/* Warning Header */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-sm shadow-rose-50">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-800">Hapus Menu Kuliner?</h2>
                  <p className="text-xs text-slate-400 mt-1">Tindakan ini tidak bisa dibatalkan secara permanen</p>
                </div>
              </div>

              {/* Box Info Item */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-200/40">
                <img 
                  src={deletingItem.image} 
                  alt={deletingItem.name} 
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
                  }}
                />
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{deletingItem.name}</p>
                  <p className="text-[11px] font-medium text-slate-400 capitalize">{deletingItem.category} • <span className="font-mono text-sky-600 font-bold">{formatRupiah(deletingItem.price)}</span></p>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center leading-relaxed">
                Menghapus menu ini akan menghilangkannya secara otomatis dari daftar menu dan juga mengeluarkannya dari keranjang pesanan aktif saat ini.
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="flex-1 py-3 text-xs md:text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="flex-1 py-3 text-xs md:text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl cursor-pointer shadow-md shadow-rose-100 transition-colors"
                >
                  Ya, Hapus Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
