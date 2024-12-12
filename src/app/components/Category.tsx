'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/app/context/WebSocketProvider';
import { useCategories } from '@/app/context/CategoryContext';

type Category = {
  id: number;
  name: string;
  icon_url: string;
};

export default function Category() {
  const router = useRouter(); // Для маршрутизации
  const { socket, isConnected } = useWebSocket();
  const { categories, setCategories } = useCategories();

  useEffect(() => {
    if (socket && isConnected) {
      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === 'categories') {
          setCategories(message.data);
        }
      };

      socket.addEventListener('message', handleMessage);

      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    } else {
      fetchCategories();
    }
  }, [socket, isConnected, setCategories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  return (
    <section className="category">
      <h1>Browse by category</h1>
      <div className="category-wrapper">
        {categories.map((category) => (
          <button
            key={category.id}
            className="category-card"
            onClick={() =>
              router.push(`/catalog?category=${category.id}&categoryName=${encodeURIComponent(category.name)}`)
            }
          >
            <img src={category.icon_url} alt={category.name} />
            <p>{category.name}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
