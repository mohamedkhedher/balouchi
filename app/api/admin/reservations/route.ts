import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    try {
        const where: any = {};
        if (storeId && storeId !== 'ALL') where.storeId = storeId;

        // Merchant can only see their own store's reservations
        if (session.role === 'MERCHANT') {
            const ownedStores = await prisma.store.findMany({ where: { merchantId: session.id }, select: { id: true } });
            const storeIds = ownedStores.map(s => s.id);
            if (storeId && !storeIds.includes(storeId)) {
                return NextResponse.json({ error: 'Unauthorized for this store' }, { status: 403 });
            }
            where.storeId = { in: storeIds };
        }

        const reservations = await prisma.reservation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                store: { select: { name: true } },
                consumer: { select: { email: true } },
                items: {
                    include: {
                        offer: {
                            include: { product: { select: { name: true } } }
                        }
                    }
                },
                qrToken: { select: { status: true, token: true } }
            }
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error('Fetch reservations error:', error);
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
    }
}
