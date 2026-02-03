import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'CONSUMER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const reservations = await prisma.reservation.findMany({
            where: { consumerId: session.id },
            orderBy: { createdAt: 'desc' },
            include: {
                store: { select: { name: true, address: true, city: true } },
                qrToken: true,
                items: {
                    include: {
                        offer: {
                            include: { product: { select: { name: true, imageUrl: true } } }
                        }
                    }
                }
            }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
    }
}
