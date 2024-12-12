'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: number;
  category_type: string;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_featured?: boolean;
};

type ProductContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
