import '../../styles/main.scss'
import { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
    return (
                <main>
                {children}
                </main>
    );
}