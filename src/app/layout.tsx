import { ReactNode } from 'react';
import '../styles/main.scss';
import Header from './components/Header'
import { CartProvider } from './context/CartContext';
import { WebSocketProvider } from './context/WebSocketProvider';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { WishlistProvider } from './context/WishlistContext';

export const metadata = {
    title: 'E-store for you',
    description: 'Best choices for the market',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.googleapis.com/css2?family=Jura:wght@300..700&display=swap" rel="stylesheet"></link>
            </head>
            <body>
                <Header />
                <main>
                    <WebSocketProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <ProductProvider>
                                    <CategoryProvider>{children}</CategoryProvider>
                                </ProductProvider>
                            </WishlistProvider>
                        </CartProvider>
                    </WebSocketProvider>
                </main>

            </body>
        </html>
    );
}