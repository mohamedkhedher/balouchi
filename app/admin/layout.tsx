import Link from 'next/link';
import { ShoppingBag, LayoutDashboard, Store, Users, LogOut, Package } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Balouchi Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/stores" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Store size={20} />
                        <span>Stores</span>
                    </Link>
                    <Link href="/admin/products" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Package size={20} />
                        <span>Products</span>
                    </Link>
                    <Link href="/admin/offers" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <ShoppingBag size={20} />
                        <span>Offers</span>
                    </Link>
                    <Link href="/admin/reservations" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Users size={20} />
                        <span>Reservations</span>
                    </Link>
                    <Link href="/admin/settings/users" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Users size={20} />
                        <span>Cashiers</span>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <form action={async () => {
                        'use server';
                        await logout();
                    }}>
                        <button type="submit" className="flex w-full items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}
