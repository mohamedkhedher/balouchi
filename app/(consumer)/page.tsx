'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Tag } from 'lucide-react';

export default function ConsumerHomePage() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/consumer/offers')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setOffers(data);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-12 text-center shadow-xl">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Save Food. Save Money.</h1>
                <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                    Rescue delicious meals from local stores at up to 70% off. Good for your wallet, great for the planet.
                </p>
                {/* Search/Filter could go here */}
            </section>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button variant="default" className="rounded-full">All</Button>
                <Button variant="outline" className="rounded-full">Meals</Button>
                <Button variant="outline" className="rounded-full">Bakery</Button>
                <Button variant="outline" className="rounded-full">Groceries</Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {offers.map((offer) => {
                    const discount = Math.round(((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100);

                    return (
                        <Link href={`/offer/${offer.id}`} key={offer.id}>
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer border-0 shadow-md">
                                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                    {offer.product.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={offer.product.imageUrl}
                                            alt={offer.product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white border-0">
                                        -{discount}%
                                    </Badge>
                                    <Badge variant="secondary" className="absolute bottom-3 right-3 backdrop-blur-md bg-white/80 text-black">
                                        {offer.quantityAvailable} left
                                    </Badge>
                                </div>

                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {offer.product.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin size={14} className="mr-1" />
                                        {offer.store.name}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 pt-2 flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{offer.product.category}</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-4 border-t bg-gray-50/50 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 line-through">TND {offer.originalPrice}</span>
                                        <span className="text-lg font-bold text-blue-600">TND {offer.discountedPrice}</span>
                                    </div>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full px-4">
                                        Reserve
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    );
                })}

                {offers.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                        <div className="text-gray-400 mb-4 text-6xl">🍩</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No offers currently available</h3>
                        <p className="text-gray-500">Check back later for fresh savings!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
