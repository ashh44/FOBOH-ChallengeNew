const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
// const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.use(cors());
app.use(express.json());

let db = new sqlite3.Database('./products.db');

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Pricing API',
      version: '1.0.0',
      description: 'API for managing products, pricing profiles, and applying price adjustments'
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./index.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         segment:
 *           type: string
 *         brand:
 *           type: string
 *         sku:
 *           type: string
 *         price:
 *           type: number
 *         wholesale_price:
 *           type: number
 *     PricingProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [fixed, percentage]
 *         value:
 *           type: number
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products or filter by category, brand, segment, and search query.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (_, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get products for a specific profile
app.get('/api/profiles/:profileName', (req, res) => {
  const profileName = req.params.profileName;

  db.all("SELECT * FROM profiles WHERE profile_name = ?", [profileName], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);  // This should return all rows for the given profileName
  });
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT,
    product_sku TEXT,
    adjusted_price REAL
  )`);
});


// Add or update products in profile
app.post('/api/profiles', (req, res) => {
  const { profileName, products } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Delete existing entries for the profile
    db.run('DELETE FROM profiles WHERE profile_name = ?', [profileName]);

    // Insert new products with adjusted prices
    const insertQuery = `INSERT INTO profiles (profile_name, product_sku, adjusted_price) VALUES (?, ?, ?)`;
    products.forEach(product => {
      db.run(insertQuery, [profileName, product.sku, product.adjustedPrice]);
    });

    db.run('COMMIT', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save profile' });
      res.status(200).json({ message: 'Profile updated successfully' });
    });
  });
});

app.put('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const { products } = req.body;

  // Clear existing products for the profile
  const deleteExistingQuery = `DELETE FROM profiles WHERE profile_name = ?`;
  db.run(deleteExistingQuery, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear existing profile' });
    }

    const insertProfileQuery = `INSERT INTO profiles (profile_name, product_sku, adjusted_price) VALUES (?, ?, ?)`;
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      products.forEach(product => {
        db.run(insertProfileQuery, [id, product.sku, product.adjustedPrice]);
      });

      db.run('COMMIT', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});