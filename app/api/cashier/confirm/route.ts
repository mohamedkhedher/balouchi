import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !['CASHIER', 'ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reservationId, token } = await request.json();

        if (!reservationId || !token) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        // Verify ownership/security again (briefly)
        // Transactional update
        const result = await prisma.$transaction(async (tx) => {
            // 1. Mark Token Used
            const updatedToken = await tx.qrToken.update({
                where: { token },
                data: {
                    status: 'USED',
                    usedAt: new Date()
                }
            });

            // 2. Mark Reservation Picked Up
            const updatedReservation = await tx.reservation.update({
                where: { id: reservationId },
                data: { status: 'PICKED_UP' }
            });

            // 3. Log Audit
            await tx.auditLog.create({
                data: {
                    actorUserId: session.id,
                    action: 'CONFIRM_PICKUP',
                    entityType: 'RESERVATION',
                    entityId: reservationId,
                    metadataJson: { token, storeId: updatedReservation.storeId }
                }
            });

            return updatedReservation;
        });

        return NextResponse.json({ success: true, reservation: result });

    } catch (error) {
        console.error('Confirm error:', error);
        return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
    }
}
