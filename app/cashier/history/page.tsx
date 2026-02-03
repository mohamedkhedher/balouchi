'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, Package } from 'lucide-react';

export default function CashierHistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/cashier/history')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setHistory(data);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="mr-2 text-blue-600" />
                Recent Pickups
            </h1>

            <div className="space-y-4">
                {history.map((record) => (
                    <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="font-medium text-gray-900">{record.consumer.email}</div>
                            <span className="text-xs text-gray-500">
                                {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-2 rounded-lg text-sm text-gray-600">
                            <ul>
                                {record.items.map((item: any) => (
                                    <li key={item.id} className="flex justify-between">
                                        <span>{item.offer.product.name}</span>
                                        <span className="font-bold">x{item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end items-center text-xs text-green-600 font-medium">
                            <CheckCircle size={14} className="mr-1" />
                            Confirmed
                        </div>
                    </div>
                ))}

                {history.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        No pickup history yet.
                    </div>
                )}
            </div>
        </div>
    );
}
