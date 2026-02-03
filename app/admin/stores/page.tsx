'use client';

import { useEffect, useState } from 'react';
import { Plus, MapPin, Store as StoreIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    _count: {
        offers: number;
        reservations: number;
    };
}

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/stores')
            .then((res) => {
                if (res.status === 401) {
                    router.push('/admin/login');
                    return [];
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setStores(data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Stores</h1>
                <Link href="/admin/stores/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
                    <Plus size={20} />
                    <span>Add Store</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <div key={store.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <StoreIcon className="text-blue-600" size={24} />
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                Active
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{store.name}</h3>

                        <div className="flex items-center text-gray-500 mb-4 text-sm">
                            <MapPin size={16} className="mr-1" />
                            {store.address}, {store.city}
                        </div>

                        <div className="border-t pt-4 flex justify-between text-sm text-gray-600">
                            <div>
                                <span className="font-bold text-gray-900">{store._count.offers}</span> Offers
                            </div>
                            <div>
                                <span className="font-bold text-gray-900">{store._count.reservations}</span> Reservations
                            </div>
                        </div>
                    </div>
                ))}

                {stores.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        <StoreIcon className="mx-auto mb-3 opacity-20" size={48} />
                        <p>No stores found. Create your first store!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
