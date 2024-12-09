import { ReactNode } from 'react';

export const metadata = {
    title: 'E-store for you',
    description: 'Best choices for the market',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                {children} 
            </body>
        </html>
    );
}