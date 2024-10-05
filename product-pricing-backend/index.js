const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');

const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());
// Initialize Express
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

const sqlite3 = require('sqlite3').verbose();

// Connect to your SQLite database
let db = new sqlite3.Database('./products.db');

// Fetch products from the SQLite database
app.get('/api/products', (req, res) => {
  const { category, brand, segment, search } = req.query;

  let query = "SELECT * FROM products WHERE 1=1"; // Base query
  let params = []; // Array to hold query parameters

  // Apply filters if they are provided
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (segment) {
    query += " AND segment = ?";
    params.push(segment);
  }
  if (brand) {
    query += " AND brand = ?";
    params.push(brand);
  }
  if (search) {
    query += " AND (title LIKE ? OR sku LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('SQL Query:', query); // Log the SQL query for debugging
    console.log('Result:', rows); // Log the result for debugging
    res.setHeader('Content-Type', 'application/json');
    res.json(rows); // Return the products from the database
  });
});



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
    const { category, subcategory, segment, search } = req.query;
    let filteredProducts = products;
  
    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (subcategory) {
      filteredProducts = filteredProducts.filter(p => p.subcategory.toLowerCase() === subcategory.toLowerCase());
    }
    if (segment) {
      filteredProducts = filteredProducts.filter(p => p.segment.toLowerCase() === segment.toLowerCase());
    }
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }
  
    res.json(filteredProducts);
  });
  

/**
 * @swagger
 * /api/pricing-profile:
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
 *                 example: "Holiday Discount"
 *               type:
 *                 type: string
 *                 enum: [fixed, percentage]
 *                 example: "percentage"
 *               value:
 *                 type: number
 *                 example: 10
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

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
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
