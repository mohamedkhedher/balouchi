'use client';

import { useEffect, useState } from 'react';
import { Plus, Package, Search, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    _count: {
        offers: number;
    };
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Debounce basic implementation or simple effect
        const timer = setTimeout(() => {
            fetch(`/api/products?search=${search}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setProducts(data);
                })
                .catch(console.error);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
                    <Plus size={20} />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
                        <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                            {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <ImageIcon className="text-gray-400" size={48} />
                            )}
                            <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-xs font-bold rounded-md shadow-sm">
                                {product.category}
                            </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description || 'No description'}</p>

                            <div className="border-t pt-3 mt-auto">
                                <div className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">{product._count.offers}</span> Offers
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        <Package className="mx-auto mb-3 opacity-20" size={48} />
                        <p>No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
