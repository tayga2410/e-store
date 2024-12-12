'use client';
import { useCart } from '@/app/context/CartContext'; 
import CartItem from '@/app/components/Cart/CartItem'; 
import CartSummary from '@/app/components/Cart/CartSummary'; 

export default function CartPage() {
  const { cartItems } = useCart();

  return (
    <div className="cart-page">
      <h1>Shopping cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty </p>
      ) : (
        <>
          {cartItems.map((item) => (
            <CartItem
            key={item.product_id}
            item={{
              ...item,
              name: item.name ?? 'No name',
            }}
          />
          ))}
          <CartSummary />
        </>
      )}
    </div>
  );
}
