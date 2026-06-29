import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

import { CartRepository } from '../src/modules/cartManagement/cart.repository';

import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('Cart Repository', () => {
  jest.setTimeout(60000);

  let postgresContainer: any;
  let prismaClient: any;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
      .withExposedPorts(5432)
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
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

  it('should create and return multiple users', async () => {
    // const result = await prismaClient.$queryRawUnsafe(
    //   'SELECT * FROM "Customer";',
    // );
  });
});
