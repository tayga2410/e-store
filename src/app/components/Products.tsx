'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/app/context/WebSocketProvider';
import { useProducts, Product } from '@/app/context/ProductContext';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';

export default function Products() {
  const { socket, isConnected } = useWebSocket();
  const { products, setProducts } = useProducts();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'bestseller' | 'new' | 'featured' | 'all'>('all');

  useEffect(() => {
    if (socket && isConnected) {
      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === 'products') {
          setProducts(message.data);
        }
      };

      socket.addEventListener('message', handleMessage);

      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    } else {
      fetchProducts();
    }
  }, [socket, isConnected, setProducts]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'bestseller') return product.is_bestseller;
    if (activeTab === 'new') return product.is_new;
    if (activeTab === 'featured') return product.is_featured;
    return true;
  });

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    });
  };

  const handleWishlistToggle = (product: Product) => {
    const isInWishlist = wishlist.some((item) => item.product_id === product.id);

    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: Date.now(),
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
    }
  };

  return (
    <section className="products">
      <h1 className="visually-hidden">Available Products</h1>
      <div className="products__tabs">
        {['all', 'bestseller', 'new', 'featured'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`products__tabs-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="products__wrapper">
        {filteredProducts.map((product) => {
          const isInWishlist = wishlist.some((item) => item.product_id === product.id);

          return (
            <div key={product.id} className="products__card">
              <button
                onClick={() => handleWishlistToggle(product)}
                className={`wishlist-button ${isInWishlist ? 'active' : ''}`}
              >
                <img
                  src={isInWishlist ? '/like-red.svg' : '/like.svg'}
                  alt={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  width={24}
                  height={24}
                />
              </button>
              <img
                className="products__card-image"
                src={product.image_url}
                alt={product.name}
              />
              <p className="products__card-title">{product.name}</p>
              <p className="products__card-price">${product.price ? Number(product.price).toFixed(0) : '0'}</p>
              <button
                className="products__card-button"
                onClick={() => handleAddToCart(product)}
              >
                Buy now
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
