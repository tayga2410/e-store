'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import Breadcrumb from '@/app/components/BreadCrumb';

type Product = {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category_id: number;
};

export default function Catalog() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');
    const categoryName = searchParams.get('categoryName') || 'Catalog';
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [categoryId]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/products?category=${categoryId || ''}`);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setIsLoading(false);
        }
    };

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
        <section className="catalog">
            <Breadcrumb />

            <div className="products__wrapper">
                {isLoading ? (
                    <p>Loading...</p>
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="products__card">
                            <button
                                onClick={() => handleWishlistToggle(product)}
                                className="wishlist-button"
                            >
                                <img
                                    src={wishlist.some((item) => item.product_id === product.id) ? '/like-red.svg' : '/like.svg'}
                                    alt="Wishlist Icon"
                                    width={24}
                                    height={24}
                                />
                            </button>
                            <img className="products__card-image" src={product.image_url || ''} alt={product.name || 'No Name'} />
                            <h3 className="products__card-title">{product.name || 'Unnamed Product'}</h3>
                            <p className="products__card-price">Price: ${product.price || '0.00'}</p>
                            <button onClick={() => handleAddToCart(product)}>Add to Cart</button>

                        </div>
                    ))
                ) : (
                    <p>No products available for this category.</p>
                )}
            </div>
        </section>
    );
}
