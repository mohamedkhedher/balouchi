import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const storeId = searchParams.get('storeId');

    try {
        const whereClause: any = {};
        if (status && status !== 'ALL') whereClause.status = status;
        if (storeId && storeId !== 'ALL') whereClause.storeId = storeId;

        const offers = await prisma.offer.findMany({
            where: whereClause,
            include: {
                product: { select: { name: true, imageUrl: true } },
                store: { select: { name: true } },
                _count: { select: { reservationItems: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(offers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            productId, storeId,
            originalPrice, discountedPrice,
            dlcDate, quantityTotal,
            startsAt, endsAt
        } = body;

        // ----- Validations -----
        if (!productId || !storeId || !originalPrice || !discountedPrice || !dlcDate || !quantityTotal || !startsAt || !endsAt) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const op = parseFloat(originalPrice);
        const dp = parseFloat(discountedPrice);
        const qty = parseInt(quantityTotal);

        if (dp >= op) {
            return NextResponse.json({ error: 'Discounted price must be lower than original price' }, { status: 400 });
        }
        if (qty < 1) {
            return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
        }
        if (new Date(endsAt) <= new Date(startsAt)) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }
        if (new Date(dlcDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
            // allowing today
            return NextResponse.json({ error: 'DLC Date cannot be in the past' }, { status: 400 });
        }

        // Determine status
        const now = new Date();
        const start = new Date(startsAt);
        let status = 'LIVE';

        if (start > now) {
            status = 'SCHEDULED';
        }

        const offer = await prisma.offer.create({
            data: {
                productId,
                storeId,
                originalPrice: op,
                discountedPrice: dp,
                dlcDate: new Date(dlcDate),
                quantityTotal: qty,
                quantityAvailable: qty, // Initial setup
                startsAt: new Date(startsAt),
                endsAt: new Date(endsAt),
                status: status as any
            }
        });

        return NextResponse.json(offer);
    } catch (error) {
        console.error('Create offer error:', error);
        return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }
}
