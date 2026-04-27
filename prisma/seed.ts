import prisma from '../lib/prisma';
import { OrderStatus, TransactionStatus, PaymentType } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding database...');

  // ─────────────────────────────────────────
  // Clean existing data (order matters for FK)
  // ─────────────────────────────────────────
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.orderStatusRef.deleteMany();
  await prisma.transactionStatusRef.deleteMany();
  await prisma.paymentTypeRef.deleteMany();

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  const user1 = await prisma.user.create({
    data: { name: 'Alice Johnson', email: 'alice@foodlify.com' },
  });

  const user2 = await prisma.user.create({
    data: { name: 'Bob Smith', email: 'bob@foodlify.com' },
  });

  const user3 = await prisma.user.create({
    data: { name: 'Sara Ahmed', email: 'sara@foodlify.com' },
  });
  const user4 = await prisma.user.create({
    data: { name: 'John Baker', email: 'john@foodlify.com' },
  });

  console.log('✅ Users seeded');

  // ─────────────────────────────────────────
  // CUSTOMERS  (1-to-1 with User)
  // ─────────────────────────────────────────
  await prisma.customer.createMany({
    data: [
      { userId: user1.id },
      { userId: user2.id },
      { userId: user3.id },
      { userId: user4.id },
    ],
  });

  console.log('✅ Customers seeded');

  // ─────────────────────────────────────────
  // RESTAURANTS
  // ─────────────────────────────────────────
  const restaurant1 = await prisma.restaurant.create({
    data: { name: 'Burger Palace' },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: { name: 'Pizza Heaven' },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: { name: 'Sushi World' },
  });

  console.log('✅ Restaurants seeded');

  // ─────────────────────────────────────────
  // MENUS  (1 menu per restaurant)
  // ─────────────────────────────────────────
  const menu1 = await prisma.menu.create({
    data: { restaurantId: restaurant1.id },
  });

  const menu2 = await prisma.menu.create({
    data: { restaurantId: restaurant2.id },
  });

  const menu3 = await prisma.menu.create({
    data: { restaurantId: restaurant3.id },
  });

  console.log('✅ Menus seeded');

  // ─────────────────────────────────────────
  // MENU ITEMS
  // ─────────────────────────────────────────
  await prisma.menuItem.createMany({
    data: [
      // Burger Palace
      {
        menuId: menu1.id,
        restaurantId: restaurant1.id,
        itemName: 'Classic Burger',
        price: 35,
        stock: 100,
      },
      {
        menuId: menu1.id,
        restaurantId: restaurant1.id,
        itemName: 'Cheese Burger',
        price: 40,
        stock: 150,
      },
      {
        menuId: menu1.id,
        restaurantId: restaurant1.id,
        itemName: 'Crispy Chicken',
        price: 38,
        stock: 80,
      },
      {
        menuId: menu1.id,
        restaurantId: restaurant1.id,
        itemName: 'French Fries',
        price: 15,
        stock: 200,
      },

      // Pizza Heaven
      {
        menuId: menu2.id,
        restaurantId: restaurant2.id,
        itemName: 'Margherita Pizza',
        price: 55,
        stock: 50,
      },
      {
        menuId: menu2.id,
        restaurantId: restaurant2.id,
        itemName: 'Pepperoni Pizza',
        price: 65,
        stock: 60,
      },
      {
        menuId: menu2.id,
        restaurantId: restaurant2.id,
        itemName: 'BBQ Chicken Pizza',
        price: 70,
        stock: 45,
      },
      {
        menuId: menu2.id,
        restaurantId: restaurant2.id,
        itemName: 'Garlic Bread',
        price: 20,
        stock: 120,
      },

      // Sushi World
      {
        menuId: menu3.id,
        restaurantId: restaurant3.id,
        itemName: 'Salmon Roll',
        price: 80,
        stock: 30,
      },
      {
        menuId: menu3.id,
        restaurantId: restaurant3.id,
        itemName: 'Tuna Nigiri (6 pcs)',
        price: 90,
        stock: 25,
      },
      {
        menuId: menu3.id,
        restaurantId: restaurant3.id,
        itemName: 'Veggie Roll',
        price: 60,
        stock: 40,
      },
      {
        menuId: menu3.id,
        restaurantId: restaurant3.id,
        itemName: 'Miso Soup',
        price: 25,
        stock: 90,
      },
    ],
  });

  console.log('✅ Menu items seeded');
  // ───────────────────────────────────────
  // ORDER Status
  // ───────────────────────────────────────
  await prisma.orderStatusRef.createMany({
    data: [
      { status: OrderStatus.PENDING },
      { status: OrderStatus.CONFIRMED },
      { status: OrderStatus.PROCESSED },
      { status: OrderStatus.READY_TO_PICKUP },
      { status: OrderStatus.OUT_FOR_DELIVERY },
      { status: OrderStatus.DELIVERED },
      { status: OrderStatus.CANCELLED },
      { status: OrderStatus.REFUNDED },
    ],
  });
  console.log('✅ Order status seeded');
  // ───────────────────────────────────────
  // Transaction Status
  // ───────────────────────────────────────
  await prisma.transactionStatusRef.createMany({
    data: [
      { status: TransactionStatus.PENDING },
      { status: TransactionStatus.SUCCEEDED },
      { status: TransactionStatus.FAILED },
      { status: TransactionStatus.REFUNDED },
    ],
  });
  console.log('✅ Transaction status seeded');
  // ───────────────────────────────────────
  // Transaction Status
  // ───────────────────────────────────────
  await prisma.paymentTypeRef.createMany({
    data: [
      { name: PaymentType.CARD },
      { name: PaymentType.CASH },
      { name: PaymentType.WALLET },
      { name: PaymentType.STRIPE },
      { name: PaymentType.PAYPAL },
    ],
  });
  console.log('✅ Payment type seeded');

  // ───────────────────────────────────────
  // Address
  // ───────────────────────────────────────
  await prisma.address.createMany({
    data: [
      {
        customerId: 1,
        street: '90 Street, New Cairo',
        city: 'Cairo',
        state: 'Cairo',
        country: 'Egypt',
        postalCode: '11835',
      },
      {
        customerId: 2,
        street: 'Nasr City, Abbas El Akkad Street',
        city: 'Cairo',
        state: 'Cairo',
        country: 'Egypt',
        postalCode: '11511',
      },
      {
        customerId: 3,
        street: 'Dokki, Tahrir Street',
        city: 'Cairo',
        state: 'Giza (Greater Cairo)',
        country: 'Egypt',
        postalCode: '12611',
      },
      {
        customerId: 4,
        street: 'Maadi, Road 9',
        city: 'Cairo',
        state: 'Cairo',
        country: 'Egypt',
        postalCode: '11728',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Address seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
