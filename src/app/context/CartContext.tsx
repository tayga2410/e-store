'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  product_id: number;
  name?: string;
  price?: number;
  quantity: number;
  image_url?: string;
};

const CartContext = createContext<{
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (product_id: number) => void;
  updateQuantity: (product_id: number, quantity: number) => void;
} | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    setCartItems(savedCart);
  }, []);

  const saveCart = (cart: CartItem[]) => {
    setCartItems(cart);
    localStorage.setItem('guestCart', JSON.stringify(cart));
  };

  const addToCart = (item: CartItem) => {
    const existing = cartItems.find((i) => i.product_id === item.product_id);
    if (existing) {
      saveCart(
        cartItems.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      saveCart([...cartItems, item]);
    }
  };

  const removeFromCart = (product_id: number) => {
    saveCart(cartItems.filter((item) => item.product_id !== product_id));
  };

  const updateQuantity = (product_id: number, quantity: number) => {
    saveCart(
      cartItems.map((item) =>
        item.product_id === product_id ? { ...item, quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
