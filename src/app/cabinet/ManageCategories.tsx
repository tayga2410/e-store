'use client';

import { useState, useEffect } from 'react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreateCategory = async () => {
    if (!name || !type || !file) {
      alert('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('image', file);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/categories/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert('Category created successfully');
        fetchCategories(); 
      } else {
        const error = await res.json();
        alert(`Failed to create category: ${error.message}`);
      }
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };


  const handleDeleteCategory = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Category deleted successfully');
        fetchCategories(); 
      } else {
        const error = await res.json();
        alert(`Failed to delete category: ${error.message}`);
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div>
      <h1>Manage Categories</h1>

      <div>
        <h2>Create New Category</h2>
        <div className='category-cabinet-container'>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleCreateCategory}>Add Category</button>
        </div>
      </div>

      <div>
        <h2>Existing Categories</h2>
        <div className='cabinet-category-wrapper'>
        {categories.map((category: { id: number; name: string; icon_url: string }) => (
          <div key={category.id} className="category-card category-item">
            <img src={category.icon_url} alt={category.name} width='{100%}' />
            <p>{category.name}</p>
            <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
