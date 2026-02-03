import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'CONSUMER') {
        return NextResponse.json({ error: 'Unauthorized. Please log in as a consumer.' }, { status: 401 });
    }

    try {
        const { offerId, quantity } = await request.json();

        if (!offerId || !quantity || quantity < 1) {
            return NextResponse.json({ error: 'Invalid reservation data' }, { status: 400 });
        }

        // Reservation Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check Offer & Lock Stock (conceptually)
            // Prisma doesn't do "SELECT FOR UPDATE" easily without raw queries, but atomic decrement works safely
            const offer = await tx.offer.findUnique({ where: { id: offerId } });

            if (!offer) throw new Error('Offer not found');
            if (offer.status !== 'LIVE') throw new Error('Offer is not available');
            if (offer.quantityAvailable < quantity) throw new Error('Not enough stock available');
            if (new Date() > offer.endsAt) throw new Error('Offer has expired');

            // 2. Decrement Stock
            await tx.offer.update({
                where: { id: offerId },
                data: { quantityAvailable: { decrement: quantity } }
            });

            // Check if sold out *after* decrement? Or rely on the check above.
            // If atomic decrement goes below 0, it won't throw automatically in postgres integer, but we checked before.
            // Ideally we'd optimize the status update to SOLD_OUT if 0, but can do lazily or via separate job.

            // 3. Create Reservation
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 2); // 2 Hour hold time

            const reservation = await tx.reservation.create({
                data: {
                    consumerId: session.id,
                    storeId: offer.storeId,
                    status: 'ACTIVE',
                    expiresAt: expiresAt,
                    items: {
                        create: {
                            offerId: offerId,
                            quantity: quantity,
                            unitPrice: offer.discountedPrice
                        }
                    }
                }
            });

            // 4. Generate QR Token
            const tokenString = `RES-${uuidv4().split('-')[0].toUpperCase()}`; // Simple shorter token for MVP manual entry

            await tx.qrToken.create({
                data: {
                    reservationId: reservation.id,
                    token: tokenString,
                    status: 'ACTIVE',
                    expiresAt: expiresAt
                }
            });

            return reservation;
        });

        return NextResponse.json({ success: true, reservationId: result.id });

    } catch (error: any) {
        console.error('Reservation error:', error);
        return NextResponse.json({ error: error.message || 'Reservation failed' }, { status: 500 });
    }
}
