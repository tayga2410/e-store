'use client';

import { useCart } from '@/app/context/CartContext'; 

type CartItemProps = {
  item: {
    product_id: number;
    name?: string;
    price?: number;
    quantity: number;
    image_url?: string;
  };
};

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart(); 

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product_id, item.quantity - 1); 
    } else {
      removeFromCart(item.product_id); 
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.product_id, item.quantity + 1); 
  };

  const handleRemove = () => {
    removeFromCart(item.product_id); 
  };

  return (
    <div className="cart-item">
      <img src={item.image_url} alt={item.name || 'Товар'} width={50} height={50} />
      <div>
        <h3>{item.name || 'Без названия'}</h3>
        <p>Цена: ${item.price ? Number(item.price).toFixed(2) : '0.00'}</p>
        <div className="quantity-controls">
          <button onClick={handleDecrease}>-</button>
          <span>{item.quantity}</span>
          <button onClick={handleIncrease}>+</button>
        </div>
        <button onClick={handleRemove} className="remove-btn">
          Удалить
        </button>
      </div>
    </div>
  );
}
