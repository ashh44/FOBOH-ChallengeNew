import React, { useState } from 'react';
import './index.css'; // Assuming your CSS is in index.css

function ProductPriceFetcher() {
  const [category, setCategory] = useState('');
  const [segment, setSegment] = useState('');
  const [brand, setBrand] = useState('');
  const [searchType, setSearchType] = useState('one');
  const [searchQuery, setSearchQuery] = useState('');
  const [sku, setSku] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New state variables for price adjustment
  const [baseOnPrice, setBaseOnPrice] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState('fixed');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentIncrement, setAdjustmentIncrement] = useState('increase');

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

  const fetchProducts = async () => {
    if (category && segment && brand) {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const products = await response.json();
        const matchingProducts = products.filter(
          product =>
            product.category.toLowerCase() === category.toLowerCase() &&
            product.brand.toLowerCase() === brand.toLowerCase() &&
            product.title.toLowerCase().includes(segment.toLowerCase())
        );

        if (matchingProducts.length > 0) {
          matchingProducts.forEach(product => {
            const quantity = prompt(`Enter quantity for ${product.title}:`, 1);
            if (quantity && !isNaN(quantity) && Number(quantity) > 0) {
              const productWithQuantity = { ...product, quantity: Number(quantity) };
              setSelectedProducts(prevSelected => {
                const newProducts = prevSelected.filter(sp => sp.id !== productWithQuantity.id);
                return [...newProducts, productWithQuantity];
              });
            }
          });
        }
      } catch (error) {
        setError('Error fetching product data. Please try again.');
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const removeProduct = productId => {
    setSelectedProducts(prevSelected => 
      prevSelected.filter(product => product.id !== productId)
    );
  };

  return (
    <div className="container">
      <h1 className="heading">Product Price Finder</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

      <div className="radioContainer">
        <label>
          <input type="radio" value="one" checked={searchType === 'one'} onChange={() => setSearchType('one')} /> One Product
        </label>
        <label>
          <input type="radio" value="multiple" checked={searchType === 'multiple'} onChange={() => setSearchType('multiple')} /> Multiple Products
        </label>
        <label>
          <input type="radio" value="all" checked={searchType === 'all'} onChange={() => setSearchType('all')} /> All Products
        </label>
      </div>

      <h2 className="subheading">Search for Products</h2>
      <div className="searchContainer">
        <input type="text" placeholder="Search for product..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="searchBar" disabled={searchType === 'all'} />
        <input type="text" placeholder="Product SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="skuInput" disabled={searchType === 'all'} />
      </div>

      <div className="dropdownContainer">
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={searchType === 'all'}>
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat.toLowerCase()}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="dropdownContainer">
        <label>Segment:</label>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} disabled={!category}>
          <option value="">Select Segment</option>
          {category && segments[category]?.map((seg, index) => (
            <option key={index} value={seg.toLowerCase()}>{seg}</option>
          ))}
        </select>
      </div>

      <div className="dropdownContainer">
        <label>Brand:</label>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} disabled={!segment}>
          <option value="">Select Brand</option>
          {brands.map((br, index) => (
            <option key={index} value={br.toLowerCase()}>{br}</option>
          ))}
        </select>
      </div>

      <div className="dropdownContainer">
        <label>Based On:</label>
        <select value={baseOnPrice} onChange={(e) => setBaseOnPrice(e.target.value)}>
          <option value="">Select Base On Price</option>
          <option value="global">Global Wholesale Price</option>
        </select>
      </div>

      <div className="dropdownContainer">
        <label>Set Price Adjustment Mode:</label>
        <div className="radioContainer">
          <label>
            <input type="radio" value="fixed" checked={adjustmentMode === 'fixed'} onChange={() => setAdjustmentMode('fixed')} /> Fixed ($)
          </label>
          <label>
            <input type="radio" value="dynamic" checked={adjustmentMode === 'dynamic'} onChange={() => setAdjustmentMode('dynamic')} /> Dynamic (%)
          </label>
        </div>
        <input 
          type="number" 
          placeholder={adjustmentMode === 'fixed' ? 'Adjustment: $ _____' : 'Adjustment: _____ %'} 
          value={adjustmentValue} 
          onChange={(e) => setAdjustmentValue(e.target.value)} 
          className="adjustmentInput"
        />
      </div>

      <div className="dropdownContainer">
        <label>Set Price Adjustment Increment:</label>
        <div className="radioContainer">
          <label>
            <input type="radio" value="increase" checked={adjustmentIncrement === 'increase'} onChange={() => setAdjustmentIncrement('increase')} /> Increase (+)
          </label>
          <label>
            <input type="radio" value="decrease" checked={adjustmentIncrement === 'decrease'} onChange={() => setAdjustmentIncrement('decrease')} /> Decrease (-)
          </label>
        </div>
      </div>

      <button onClick={fetchProducts} className="button">Fetch Products</button>

      <div className="selectedProductsContainer">
        <h2 className="subheading">Selected Products:</h2>
        {selectedProducts.length > 0 ? (
          <ul className="productList">
            {selectedProducts.map(product => (
              <li key={product.id} className="productItem">
                {product.title} - ${product.price} × {product.quantity} = ${product.price * product.quantity} 
                <button onClick={() => removeProduct(product.id)} className="removeButton">Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products selected</p>
        )}
      </div>
    </div>
  );
}

export default ProductPriceFetcher;
