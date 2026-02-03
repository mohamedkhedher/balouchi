import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !['CASHIER', 'ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Find token
        const qrToken = await prisma.qrToken.findUnique({
            where: { token },
            include: {
                reservation: {
                    include: {
                        items: {
                            include: {
                                offer: {
                                    include: { product: true }
                                }
                            }
                        },
                        store: true,
                        consumer: { select: { email: true } }
                    }
                }
            }
        });

        if (!qrToken) {
            return NextResponse.json({ error: 'Invalid QR Code' }, { status: 404 });
        }

        // Check if store matches cashier's store (if cashier)
        // Admin/Merchant can scan anywhere? Let's restrict to store ownership for merchant, and managedStore for cashier
        if (session.role === 'CASHIER') {
            // We need to fetch cashier's managed Store ID from DB to be safe or rely on session if updated
            // Relying on session.managedStoreId (if added to session) or fetching user
            const cashier = await prisma.user.findUnique({ where: { id: session.id } });
            if (cashier?.managedStoreId !== qrToken.reservation.storeId) {
                return NextResponse.json({ error: 'This reservation is for a different store' }, { status: 403 });
            }
        }

        if (qrToken.status === 'USED') {
            return NextResponse.json({ error: 'QR Code already used' }, { status: 400 });
        }

        if (qrToken.status === 'EXPIRED' || new Date() > qrToken.expiresAt) {
            return NextResponse.json({ error: 'QR Code expired' }, { status: 400 });
        }

        if (qrToken.reservation.status !== 'ACTIVE') {
            return NextResponse.json({ error: `Reservation is ${qrToken.reservation.status}` }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            reservation: qrToken.reservation,
            token: qrToken.token
        });

    } catch (error) {
        console.error('Scan error:', error);
        return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
    }
}
