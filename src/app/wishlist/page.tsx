'use client';

import { useWishlist } from '@/app/context/WishlistContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <section className="wishlist">
      <h1>Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="wishlist__wrapper">
          {wishlist.map((item) => (
            <div key={item.product_id} className="wishlist__item">
              <img
                className="wishlist__item-image"
                src={item.image_url}
                alt={item.name}
                width={100}
                height={100}
              />
              <div className="wishlist__item-details">
                <h3 className="wishlist__item-title">{item.name}</h3>
                <p>Цена: ${item.price ? Number(item.price).toFixed(2) : '0.00'}</p>
                <button
                  className="wishlist__item-remove"
                  onClick={() => removeFromWishlist(item.product_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
