import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { login } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Allow Admin, Merchant, Cashier, and Consumer
        if (!['ADMIN', 'MERCHANT', 'CASHIER', 'CONSUMER'].includes(user.role)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash || '');

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create session
        await login({
            id: user.id,
            email: user.email,
            role: user.role,
            merchantId: user.id // For merchant, id is merchantId. For cashier? managedStore?
            // Refinement: if cashier, we might need storeId.
            // Schema says: Cashier has managedStore/managedStoreId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error details:', error);
        return NextResponse.json({ error: 'Internal server error: ' + (error as any).message }, { status: 500 });
    }
}
