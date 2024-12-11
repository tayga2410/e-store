'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_type: string;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_featured?: boolean;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'bestseller' | 'new' | 'featured' | 'all'>('all');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000');

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'products') {
        setProducts(message.data as Product[]);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'bestseller') return product.is_bestseller;
    if (activeTab === 'new') return product.is_new;
    if (activeTab === 'featured') return product.is_featured;
    return true;
  });

  return (
    <section className="products">
      <h1>Available Products</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'active' : ''}>
          All Products
        </button>
        <button onClick={() => setActiveTab('bestseller')} className={activeTab === 'bestseller' ? 'active' : ''}>
          Bestseller
        </button>
        <button onClick={() => setActiveTab('new')} className={activeTab === 'new' ? 'active' : ''}>
          New Arrivals
        </button>
        <button onClick={() => setActiveTab('featured')} className={activeTab === 'featured' ? 'active' : ''}>
          Featured Products
        </button>
      </div>
      <div className="product-wrapper">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image_url} alt={product.name} />
              <p>{product.name}</p>
              <p>Price: ${product.price}</p>
              <p>Category: {product.category_type}</p>
            </div>
          ))
        ) : (
          <p>No products available for this tab.</p>
        )}
      </div>
    </section>
  );
}
