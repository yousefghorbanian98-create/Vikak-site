'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import CartDrawer from './cart-drawer';
export type CartLine = {
  key: string;
  productId: string;
  productSlug: string;
  variantId: string;
  title: string;
  variantLabel: string;
  roaster: string;
  price: number;
  qty: number;
  image: string;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  add: (line: Omit<CartLine, 'key' | 'qty'>, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'vikak.cart.v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      /* corrupt storage — start clean */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage full or blocked */
    }
  }, [lines, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const flash = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback<CartContextValue['add']>(
    (line, qty = 1) => {
      const key = `${line.productId}::${line.variantId}`;
      setLines(prev => {
        const existing = prev.find(l => l.key === key);
        if (existing) {
          return prev.map(l => (l.key === key ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { ...line, key, qty }];
      });
      flash('به سبد خرید اضافه شد');
    },
    [flash],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setLines(prev =>
      qty <= 0 ? prev.filter(l => l.key !== key) : prev.map(l => (l.key === key ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines(prev => prev.filter(l => l.key !== key));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
    return {
      lines,
      count,
      subtotal,
      isOpen,
      add,
      setQty,
      remove,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [lines, isOpen, add, setQty, remove]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
