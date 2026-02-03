'use client';

import { useEffect, useState } from 'react';
import { Plus, User, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CashiersPage() {
    const [cashiers, setCashiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/cashiers')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setCashiers(data);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Cashiers</h1>
                <Link href="/admin/settings/users/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
                    <Plus size={20} />
                    <span>Add Cashier</span>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Store</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cashiers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <User className="text-gray-400 mr-2" size={16} />
                                        <span className="text-sm font-medium text-gray-900">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.managedStore ? (
                                        <div className="flex items-center">
                                            <MapPin className="text-gray-400 mr-1" size={14} />
                                            {user.managedStore.name} <span className="text-xs text-gray-400 ml-1">({user.managedStore.city})</span>
                                        </div>
                                    ) : <span className="text-red-500 text-xs">Unassigned</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {cashiers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    No cashiers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
