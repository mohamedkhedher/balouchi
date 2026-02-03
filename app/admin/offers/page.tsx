'use client';

import { useEffect, useState } from 'react';
import { Plus, ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Helper for status colors
function getStatusColor(status: string) {
    switch (status) {
        case 'LIVE': return 'bg-green-100 text-green-800';
        case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
        case 'SOLD_OUT': return 'bg-red-100 text-red-800';
        case 'EXPIRED': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-800';
    }
}

interface Offer {
    id: string;
    originalPrice: number;
    discountedPrice: number;
    quantityTotal: number;
    quantityAvailable: number;
    status: string;
    dlcDate: string;
    product: { name: string; imageUrl: string };
    store: { name: string };
    _count: { reservationItems: number };
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/offers')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setOffers(data);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Offers</h1>
                <Link href="/admin/offers/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
                    <Plus size={20} />
                    <span>New Offer</span>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DLC</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {offers.map((offer) => (
                            <tr key={offer.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                                            {offer.product.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img className="h-10 w-10 object-cover" src={offer.product.imageUrl} alt="" />
                                            ) : (
                                                <ShoppingBag className="h-6 w-6 m-2 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{offer.product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {offer.store.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-bold">TND {offer.discountedPrice}</div>
                                    <div className="text-xs text-gray-500 line-through">TND {offer.originalPrice}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(offer.status))}>
                                        {offer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="font-medium text-gray-900">{offer.quantityAvailable} / {offer.quantityTotal}</div>
                                    <div className="text-xs">{offer._count.reservationItems} reserved</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(offer.dlcDate).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {offers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No offers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
