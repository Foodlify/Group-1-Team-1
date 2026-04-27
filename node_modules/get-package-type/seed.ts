import prisma from '../lib/prisma';

async function seed() {
  await prisma.cart.createMany({
    data: [
      {
        name: 'cart_1',
      },
      {
        name: 'cart_2',
      },
      {
        name: 'cart_2',
      },
    ],
  });
}

seed().then(() => prisma.$disconnect());
