const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');
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
app.get('/api/products', (req, res) => {
  const { category, brand, segment, search } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

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
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/pricing-profiles:
 *   post:
 *     summary: Create a new pricing profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PricingProfile'
 *     responses:
 *       201:
 *         description: Created pricing profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingProfile'
 */

db.run(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT,
    product_sku TEXT,
   
    adjusted_price REAL
  
  )
`);

// POST endpoint to create a new profile
// app.post('/api/profiles', (req, res) => {
//   const { profileName, products } = req.body;

//   const insertProfileQuery = `
//     INSERT INTO profiles (profile_name, product_sku, adjusted_price)
//     VALUES (?, ?, ?)
//   `;

//   // Begin transaction
//   db.serialize(() => {
//     db.run('BEGIN TRANSACTION');

//     products.forEach(product => {
//       db.run(insertProfileQuery, [profileName, product.sku, product.adjustedPrice]); // Only insert sku and adjustedPrice
//     });

//     db.run('COMMIT', (err) => {
//       if (err) {
//         return res.status(500).json({ error: 'Failed to save profile' });
//       }
//       res.status(200).json({ message: 'Profile saved successfully' });
//     });
//   });
// });

app.post('/api/profiles', (req, res) => {
  const { profileId, profileName, products } = req.body;

  const insertProfileQuery = `
    INSERT INTO profiles (profile_name, product_sku, adjusted_price)
    VALUES (?, ?, ?)
  `;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    products.forEach(product => {
      db.run(insertProfileQuery, [profileName, product.sku, product.adjustedPrice]);
    });

    db.run('COMMIT', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save profile' });
      }
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


app.post('/api/pricing-profiles', (req, res) => {
  const { name, type, value } = req.body;
  const id = uuidv4();

  db.run('INSERT INTO pricing_profiles (id, name, type, value) VALUES (?, ?, ?, ?)',
    [id, name, type, value],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, name, type, value });
    }
  );
});

/**
 * @swagger
 * /api/pricing-profiles:
 *   get:
 *     summary: Get all pricing profiles
 *     responses:
 *       200:
 *         description: List of pricing profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PricingProfile'
 */
app.get('/api/pricing-profiles', (req, res) => {
  db.all('SELECT * FROM pricing_profiles', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/pricing-profiles/{id}:
 *   put:
 *     summary: Update a pricing profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PricingProfile'
 *     responses:
 *       200:
 *         description: Updated pricing profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingProfile'
 */
app.put('/api/pricing-profiles/:id', (req, res) => {
  const { name, type, value } = req.body;
  const { id } = req.params;

  db.run('UPDATE pricing_profiles SET name = ?, type = ?, value = ? WHERE id = ?',
    [name, type, value, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Pricing profile not found' });
      }
      res.json({ id, name, type, value });
    }
  );
});

/**
 * @swagger
 * /api/pricing-profiles/{id}:
 *   delete:
 *     summary: Delete a pricing profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing profile deleted
 */
app.delete('/api/pricing-profiles/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM pricing_profiles WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pricing profile not found' });
    }
    res.json({ message: 'Pricing profile deleted' });
  });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
