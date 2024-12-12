'use client';

import { useState, useEffect } from 'react';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Новый стейт для редактируемого продукта

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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setCategoryId(product.category_id.toString());
  };

  const handleUpdateProduct = async () => {
    if (!name || !price || !categoryId) {
      alert('Please fill in all fields');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsLoading(true);

    const updatedProduct = {
      id: editingProduct?.id,
      name,
      price: Number(price).toFixed(2),
      category_id: categoryId,
    };

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/products/${editingProduct?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (res.ok) {
        alert('Product updated successfully');
        fetchProducts();
        setEditingProduct(null); // Закрываем форму редактирования
      } else {
        const error = await res.json();
        alert(`Failed to update product: ${error.message}`);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
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

      {editingProduct ? (
        <div>
          <h2>Edit Product</h2>
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

            <button onClick={handleUpdateProduct} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Update Product'}
            </button>
            <button onClick={() => setEditingProduct(null)}>Cancel</button>
          </div>
        </div>
      ) : (
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
      )}

      <div className='products__container'>
        <h2>Existing Products</h2>
        <div className="products__wrapper">
          {products.map((product) => (
            <div key={product.id} className="products__card products__card--cabinet-card">
              <img className='products__card-image' src={product.image_url} alt={product.name} width="100%" />
              <p className='products__card-title'>{product.name}</p>
              <p className="products__card-price">${product.price ? Number(product.price).toFixed(0) : '0'}</p>
              <p className='products__category'>Category: {categories.find((c) => c.id === product.category_id)?.name || 'Unknown'}</p>
              <button className='products__cabinet-button' onClick={() => handleDeleteProduct(product.id)}>Delete</button>
              <button className='products__cabinet-button' onClick={() => handleEditProduct(product)}>Edit</button>
              <button className='products__cabinet-button'
                onClick={() => handleToggleFlag(product.id, 'is_bestseller', !product.is_bestseller)}
              >
                {product.is_bestseller ? 'Remove from Bestseller' : 'Mark as Bestseller'}
              </button>
              <button className='products__cabinet-button'
                onClick={() => handleToggleFlag(product.id, 'is_new', !product.is_new)}
              >
                {product.is_new ? 'Remove from New Arrivals' : 'Mark as New Arrival'}
              </button>
              <button className='products__cabinet-button'
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
