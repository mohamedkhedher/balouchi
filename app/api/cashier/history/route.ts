import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || !['CASHIER', 'ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // If cashier, get my store ID from user record first (safest)
        let storeId: string | undefined;

        if (session.role === 'CASHIER') {
            const user = await prisma.user.findUnique({ where: { id: session.id } });
            if (user?.managedStoreId) storeId = user.managedStoreId;
        }

        const history = await prisma.reservation.findMany({
            where: {
                storeId: storeId, // Filter by store if cashier
                status: 'PICKED_UP'
            },
            take: 20, // Limit to last 20
            orderBy: { updatedAt: 'desc' },
            include: {
                consumer: { select: { email: true } },
                items: {
                    include: {
                        offer: { include: { product: { select: { name: true } } } }
                    }
                }
            }
        });

        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
