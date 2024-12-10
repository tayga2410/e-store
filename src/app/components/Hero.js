"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/hero")
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .catch((err) => console.error("Failed to fetch banners:", err));
  }, []);

  if (!banners.length) {
    return <div>Loading Hero Section...</div>;
  }

  return (
    <section>
      <div className="hero-container">
        <div className="hero-main-banner">
          <img
            src={banners.find((banner) => banner.position === 1)?.url}
            alt="Main Banner"
          />
        </div>
        <div className="hero-banner-wrapper">
          <div className="hero-banner-group">
            <div className="hero-banner-group-first">
            <img
              src={banners.find((banner) => banner.position === 2)?.url}
              alt="Group Banner 2"
            />
            </div>

            <div className="sub-banner-container">
              {banners
                .filter(
                  (banner) => banner.position === 3 || banner.position === 4
                )
                .map((banner) => (
                  <img
                    key={banner.id}
                    className="sub-banner"
                    src={banner.url}
                    alt={`Group Sub-Banner ${banner.position}`}
                  />
                ))}
            </div>
          </div>

          <div className="hero-solo-banner">
            <img
              src={banners.find((banner) => banner.position === 5)?.url}
              alt="Solo Banner"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
