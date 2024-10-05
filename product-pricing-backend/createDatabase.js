// createDatabase.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./products.db');
const products = require('./generateProduct'); // Import the products array

db.serialize(() => {
  // Optionally clear out old data first
  db.run("DELETE FROM products", (err) => {
    if (err) {
      console.error("Error clearing old data:", err);
    }
  });

  // Create the products table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    segment TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL
  )`);

  // Insert product data into the database
  const stmt = db.prepare("INSERT INTO products (title, sku, category, segment, brand, price) VALUES (?, ?, ?, ?, ?, ?)");

  products.forEach(product => {
    stmt.run(product.title, product.sku, product.category, product.segment, product.brand, product.price);
  });

  stmt.finalize();
  console.log('Products inserted into the database');
});

db.close();
