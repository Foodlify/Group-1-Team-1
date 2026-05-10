import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.json';
import prisma from '../lib/prisma';
import router from './routes';
import { errorHandler } from './middlewares/error_handling/error-handling';
import { webhookRouter } from './modules/paymentManagement/routes/webhook.route';
import path, { join } from 'path';
import 'dotenv/config';


const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
    },
  }),
);

app.use(express.static(path.join(__dirname, '../public')));

app.use('/webhook', webhookRouter);

app.use(express.json());
app.use('/api/v1', router);

// Swagger Docs Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Check db connection
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'success',
      message: 'API and Database are running sequentially',
    });
  } catch (error) {
    console.error('Database connection failed', error);
    res
      .status(500)
      .json({ status: 'error', message: 'Database connection failed' });
  }
});

// Global error handler
app.use(errorHandler);

export default app;
