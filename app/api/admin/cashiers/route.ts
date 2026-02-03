import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const where: any = { role: 'CASHIER' };

        // Merchant can only see cashiers for their stores
        if (session.role === 'MERCHANT') {
            const ownedStores = await prisma.store.findMany({ where: { merchantId: session.id }, select: { id: true } });
            const storeIds = ownedStores.map(s => s.id);
            where.managedStoreId = { in: storeIds };
        }

        const cashiers = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                managedStore: {
                    select: { name: true, city: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(cashiers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cashiers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'MERCHANT'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, password, storeId } = body;

        if (!email || !password || !storeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify store ownership if Merchant
        if (session.role === 'MERCHANT') {
            const store = await prisma.store.findUnique({ where: { id: storeId } });
            if (!store || store.merchantId !== session.id) {
                return NextResponse.json({ error: 'Unauthorized for this store' }, { status: 403 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const cashier = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role: 'CASHIER',
                managedStoreId: storeId
            },
        });

        return NextResponse.json({ id: cashier.id, email: cashier.email });
    } catch (error: any) {
        console.error('Create cashier error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create cashier' }, { status: 500 });
    }
}
