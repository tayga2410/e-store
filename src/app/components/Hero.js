'use client';

import { useEffect, useState } from 'react';

export default function HeroSection() {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/api/hero')
            .then((res) => res.json())
            .then((data) => setBanners(data))
            .catch((err) => console.error('Failed to fetch banners:', err));
    }, []);

    if (!banners.length) {
        return <div>Loading Hero Section...</div>;
    }

    return (
        <section>
            <div className="hero-container">
                <div className="hero-main-banner">
                    <img src={banners.find((banner) => banner.position === 1)?.url} alt="Main Banner" />
                </div>

                <div className="hero-banner-group">
                    {banners
                        .filter((banner) => banner.position >= 2 && banner.position <= 4)
                        .map((banner) => (
                            <img key={banner.id} src={banner.url} alt={`Group Banner ${banner.position}`} />
                        ))}
                </div>

                <div className="hero-solo-banner">
                    <img src={banners.find((banner) => banner.position === 5)?.url} alt="Solo Banner" />
                </div>
            </div>
        </section>
    );
}
