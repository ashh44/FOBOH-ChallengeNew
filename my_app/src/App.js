import React, { useState, useEffect } from 'react';

function ProductPriceFetcher() {
  // Dropdown state
  const [category, setCategory] = useState(''); // for category like 'wine'
  const [segment, setSegment] = useState(''); // for segment like 'red'
  const [brand, setBrand] = useState(''); // for brand like 'High Garden'

  // State to store product price
  const [price, setPrice] = useState(null); 

  // Define categories, segments, and brands
  const categories = ['Wine', 'Beer', 'Liquor & Spirits', 'Cider', 'Premixed & Ready-to-Drink', 'Other'];
  const segments = {
    wine: ['Red', 'White', 'Rosé', 'Orange', 'Sparkling', 'Port/Dessert'],
    beer: ['Lager', 'Ale', 'Stout', 'IPA', 'Wheat Beer'],
    liquor : ['Whiskey', 'Vodka', 'Rum', 'Gin'],
    cider: ['Dry Cider', 'Sweet Cider'],
    premixed: ['RTD Cocktails', 'Hard Seltzers'],
    other: ['Miscellaneous'],
  };
  const brands = ['High Garden', 'Koyama Wines', 'Lacourte-Godbillon'];

  // Function to fetch product price based on the selections
  const fetchPrice = async () => {
    if (category && segment && brand) {  // Fetch only if all selections are made
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();

        // Find the product matching the selected category, segment, and brand
        const selectedProduct = products.find(
          (product) =>
            product.category.toLowerCase() === category.toLowerCase() &&
            product.brand.toLowerCase() === brand.toLowerCase() &&
            product.title.toLowerCase().includes(segment.toLowerCase())
        );

        if (selectedProduct) {
          setPrice(selectedProduct.price); // Set the price of the product
        } else {
          setPrice('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    }
  };

  // Use Effect to fetch the price every time category, segment, or brand changes
  useEffect(() => {
    fetchPrice();
  }, [category, segment, brand]); // Re-run fetch when dropdown values change

  return (
    <div>
      <h1>Product Price Finder</h1>

      {/* Category Dropdown */}
      <div>
        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat.toLowerCase()}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Segment Dropdown */}
      <div>
        <label>Segment: </label>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} disabled={!category}>
          <option value="">Select Segment</option>
          {category && segments[category]?.map((seg, index) => (
            <option key={index} value={seg.toLowerCase()}>{seg}</option>
          ))}
        </select>
      </div>

      {/* Brand Dropdown */}
      <div>
        <label>Brand: </label>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} disabled={!segment}>
          <option value="">Select Brand</option>
          {brands.map((br, index) => (
            <option key={index} value={br.toLowerCase()}>{br}</option>
          ))}
        </select>
      </div>

      {/* Display the price */}
      <div style={{ marginTop: '20px' }}>
        {price !== null && <h2>Price: ${price}</h2>}
      </div>
    </div>
  );
}

export default ProductPriceFetcher;
