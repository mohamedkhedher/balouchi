import { LogOut, ScanBarcode, History } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/auth';

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <ScanBarcode className="text-blue-600" />
                    <span className="font-bold text-gray-900">Balouchi Cashier</span>
                </div>
                <form action={async () => {
                    'use server';
                    await logout();
                }}>
                    <button type="submit" className="text-gray-500 hover:text-red-600">
                        <LogOut size={20} />
                    </button>
                </form>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-2 safe-area-pb">
                <Link href="/cashier" className="flex flex-col items-center text-blue-600">
                    <ScanBarcode size={24} />
                    <span className="text-xs font-medium mt-1">Scanner</span>
                </Link>
                <Link href="/cashier/history" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                    <History size={24} />
                    <span className="text-xs font-medium mt-1">History</span>
                </Link>
            </nav>
        </div>
    );
}
