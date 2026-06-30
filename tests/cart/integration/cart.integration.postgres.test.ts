import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

import { CartRepository } from '../../../src/modules/cartManagement/cart.repository';
import { CartService } from '../../../src/modules/cartManagement/cart.service';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { errorMessage } from '../../../src/shared_infrastructure/error/errorMessages';
import prisma from '../../../lib/prisma';
import { MenuService } from '../../../src/modules/restaurantManagemet/menu.service';

describe('Cart Service', () => {
  jest.setTimeout(60000);

  let postgresContainer: any;
  let prismaClient: any;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withExposedPorts(5432)
      .withDatabase(process.env.DATABASE_NAME as string)
      .withUsername(process.env.DATABASE_USERNAME as string)
      .withPassword(process.env.DATABASE_PASSWORD as string)
      .start();

    const host = postgresContainer.getHost();
    const port = postgresContainer.getPort();

    const databaseUrl = `postgresql://${postgresContainer.getUsername()}:${postgresContainer.getPassword()}@${host}:${port}/${postgresContainer.getDatabase()}`;

    const connectionString = `${databaseUrl}`;

    const adapter = new PrismaPg({
      connectionString,
      max: 5, // pool size
      idleTimeoutMillis: 30_000,
    });
    prismaClient = new PrismaClient({ adapter });
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });

    execSync('npx prisma db seed', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
    await postgresContainer.stop();
  });

  beforeEach(async () => {
    await prismaClient.cartItem.deleteMany();
    await prismaClient.cart.deleteMany();
  });

  const mockedAddedItem = {
    customerId: 1,
    itemId: 1,
    itemQuantity: 1,
  };
  describe('getCustomerCart', () => {
    it('should return existing  cart of customer ', async () => {
      /*
    preconditions:
    1- customer has existing cart*/
      const cartWithItems = await CartRepository.createCartAndCartItems(
        1,
        1,
        {
          id: 1,
          price: 35,
          itemName: 'Classic Burger',
          restaurantId: 1,
          stock: 10,
        },
        prismaClient,
      );
      const cart = await CartRepository.findCartByCustomerId(1, prismaClient);
      expect(cart).toEqual(cartWithItems);
    });

    it('should return cart of customer is null', async () => {
      const cart = await CartService.getCustomerCart(1, prismaClient);
      expect(cart).toBeNull();
    });
  });

  describe('checkQuantity', () => {
    it('should return  enough stock response of item ', async () => {
      const menuItem = await MenuService.getMenuItem(
        mockedAddedItem.itemId,
        prismaClient,
      );
      const result = await CartService.checkQuantity(
        mockedAddedItem.itemId,
        mockedAddedItem.itemQuantity,
        prismaClient,
      );
      expect(result.stock).toBeGreaterThan(mockedAddedItem.itemQuantity);
    });

    it('should return "Quantity exceed error" with insufficient stock', async () => {
      let quantity = 200;
      const menuItem = await MenuService.getMenuItem(
        mockedAddedItem.itemId,
        prismaClient,
      );
      expect(menuItem.stock).toBeLessThan(quantity);
      await expect(
        CartService.checkQuantity(
          mockedAddedItem.itemId,
          quantity,
          prismaClient,
        ),
      ).rejects.toThrow(errorMessage.QUANTITY_EXCEED.message);
    });

    it('should return "MenuItem not found error"', async () => {
      let menuItemId = 30000;
      const menuItem = await MenuService.getMenuItem(menuItemId, prismaClient);
      expect(menuItem).toBeNull();
      await expect(
        CartService.checkQuantity(menuItemId, 1, prismaClient),
      ).rejects.toThrow(errorMessage.MENU_ITEM_NOT_FOUND.message);
    });
  });

  describe('addToCart', () => {
    beforeEach(async () => {
      await prismaClient.cartItem.deleteMany();
      await prismaClient.cart.deleteMany();
    });

    it('should create new cart and add item it', async () => {
      /*
      preconditions:
      1- customer has no cart
      2- added item in menuItems table
      3- stock is enough */

      const cart_customer_1 = await CartService.getCustomerCart(
        mockedAddedItem.customerId,
        prismaClient,
      );
      const menuItem = await MenuService.getMenuItem(
        mockedAddedItem.itemId,
        prismaClient,
      );

      expect(menuItem.stock).toBeGreaterThan(mockedAddedItem.itemQuantity); // menuItem has enough stock

      const cartItem = await CartService.addToCart(
        mockedAddedItem,
        prismaClient,
      );

      expect(cart_customer_1).toBeNull(); // customer has no cart
      expect(menuItem).not.toBeNull(); // menuItem is existing in db
      expect(menuItem.stock).toBeGreaterThan(mockedAddedItem.itemQuantity); // menuItem has enough stock
      // Item added
      expect(cartItem).toMatchObject({
        customerId: mockedAddedItem.customerId,
        itemId: mockedAddedItem.itemId,
        itemQuantity: mockedAddedItem.itemQuantity,
        itemName: menuItem.itemName,
      });
    });
    it('should add item to existing cart', async () => {
      /*
      preconditions:
      1- customer must have existig not empty cart 
      2- menuItem is existing in db
      3- menuItem has enough stock
      4- new added item not existing in the cart
       */

      // ------------------------------------------------------------------
      // create cart to customer to be existing full cart with menuitem already in db and enough stock
      const menuItem = await MenuService.getMenuItem(3, prismaClient);
      const cart = await CartRepository.createCartAndCartItems(
        1,
        4,
        menuItem,
        prismaClient,
      );
      // -------------------------------------------------------------------------
      const cart_customer_1 = await CartService.getCustomerCart(
        mockedAddedItem.customerId,
        prismaClient,
      );
      expect(cart_customer_1).toMatchObject({ ...cart }); // customer has existing cart

      const existingItem = cart.cartItems.find(
        (ci: any) => ci.menuItemId === mockedAddedItem.itemId,
      );
      expect(existingItem).toBeUndefined(); // menuItem is not existing in cart

      const cartItem = await CartService.addToCart(
        mockedAddedItem,
        prismaClient,
      );

      expect(cartItem).toMatchObject({
        customerId: mockedAddedItem.customerId,
        itemId: mockedAddedItem.itemId,
        itemQuantity: mockedAddedItem.itemQuantity,
      });
    });
    it(`should abort adding item to existing cart because item already exist 
      and return item already in cart error message `, async () => {
      /*
      preconditions:
      1- customer must have existig  cart with added item
      2- menuItem is existing in db
      3- menuItem has enough stock
     4- item already existing in the cart
       */

      // ------------------------------------------------------------------
      // create cart to customer to be existing full cart with menuitem already in db and enough stock
      const menuItem = await MenuService.getMenuItem(
        mockedAddedItem.itemId,
        prismaClient,
      );
      const cart = await CartRepository.createCartAndCartItems(
        mockedAddedItem.customerId,
        mockedAddedItem.itemQuantity,
        menuItem,
        prismaClient,
      );
      // -------------------------------------------------------------------------
      const cart_customer = await CartService.getCustomerCart(
        mockedAddedItem.customerId,
        prismaClient,
      );
      expect(cart_customer).toMatchObject({ ...cart }); // customer has existing cart

      const existingItem = cart.cartItems.find(
        (ci: any) => ci.menuItemId === mockedAddedItem.itemId,
      );
      expect(existingItem).toBeDefined();
      expect(existingItem).toMatchObject({
        menuItemId: mockedAddedItem.itemId,
      }); // menuItem is existing in cart

      await expect(
        CartService.addToCart(mockedAddedItem, prismaClient),
      ).rejects.toThrow(errorMessage.ITEM_IDEMPOTENCY.message);
    });
    it(`One restaurant rule: should return "restaurant not match error"`, async () => {
      /*
      preconditions:
      1- customer must have existig cart with added items from one restaurant
      2- menuItem is existing in db
      3- menuItem has enough stock
       */

      // ------------------------------------------------------------------
      // create cart to customer to be existing full cart with menuitem already in db and enough stock
      const menuItem = await MenuService.getMenuItem(
        mockedAddedItem.itemId,
        prismaClient,
      );
      const cart = await CartRepository.createCartAndCartItems(
        mockedAddedItem.customerId,
        mockedAddedItem.itemQuantity,
        menuItem,
        prismaClient,
      );
      // -------------------------------------------------------------------------

      const itemFromDifferentRestaurant = await MenuService.getMenuItem(
        5,
        prismaClient,
      );
      expect(menuItem.restaurantId).not.toEqual(
        itemFromDifferentRestaurant.restaurantId,
      );
      await expect(
        CartService.addToCart(
          {
            customerId: 1,
            itemId: itemFromDifferentRestaurant.id,
            itemQuantity: 1,
          },
          prismaClient,
        ),
      ).rejects.toThrow(errorMessage.RESTAURANT_NOT_MATCH.message);
    });
  });
});
