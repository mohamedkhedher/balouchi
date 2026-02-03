import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    // No auth required for browsing

    try {
        const offers = await prisma.offer.findMany({
            where: {
                status: 'LIVE',
                quantityAvailable: { gt: 0 },
                endsAt: { gt: new Date() } // Check end date
            },
            include: {
                product: { select: { name: true, category: true, imageUrl: true, description: true } },
                store: { select: { name: true, city: true, address: true } }
            },
            orderBy: { startsAt: 'desc' }
        });

        return NextResponse.json(offers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}
