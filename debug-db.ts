
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Current Date:', new Date());

    const allOffers = await prisma.offer.findMany({
        include: { product: true }
    });
    console.log('All Offers Count:', allOffers.length);
    console.log('All Offers:', JSON.stringify(allOffers, null, 2));

    const liveOffers = await prisma.offer.findMany({
        where: {
            status: 'LIVE',
            quantityAvailable: { gt: 0 },
            endsAt: { gt: new Date() }
        },
        include: { product: true }
    });
    console.log('Live Offers Query Result:', liveOffers.length);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
