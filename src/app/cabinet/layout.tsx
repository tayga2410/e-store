import '../../styles/main.scss'
import { ReactNode } from 'react';

export default function CabinetLayout({ children }: { children: ReactNode }) {
    return (
        <main>
            {children}
        </main>
    );
}