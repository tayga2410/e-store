'use client';

import { useEffect, useState } from 'react';

type Banner = {
    id: number;
    url: string;
    position: number;
};

export default function HeroEditor() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [position, setPosition] = useState<number>(0);

    const fetchBanners = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/hero');
            const data: Banner[] = await res.json();
            setBanners(data);
        } catch (err) {
            console.error('Failed to fetch banners:', err);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleUpdate = async (id: number, url: string) => {
        try {
            await fetch(`http://localhost:4000/api/hero/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ url }),
            });
            fetchBanners(); // Обновляем данные с сервера
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async () => {
        if (!file || !position) {
            alert('Please select a file and set a position.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('position', position.toString());

        try {
            const res = await fetch('http://localhost:4000/api/hero/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (res.ok) {
                await fetchBanners(); // Обновляем данные после загрузки
            }
        } catch (err) {
            console.error('Error uploading banner:', err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:4000/api/hero/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                await fetchBanners(); // Обновляем данные после удаления
            }
        } catch (err) {
            console.error('Error deleting banner:', err);
        }
    };

    return (
        <div>
            <h2>Manage Hero Banners</h2>
            <div className="banners-wrapper">
                {banners.map((banner) => (
                    <div className="banner-container" key={banner.id}>
                        <img className="cabinet-img" src={banner.url} alt={`Banner ${banner.position}`} />
                        <input
                            type="text"
                            defaultValue={banner.url}
                            onBlur={(e) => handleUpdate(banner.id, e.target.value)}
                        />
                        <button onClick={() => handleDelete(banner.id)}>Delete Banner</button>
                    </div>
                ))}
            </div>
            <h3>Upload New Banner</h3>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*"
            />
            <input
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                placeholder="Position"
            />
            <button onClick={handleUpload}>Upload Banner</button>
        </div>
    );
}
