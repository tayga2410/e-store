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

    useEffect(() => {
        fetch('http://localhost:4000/api/hero')
            .then((res) => res.json())
            .then((data: Banner[]) => setBanners(data))
            .catch((err) => console.error('Failed to fetch banners:', err));
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
            alert('Banner updated successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to update banner');
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
                const newBanner = await res.json();
                setBanners((prev) => [...prev, newBanner]);
                alert('Banner uploaded successfully');
                setFile(null);
                setPosition(0);
            } else {
                alert('Failed to upload banner');
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
                setBanners((prev) => prev.filter((b) => b.id !== id));
                alert('Banner deleted successfully');
            } else {
                alert('Failed to delete banner');
            }
        } catch (err) {
            console.error('Error deleting banner:', err);
        }
    };

    return (
        <div>
            <h2>Manage Hero Banners</h2>
            {banners.map((banner) => (
                <div key={banner.id}>
                    <img className='cabinet-img' src={banner.url} alt={`Banner ${banner.position}`} />
                    <input
                        type="text"
                        value={banner.url}
                        onChange={(e) =>
                            setBanners((prev) =>
                                prev.map((b) =>
                                    b.id === banner.id ? { ...b, url: e.target.value } : b
                                )
                            )
                        }
                        placeholder="Update Banner URL"
                    />
                    <button onClick={() => handleUpdate(banner.id, banner.url)}>Update Banner</button>
                    <button onClick={() => handleDelete(banner.id)}>Delete Banner</button>
                </div>
            ))}

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
