'use client';

import Hero from '../app/components/Hero';
import Category from '../app/components/Category.tsx';
import Products from '../app/components/Products.tsx';


export default function MainPage() {

    return (
        <div>
            <Hero />
            <Category />
            <Products />
        </div>
    );
}