const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');

// Initialize Express
const app = express();
app.use(express.json());

// Swagger setup for API documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Pricing API',
      version: '1.0.0',
      description: 'API for managing products and applying price adjustments'
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./index.js'], // File for Swagger docs
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// In-memory products database
let products = [
  {
    id: uuidv4(),
    title: 'High Garden Pinot Noir 2021',
    sku: 'HGVPIN216',
    brand: 'High Garden',
    category: 'Alcoholic Beverage',
    subcategory: 'Wine',
    segment: 'Red',
    price: 279.06,
  },
  {
    id: uuidv4(),
    title: 'Koyama Methode Brut Nature NV',
    sku: 'KOYBRUNV6',
    brand: 'Koyama Wines',
    category: 'Alcoholic Beverage',
    subcategory: 'Wine',
    segment: 'Sparkling',
    price: 120.0,
  },
  {
    id: uuidv4(),
    title: 'Koyama Riesling 2018',
    sku: 'KOYNR1837',
    brand: 'Koyama Wines',
    category: 'Alcoholic Beverage',
    subcategory: 'Wine',
    segment: 'Port/Dessert',
    price: 215.04,
  },
  {
    id: uuidv4(),
    title: 'Koyama Tussock Riesling 2019',
    sku: 'KOYRIE19',
    brand: 'Koyama Wines',
    category: 'Alcoholic Beverage',
    subcategory: 'Wine',
    segment: 'White',
    price: 215.04,
  },
  {
    id: uuidv4(),
    title: 'Lacourte-Godbillon Brut Cru NV',
    sku: 'LACBNATNV6',
    brand: 'Lacourte-Godbillon',
    category: 'Alcoholic Beverage',
    subcategory: 'Wine',
    segment: 'Sparkling',
    price: 409.32,
  }
];

// In-memory pricing profiles
let pricingProfiles = [];

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products or filter by category, subcategory, and segment.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Filter by subcategory
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *         description: Filter by segment
 *     responses:
 *       200:
 *         description: List of products
 */

// Route for root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Pricing API! Use /api/products to get the products.');
  });
  
app.get('/api/products', (req, res) => {
  const { category, subcategory, segment } = req.query;
  let filteredProducts = products;

  // Apply filters
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  if (subcategory) {
    filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
  }
  if (segment) {
    filteredProducts = filteredProducts.filter(p => p.segment === segment);
  }

  res.json(filteredProducts);
});

/**
 * @swagger
 * /api/pricing-profile:
 *   post:
 *     summary: Create a pricing profile
 *     description: Create a pricing profile with fixed or percentage adjustments.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - value
 *             properties:
 *               name:
 *                 type: string
 *                 description: Profile name
 *               type:
 *                 type: string
 *                 enum: [fixed, percentage]
 *                 description: Type of adjustment
 *               value:
 *                 type: number
 *                 description: The value of the adjustment (either amount or percentage)
 *     responses:
 *       201:
 *         description: Pricing profile created
 */
app.post('/api/pricing-profile', (req, res) => {
  const { name, type, value } = req.body;

  const profile = {
    id: uuidv4(),
    name,
    type,
    value,
  };

  pricingProfiles.push(profile);
  res.status(201).json(profile);
});

/**
 * @swagger
 * /api/products/apply-pricing:
 *   post:
 *     summary: Apply a pricing profile to a product
 *     description: Apply a pricing profile (percentage or fixed) to adjust the price of a product.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - profileId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product
 *               profileId:
 *                 type: string
 *                 description: The ID of the pricing profile
 *     responses:
 *       200:
 *         description: Price adjusted
 */
app.post('/api/products/apply-pricing', (req, res) => {
  const { productId, profileId } = req.body;

  const product = products.find(p => p.id === productId);
  const profile = pricingProfiles.find(p => p.id === profileId);

  if (!product || !profile) {
    return res.status(404).json({ message: 'Product or Profile not found' });
  }

  let newPrice = product.price;
  if (profile.type === 'fixed') {
    newPrice += profile.value;
  } else if (profile.type === 'percentage') {
    newPrice += product.price * (profile.value / 100);
  }

  // Update product price
  product.price = newPrice;
  res.json({ ...product, adjustedPrice: newPrice });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
