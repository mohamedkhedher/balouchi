import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { getSession, logout } from '@/lib/auth';

export default async function ConsumerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Balouchi
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <Link href="/reservations" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                    My Reservations
                                </Link>
                                <form action={async () => {
                                    'use server';
                                    await logout();
                                }}>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <LogOut size={18} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Balouchi Market. Save Food, Save Money.
                </div>
            </footer>
        </div>
    );
}
