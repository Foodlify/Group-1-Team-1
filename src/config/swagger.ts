import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Foodlify E-Commerce API',
      version: '1.0.0',
      description: 'API Documentation for the Foodlify food delivery application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'], 
};

export const swaggerSpec = swaggerJsdoc(options);
