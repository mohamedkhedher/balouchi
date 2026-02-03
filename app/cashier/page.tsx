'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, Search, Package, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CashierScanPage() {
    const router = useRouter();
    const [scannedData, setScannedData] = useState<any>(null);
    const [manualCode, setManualCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Handler for valid scan or manual submit
    const handleScan = async (token: string) => {
        if (!token) return;
        setLoading(true);
        setError('');
        setSuccessMsg('');
        setScannedData(null);

        try {
            const res = await fetch('/api/cashier/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Scan failed');
            }

            setScannedData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmPickup = async () => {
        if (!scannedData) return;
        setLoading(true);
        try {
            // TODO: Implement confirm endpoint
            const res = await fetch('/api/cashier/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservationId: scannedData.reservation.id,
                    token: scannedData.token
                }),
            });

            if (!res.ok) throw new Error('Confirmation failed');

            setSuccessMsg('Pickup Confirmed!');
            setScannedData(null);
            setManualCode('');

            // Reset success msg after 3s
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Error / Success Messages */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center shadow-sm animate-in slide-in-from-top-2">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center shadow-sm animate-in slide-in-from-top-2">
                    <Check className="mr-2 h-6 w-6" />
                    <span className="font-bold text-lg">{successMsg}</span>
                </div>
            )}

            {/* Camera Scanner */}
            {!scannedData && (
                <div className="bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-gray-900 aspect-square relative">
                    <Scanner
                        onScan={(result) => {
                            if (result && result[0]) handleScan(result[0].rawValue);
                        }}
                        styles={{ container: { width: '100%', height: '100%' } }}
                    />

                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/50 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                        </div>
                    </div>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium drop-shadow-md">
                        Point camera at QR Code
                    </p>
                </div>
            )}

            {/* Manual Entry */}
            {!scannedData && (
                <form
                    onSubmit={(e) => { e.preventDefault(); handleScan(manualCode); }}
                    className="bg-white p-4 rounded-xl shadow-sm border space-y-3"
                >
                    <label className="text-sm font-medium text-gray-700 block">Or enter code manually</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="e.g. RES-12345"
                                className="block w-full border-gray-300 rounded-lg pl-3 pr-3 py-2.5 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono uppercase"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !manualCode}
                            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Search />}
                        </button>
                    </div>
                </form>
            )}

            {/* Reservation Details (Card) */}
            {scannedData && (
                <div className="bg-white rounded-xl shadow-lg border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                        <div className="font-bold text-lg">Valid Reservation</div>
                        <Check className="bg-white text-green-600 rounded-full p-1 h-6 w-6" />
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="text-center border-b pb-4">
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="font-medium text-lg">{scannedData.reservation.consumer.email}</p>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Items to Pickup</p>
                            <ul className="space-y-3">
                                {scannedData.reservation.items.map((item: any) => (
                                    <li key={item.id} className="flex bg-gray-50 p-3 rounded-lg border">
                                        <div className="h-10 w-10 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden mr-3">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {item.offer.product.imageUrl && <img src={item.offer.product.imageUrl} className="h-full w-full object-cover" alt="" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{item.offer.product.name}</div>
                                            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={confirmPickup}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md text-lg flex items-center justify-center mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                            Confirm Pickup
                        </button>

                        <button
                            onClick={() => { setScannedData(null); setManualCode(''); }}
                            className="w-full text-gray-500 py-2 hover:text-gray-800 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
