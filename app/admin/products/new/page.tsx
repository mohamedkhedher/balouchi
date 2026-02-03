'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, AlignLeft, Layers, Image as ImageIcon, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            imageUrl: formData.get('imageUrl'),
        };

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || 'Failed to create product');
            }

            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/products" className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
                <ArrowLeft size={16} className="mr-1" />
                Back to Products
            </Link>

            <div className="bg-white rounded-lg shadow-sm border p-8">
                <h1 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                    <Package className="mr-2 text-blue-700" />
                    Create New Product
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Product Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Package className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="e.g. Yogurt Pack"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Layers className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                name="category"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="e.g. Dairy"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Image URL</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ImageIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="url"
                                name="imageUrl"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <AlignLeft className="h-5 w-5 text-gray-500" />
                            </div>
                            <textarea
                                name="description"
                                rows={3}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="Product description..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            <span>Create Product</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
