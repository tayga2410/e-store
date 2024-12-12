'use client';
import { useCart } from '@/app/context/CartContext';

export default function CartSummary() {
  const { cartItems } = useCart();

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price ?? 0; 
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="cart-summary">
      <h2>Итого</h2>
      <p>Сумма товаров: ${subtotal.toFixed(2)}</p>
      <button>Перейти к оплате</button>
    </div>
  );
}
