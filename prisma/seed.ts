import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const adminEmail = 'admin@balouchi.com';
    const adminPassword = 'admin'; // Change in prod
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: hashedPassword,
            role: 'ADMIN',
        },
    });
    console.log({ admin });

    // 2. Create Sample Merchant
    const merchantEmail = 'merchant@store.com';
    const merchant = await prisma.user.upsert({
        where: { email: merchantEmail },
        update: {},
        create: {
            email: merchantEmail,
            passwordHash: hashedPassword,
            role: 'MERCHANT',
        },
    });
    console.log({ merchant });

    // 2.5 Create Cashier
    const cashierEmail = 'cashier@store.com';
    const cashierPassword = 'cashier123';
    const hashedCashierPassword = await bcrypt.hash(cashierPassword, 10);
    const cashier = await prisma.user.upsert({
        where: { email: cashierEmail },
        update: {
            passwordHash: hashedCashierPassword,
        },
        create: {
            email: cashierEmail,
            passwordHash: hashedCashierPassword,
            role: 'CASHIER',
        },
    });
    console.log({ cashier });

    // 2.6 Create Sample Consumer
    const consumerEmail = 'user@test.com';
    const consumerPassword = 'user123';
    const hashedConsumerPassword = await bcrypt.hash(consumerPassword, 10);
    const consumer = await prisma.user.upsert({
        where: { email: consumerEmail },
        update: {
            passwordHash: hashedConsumerPassword, // Force update password
        },
        create: {
            email: consumerEmail,
            passwordHash: hashedConsumerPassword,
            role: 'CONSUMER',
        },
    });
    console.log({ consumer });

    // 3. Create Store
    const store = await prisma.store.create({
        data: {
            merchantId: merchant.id,
            name: 'Balouchi Market',
            address: '123 Main St',
            city: 'Casablanca',
            cashiers: {
                connect: { id: cashier.id }
            }
        },
    });
    console.log({ store });

    // 4. Create Products
    const product1 = await prisma.product.create({
        data: {
            merchantId: merchant.id,
            name: 'Yogurt Vitalait',
            category: 'Dairy',
            description: 'Fresh Vitalait yogurt',
            imageUrl: '/images/yogurt-1.png',
        },
    });

    const product2 = await prisma.product.create({
        data: {
            merchantId: merchant.id,
            name: 'Yogurt Natilait',
            category: 'Dairy',
            description: 'High protein Natilait yogurt',
            imageUrl: '/images/yogurt-2.png',
        },
    });

    // 5. Create Offers
    const offer1 = await prisma.offer.create({
        data: {
            productId: product1.id,
            storeId: store.id,
            originalPrice: 10.0,
            discountedPrice: 5.0,
            dlcDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            quantityTotal: 50,
            quantityAvailable: 50,
            status: 'LIVE',
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    const offer2 = await prisma.offer.create({
        data: {
            productId: product2.id,
            storeId: store.id,
            originalPrice: 10.0,
            discountedPrice: 1.0,
            discountType: 'PERCENT',
            discountValue: 90,
            dlcDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            quantityTotal: 20,
            quantityAvailable: 9,
            status: 'LIVE',
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
    });
    console.log({ offer1, offer2 });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
