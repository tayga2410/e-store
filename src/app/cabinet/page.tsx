'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ManageUsers from './ManageUsers';
import HeroEditor from './HeroEditor';
import ManageCategories from './ManageCategories';
import ManageProducts from './ManageProducts';
import CartPage from '@/app/cart/page'; // Подключаем компонент корзины

export default function Cabinet() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'banners' | 'categories' | 'products'>('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth');
            return;
        }

        const userRole = parseJwt(token)?.role;
        if (!userRole) {
            router.push('/auth');
            return;
        }

        setRole(userRole);

        // Если роль пользователя — user, перенаправляем в корзину
        if (userRole === 'user') {
            router.push('/cart'); // Убедитесь, что этот маршрут существует
        }

        setLoading(false);
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="cabinet">
            <h1>Cabinet</h1>
            {role === 'superadmin' && (
                <SuperAdminCabinet activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
            {role === 'editor' && (
                <EditorCabinet activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
        </div>
    );
}

function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

type CabinetProps = {
    activeTab: 'users' | 'banners' | 'categories' | 'products';
    setActiveTab: (tab: 'users' | 'banners' | 'categories' | 'products') => void;
};

function SuperAdminCabinet({ activeTab, setActiveTab }: CabinetProps) {
    return (
        <div className="vertical-tabs">
            <div className="tabs">
                <button
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button
                    className={activeTab === 'banners' ? 'active' : ''} 
                    onClick={() => setActiveTab('banners')}
                >
                    Manage Banners
                </button>
                <button
                    className={activeTab === 'categories' ? 'active' : ''} 
                    onClick={() => setActiveTab('categories')}
                >
                    Manage Categories
                </button>
                <button
                    className={activeTab === 'products' ? 'active' : ''} 
                    onClick={() => setActiveTab('products')}
                >
                    Manage Products
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'users' && <ManageUsers />}
                {activeTab === 'banners' && <HeroEditor />}
                {activeTab === 'categories' && <ManageCategories />}
                {activeTab === 'products' && <ManageProducts />}
            </div>
        </div>
    );
}

function EditorCabinet({ activeTab, setActiveTab }: CabinetProps) {
    return (
        <div className="vertical-tabs">
            <div className="tabs">
                <button
                    className={activeTab === 'banners' ? 'active' : ''} 
                    onClick={() => setActiveTab('banners')}
                >
                    Manage Banners
                </button>
                <button
                    className={activeTab === 'categories' ? 'active' : ''} 
                    onClick={() => setActiveTab('categories')}
                >
                    Manage Categories
                </button>
                <button
                    className={activeTab === 'products' ? 'active' : ''} 
                    onClick={() => setActiveTab('products')}
                >
                    Manage Products
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'banners' && <HeroEditor />}
                {activeTab === 'categories' && <ManageCategories />}
                {activeTab === 'products' && <ManageProducts />}
            </div>
        </div>
    );
}
