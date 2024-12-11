'use client';

import { useState, useEffect } from 'react';

type Product = {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category_type: string;
};

type Category = {
    id: number;
    name: string;
    type: string;
};

export default function Catalog() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState({
        category: '',
        sort: '',
        minPrice: '',
        maxPrice: '',
    });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters, pagination.page]);

    const fetchProducts = async () => {
        setIsLoading(true);

        const queryParams = new URLSearchParams({
            category: filters.category,
            sort: filters.sort,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            page: pagination.page.toString(),
        });

        try {
            const res = await fetch(`http://localhost:4000/api/catalog?${queryParams.toString()}`);
            const data = await res.json();

            console.log('Raw data from API:', data);
            console.log('Current category filter:', filters.category);



            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data.products && Array.isArray(data.products)) {
                setProducts(data.products);
            } else {
                console.warn('Unexpected data format:', data);
                setProducts([]);
            }

            setPagination((prev) => ({
                ...prev,
                totalPages: data.totalPages || 1,
            }));
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/categories');
            const data = await res.json();
            console.log('Fetched categories:', data);
            setCategories(data || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            console.log('Page change:', newPage);
            setPagination((prev) => ({ ...prev, page: newPage }));
        }
    };

    return (
        <section className="catalog">
            <h1>Catalog</h1>

            <div className="filters">
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.type}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
                <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="new">New Arrivals</option>
                </select>
            </div>

            <div className="products">
                {isLoading ? (
                    <p>Loading...</p>
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-card">
                            <img src={product.image_url || ''} alt={product.name || 'No Name'} />
                            <h3>{product.name || 'Unnamed Product'}</h3>
                            <p>Price: ${product.price || '0.00'}</p>
                            <p>Category: {product.category_type || 'Unknown'}</p>
                        </div>
                    ))
                ) : (
                    <p>No products available for this category.</p>
                )}
            </div>


            <div className="pagination">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
                    Previous
                </button>
                <span>
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                >
                    Next
                </button>
            </div>
        </section>
    );
}
