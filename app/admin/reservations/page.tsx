'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Receipt, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for status colors
function getStatusColor(status: string) {
    switch (status) {
        case 'ACTIVE': return 'bg-green-100 text-green-800';
        case 'PICKED_UP': return 'bg-blue-100 text-blue-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        case 'EXPIRED': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/reservations')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setReservations(data);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Reservations</h1>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reservations.map((res) => (
                                <tr key={res.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                                        {res.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {res.consumer.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {res.store.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(res.status))}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <ul className="text-sm text-gray-600 list-disc list-inside">
                                            {res.items.map((item: any) => (
                                                <li key={item.id}>
                                                    {item.quantity}x {item.offer.product.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(res.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {reservations.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No reservations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
