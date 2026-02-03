'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MapPin, QrCode, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyReservationsPage() {
    const router = useRouter();
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/consumer/reservations')
            .then((res) => {
                if (res.status === 401) {
                    router.push('/login');
                    return [];
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setReservations(data);
            })
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">My Reservations</h1>

            {reservations.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <div className="text-6xl mb-4">🎫</div>
                    <h3 className="text-xl font-medium">No reservations yet</h3>
                    <p className="text-gray-500 mb-6">Find great deals and rescue food today!</p>
                    <Button onClick={() => router.push('/')}>Browse Offers</Button>
                </div>
            )}

            <div className="grid gap-6">
                {reservations.map((res) => {
                    const isActive = res.status === 'ACTIVE';
                    const isExpirred = res.status === 'EXPIRED';
                    const isPickedUp = res.status === 'PICKED_UP';
                    const item = res.items[0]; // Assuming single item per res for MVP

                    return (
                        <Card key={res.id} className={`overflow-hidden ${!isActive ? 'opacity-75 bg-gray-50' : ''}`}>
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="md:w-48 h-32 md:h-auto bg-gray-200 relative">
                                    {item?.offer.product.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.offer.product.imageUrl} className="w-full h-full object-cover" alt="" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg">{item?.offer.product.name}</h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <MapPin size={14} className="mr-1" />
                                                    {res.store.name}
                                                </div>
                                            </div>
                                            {isActive && <Badge className="bg-green-600">Ready for Pickup</Badge>}
                                            {isPickedUp && <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle size={12} className="mr-1" /> Picked Up</Badge>}
                                            {isExpirred && <Badge variant="destructive">Expired</Badge>}
                                        </div>

                                        <div className="flex gap-4 text-sm text-gray-600 mt-4">
                                            <div className="flex items-center">
                                                <span className="font-bold mr-1">Qty:</span> {item?.quantity}
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-bold mr-1">Total:</span> TND {item?.quantity * item?.unitPrice}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-between items-center">
                                        <div className="text-xs text-gray-400">
                                            Ref: {res.qrToken?.token}
                                        </div>

                                        {isActive && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                                        <QrCode className="mr-2 h-4 w-4" />
                                                        Show QR Code
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md text-center">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-center">Pickup Verification</DialogTitle>
                                                        <DialogDescription className="text-center">
                                                            Show this QR code to the cashier at <strong>{res.store.name}</strong>
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex justify-center py-6">
                                                        <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-blue-100">
                                                            <QRCodeSVG value={res.qrToken?.token || ''} size={200} />
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl font-mono font-bold tracking-widest text-gray-900">
                                                        {res.qrToken?.token}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
