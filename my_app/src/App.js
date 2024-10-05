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
  const [basedOnPrice, setBasedOnPrice] = useState(0); // Default price set to 500
  const [adjustmentMode, setAdjustmentMode] = useState('fixed'); // Default adjustment mode
  const [adjustmentValue, setAdjustmentValue] = useState(0); // Default adjustment value
  const [adjustmentIncrement, setAdjustmentIncrement] = useState('increase'); // Default increment

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

  const calculateNewPrice = (productPrice) => {
    let newPrice;
    const adjustment = adjustmentMode === 'fixed' ? adjustmentValue : (adjustmentValue / 100) * productPrice;
  
    if (adjustmentIncrement === 'increase') {
      newPrice = productPrice + adjustment;
    } else {
      newPrice = productPrice - adjustment;
    }
    return newPrice.toFixed(2); // Return new price formatted to 2 decimal places
  };
  
  const calculateTotalNewPrice = () => {
    return selectedProducts.reduce((total, product) => {
      const newPrice = calculateNewPrice(product.price);
      return total + parseFloat(newPrice) * product.quantity; // Multiply by quantity
    }, 0).toFixed(2); // Return total price formatted to 2 decimal places
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
        <label>Based On Price:</label>
        <select value={basedOnPrice} onChange={(e) => setBasedOnPrice(Number(e.target.value))}>
          <option value="">Select Base Price</option>
          <option value="">Global Wholesale Price</option>
          {/* Add more options as needed */}
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
          onChange={(e) => setAdjustmentValue(Number(e.target.value))} 
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

      {/* Selected Products and Calculation Results */}

     {/* Selected Products and Calculation Results */}
     <div className="selectedProductsContainer">
  <h2 className="subheading">Selected Products:</h2>
  {selectedProducts.length > 0 ? (
    <table className="resultsTable">
      <thead>
        <tr>
          <th>Product Title</th>
          <th>SKU Code</th>
          <th>Category</th>
          <th>Based On Price</th>
          <th>Adjustment</th>
          <th>New Price</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {selectedProducts.map(product => {
          const newPrice = calculateNewPrice(product.price);
          return (
            <tr key={product.id}>
              <td>{product.title}</td>
              <td>{product.sku}</td>
              <td>{product.category}</td>
              <td>${product.price.toFixed(2)}</td> {/* Use product.price for Based On Price */}
              <td>${adjustmentValue.toFixed(2)}</td>
              <td>${newPrice}</td>
              <td>
                <button onClick={() => removeProduct(product.id)} className="removeButton">
                  Remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p>No products selected</p>
  )}
</div>

<div className="totalPriceContainer">
        <h2>Total New Price: ${calculateTotalNewPrice()}</h2> {/* Show total new price */}
      </div>

      <button className="completeProfileButton">Profile Complete</button>
    </div>


  );
}

export default ProductPriceFetcher;
