'use client';

import { useEffect, useState } from 'react';

export default function BrowseByCategory() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000');
  
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
  
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'categories') {
        setCategories(message.data);
      }
    };
  
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
  
    return () => {
      socket.close(); 
    };
  }, []);
  

  return (
    <section className="category">
      <h1>Browse by category</h1>
      <div className="category-wrapper">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <img src={category.icon_url} alt={category.name} />
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
