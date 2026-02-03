import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                merchant: {
                    select: { email: true }
                },
                _count: {
                    select: { offers: true, reservations: true }
                }
            }
        });
        return NextResponse.json(stores);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, address, city, merchantId } = body;

        if (!name || !address || !city) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If admin, can specify merchantId. If merchant, defaults to self.
        const ownerId = session.role === 'ADMIN' && merchantId ? merchantId : session.id;

        const store = await prisma.store.create({
            data: {
                name,
                address,
                city,
                merchantId: ownerId,
            },
        });

        return NextResponse.json(store);
    } catch (error) {
        console.error('Create store error:', error);
        return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
    }
}
