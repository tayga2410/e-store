'use client';

import { useState, useEffect } from 'react';

// Типы для продуктов и категорий
type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_featured?: boolean;
};

type Category = {
  id: number;
  name: string;
  type: string;
  icon_url: string;
};

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Загрузка продуктов и категорий при монтировании
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/products');
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreateProduct = async () => {
    if (!name || !price || !categoryId || !file) {
      alert('Please fill in all fields');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', Number(price).toFixed(2));
    formData.append('category_id', categoryId);
    formData.append('image', file);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/products/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert('Product created successfully');
        fetchProducts();
        setName('');
        setPrice('');
        setCategoryId('');
        setFile(null);
      } else {
        const error = await res.json();
        alert(`Failed to create product: ${error.message}`);
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Product deleted successfully');
        fetchProducts();
      } else {
        const error = await res.json();
        alert(`Failed to delete product: ${error.message}`);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleToggleFlag = async (id: number, flag: string, value: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [flag]: value }),
      });

      if (res.ok) {
        alert('Product updated successfully');
        fetchProducts();
      } else {
        const error = await res.json();
        alert(`Failed to update product: ${error.message}`);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  return (
    <div>
      <h1>Manage Products</h1>

      <div>
        <h2>Create New Product</h2>
        <div className="product-cabinet-container">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button onClick={handleCreateProduct} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Add Product'}
          </button>
        </div>
      </div>

      <div>
        <h2>Existing Products</h2>
        <div className="cabinet-product-wrapper">
          {products.map((product) => (
            <div key={product.id} className="product-card product-item">
              <img src={product.image_url} alt={product.name} width="100%" />
              <p>{product.name}</p>
              <p>Price: ${product.price}</p>
              <p>Category: {categories.find((c) => c.id === product.category_id)?.name || 'Unknown'}</p>
              <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
              <button
                onClick={() => handleToggleFlag(product.id, 'is_bestseller', !product.is_bestseller)}
              >
                {product.is_bestseller ? 'Remove from Bestseller' : 'Mark as Bestseller'}
              </button>
              <button
                onClick={() => handleToggleFlag(product.id, 'is_new', !product.is_new)}
              >
                {product.is_new ? 'Remove from New Arrivals' : 'Mark as New Arrival'}
              </button>
              <button
                onClick={() => handleToggleFlag(product.id, 'is_featured', !product.is_featured)}
              >
                {product.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
