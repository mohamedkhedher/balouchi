'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Lock } from 'lucide-react';
import Link from 'next/link';

export default function NewCashierPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/stores')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStores(data);
            })
            .catch(console.error);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            storeId: formData.get('storeId'),
        };

        try {
            const res = await fetch('/api/admin/cashiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Failed to create cashier');
            }

            router.push('/admin/settings/users');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <Link href="/admin/settings/users" className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
                <ArrowLeft size={16} className="mr-1" />
                Back to Cashiers
            </Link>

            <div className="bg-white rounded-lg shadow-sm border p-8">
                <h1 className="text-2xl font-bold mb-6">Add New Cashier</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="cashier@store.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Assign Store</label>
                        <select
                            name="storeId"
                            className="block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            required
                        >
                            <option value="">-- Select Store --</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            <span>Create Account</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
