import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    try {
        const products = await prisma.product.findMany({
            where: search ? {
                name: { contains: search, mode: 'insensitive' }
            } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { offers: true }
                }
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, category, description, imageUrl } = body;

        // MVP Simple validation
        if (!name || !category) {
            return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                merchantId: session.id, // Products owned by creator logic for MVP
                name,
                category,
                description,
                imageUrl,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
