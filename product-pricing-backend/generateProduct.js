// generateProduct.js
const categories = ['Wine', 'Beer', 'Liquor & Spirits', 'Cider', 'Premixed & Ready-to-Drink', 'Other'];
const segments = {
  wine: ['Red', 'White', 'Rosé', 'Orange', 'Sparkling', 'Port/Dessert'],
  beer: ['Lager', 'Ale', 'Stout', 'IPA', 'Wheat Beer'],
  liquor: ['Whiskey', 'Vodka', 'Rum', 'Gin'],
  cider: ['Dry Cider', 'Sweet Cider'],
  premixed: ['RTD Cocktails', 'Hard Seltzers'],
  other: ['Miscellaneous'],
};
const brands = ['High Garden', 'Koyama Wines', 'Lacourte-Godbillon'];

// Utility function to generate random price
const generateRandomPrice = () => parseFloat((Math.random() * 100 + 10).toFixed(2)); // Ensure price is a number

// Create combinations
const products = [];

Object.keys(segments).forEach(categoryKey => {
  segments[categoryKey].forEach(segment => {
    brands.forEach(brand => {
      // Push a new product combination into the array
      products.push({
        title: `${segment} ${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}`,
        sku: `${categoryKey.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 10000)}`, // Generate random SKU
        category: categoryKey,
        segment: segment,
        brand: brand,
        price: generateRandomPrice(),
      });
    });
  });
});

module.exports = products;
