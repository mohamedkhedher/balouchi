'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, ArrowLeft, Info, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [offer, setOffer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch directly from our robust offers API (reusing the public filtered list logic but tailored for ID)
        // For MVP, we'll fetch all public offers and find one (inefficient but fast to code), 
        // OR create a specific endpoint. Let's create a quick client-side fetcher if we can't reuse.
        // Actually, let's just use the consumer offers API and filter client side for now to save a file, 
        // standard practice is a dedicated endpoint /api/consumer/offers/[id].

        // Let's implement /api/consumer/offers/[id] logic right here via a dedicated server action later? 
        // No, standard fetch for now.

        fetch('/api/consumer/offers') // Ideally /api/consumer/offers/${params.id}
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const found = data.find((o: any) => o.id === id);
                    setOffer(found);
                }
            })
            .finally(() => setLoading(false));
    }, [id]);


    const handleReserve = async () => {
        setReserving(true);
        setError('');

        try {
            const res = await fetch('/api/consumer/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: offer.id, quantity: 1 })
            });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push('/reservations');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setReserving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!offer) return <div className="text-center p-12">Offer not found</div>;

    const discount = Math.round(((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100);

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 mb-6 hover:text-blue-600">
                <ArrowLeft size={16} className="mr-1" />
                Back to Offers
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square relative shadow-sm">
                    {offer.product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={offer.product.imageUrl} className="w-full h-full object-cover" alt={offer.product.name} />
                    )}
                    <Badge className="absolute top-4 left-4 text-lg py-1 px-3 bg-red-500 border-0">
                        -{discount}%
                    </Badge>
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <Badge variant="secondary" className="mb-2">{offer.product.category}</Badge>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{offer.product.name}</h1>
                        <div className="flex items-center text-gray-500">
                            <MapPin size={18} className="mr-1" />
                            {offer.store.name} ({offer.store.city})
                        </div>
                    </div>

                    <p className="text-gray-600 text-lg leading-relaxed">
                        {offer.product.description || 'Delicious food rescued from being wasted. High quality and ready to eat!'}
                    </p>

                    <Card className="p-6 bg-gray-50 border-0">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Price</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-blue-600">TND {offer.discountedPrice}</span>
                                    <span className="text-xl text-gray-400 line-through">TND {offer.originalPrice}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Pick up before</p>
                                <div className="flex items-center text-red-600 font-medium">
                                    <Clock size={16} className="mr-1" />
                                    8:00 PM
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            size="lg"
                            className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 rounded-xl"
                            onClick={handleReserve}
                            disabled={reserving || offer.quantityAvailable < 1}
                        >
                            {reserving ? <Loader2 className="animate-spin mr-2" /> : null}
                            {offer.quantityAvailable > 0 ? 'Reserve for Pickup' : 'Sold Out'}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-3">
                            Pay upon pickup at the store.
                        </p>
                    </Card>

                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                        <Info className="flex-shrink-0" />
                        <p>
                            This reservation holds your item for 2 hours. Please arrive at the store before closing time to claim your order.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
