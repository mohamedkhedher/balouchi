'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewOfferPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [stores, setStores] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Form State defaults
    const [formData, setFormData] = useState({
        storeId: '',
        productId: '',
        originalPrice: '',
        discountedPrice: '',
        quantityTotal: '10',
        dlcDate: '',
        startsAt: new Date().toISOString().slice(0, 16), // datetime-local format
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });

    useEffect(() => {
        // Fetch dependencies
        Promise.all([
            fetch('/api/stores').then(res => res.json()),
            fetch('/api/products').then(res => res.json())
        ]).then(([storesData, productsData]) => {
            if (Array.isArray(storesData)) setStores(storesData);
            if (Array.isArray(productsData)) setProducts(productsData);

            // Auto select first if available
            if (storesData.length > 0) setFormData(prev => ({ ...prev, storeId: storesData[0].id }));
            if (productsData.length > 0) setFormData(prev => ({ ...prev, productId: productsData[0].id }));
        }).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Failed to create offer');
            }

            router.push('/admin/offers');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Link href="/admin/offers" className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
                <ArrowLeft size={16} className="mr-1" />
                Back to Offers
            </Link>

            <div className="bg-white rounded-lg shadow-sm border p-8">
                <h1 className="text-2xl font-bold mb-6">Create New Offer</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Select Store</label>
                            <select
                                name="storeId"
                                className="block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={formData.storeId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Choose Store --</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Select Product</label>
                            <select
                                name="productId"
                                className="block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={formData.productId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Choose Product --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Original Price</label>
                            <input
                                type="number" step="0.01"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                required
                                className="block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Discounted Price</label>
                            <input
                                type="number" step="0.01"
                                name="discountedPrice"
                                value={formData.discountedPrice}
                                onChange={handleChange}
                                required
                                className="block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantityTotal"
                                value={formData.quantityTotal}
                                onChange={handleChange}
                                required
                                className="block w-full border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar size={16} className="mr-1" />
                            Schedule & Expiry
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Start Date (Live)</label>
                                <input type="datetime-local" name="startsAt" value={formData.startsAt} onChange={handleChange} required className="block w-full border-gray-400 rounded-md text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">End Date (Archived)</label>
                                <input type="datetime-local" name="endsAt" value={formData.endsAt} onChange={handleChange} required className="block w-full border-gray-400 rounded-md text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-red-700 mb-1">Product DLC (Expiry)</label>
                                <input type="date" name="dlcDate" value={formData.dlcDate} onChange={handleChange} required className="block w-full border-red-300 rounded-md focus:border-red-500 focus:ring-red-500" />
                                <p className="text-xs text-red-500 mt-1">Must be today or future</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            <span>Create Offer</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
