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

  const [quantityInput, setQuantityInput] = useState(1); // Default quantity

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

  const search = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');

      const products = await response.json();

      // Convert searchQuery into an array of lowercase words
      const searchTerms = searchQuery.toLowerCase().split(' ').map(term => term.trim()).filter(term => term); // Trim spaces

      // Attempt to match search terms to category, segment, and brand
      const matchedCategory = categories.find(cat => searchTerms.includes(cat.toLowerCase()));
      let matchedSegment = '';
      let matchedBrand = '';

      // Check for segment match within the matched category
      if (matchedCategory) {
        Object.keys(segments).forEach(segCategory => {
          if (segCategory.toLowerCase() === matchedCategory.toLowerCase()) {
            segments[segCategory].forEach(seg => {
              if (searchTerms.includes(seg.toLowerCase())) {
                matchedSegment = seg;
              }
            });
          }
        });
      }

      // Check for brand match; handle multi-word brands
      matchedBrand = brands.find(br => searchTerms.join(' ').includes(br.toLowerCase()));

      // Ensure all fields (category, segment, brand) are populated
      if (!matchedCategory || !matchedSegment || !matchedBrand) {
        let missingFields = [];
        if (!matchedCategory) missingFields.push('Category');
        if (!matchedSegment) missingFields.push('Segment');
        if (!matchedBrand) missingFields.push('Brand');

        alert(`Please complete all required fields: ${missingFields.join(', ')}.`);
        return;
      }

      // Set the state values for category, segment, and brand
      setCategory(matchedCategory.toLowerCase());
      setSegment(matchedSegment.toLowerCase());
      setBrand(matchedBrand.toLowerCase());

      // Now perform the search with the populated fields
      const matchingProducts = products.filter(product => {
        return (
          product.category.toLowerCase() === matchedCategory.toLowerCase() &&
          product.title.toLowerCase().includes(matchedSegment.toLowerCase()) &&
          product.brand.toLowerCase() === matchedBrand.toLowerCase()
        );
      });

      if (matchingProducts.length > 0) {
        const selectedProduct = matchingProducts[0];
        const productWithQuantity = { ...selectedProduct, quantity: quantityInput }; // Use input value for quantity
        setSelectedProducts(prevSelected => [...prevSelected, productWithQuantity]);
        setQuantityInput(1); // Reset quantity input
      } else {
        setError('No products found for the given query.');
      }
    } catch (error) {
      setError('Error fetching product data. Please try again.');
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBySku = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');

      const products = await response.json();

      // Find the product by SKU
      const productBySku = products.find(product => product.sku.toLowerCase() === sku.toLowerCase());

      if (productBySku) {
        const productWithQuantity = { ...productBySku, quantity: quantityInput }; // Use input value for quantity
        setSelectedProducts(prevSelected => [...prevSelected, productWithQuantity]);
        setQuantityInput(1); // Reset quantity input
      } else {
        setError('No product found for the given SKU');
      }
    } catch (error) {
      setError('Error fetching product data by SKU. Please try again.');
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  

// Fetch products by category, segment, or brand, then prompt for quantity
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
            const productWithQuantity = { ...product, quantity: quantityInput }; // Use input value for quantity
            setSelectedProducts(prevSelected => {
              const newProducts = prevSelected.filter(sp => sp.id !== productWithQuantity.id);
              return [...newProducts, productWithQuantity];
            });
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

  const increaseQuantity = (productId) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
      )
    );
  };

  // Function to decrease quantity
  const decreaseQuantity = (productId) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId && product.quantity > 1 ? { ...product, quantity: product.quantity - 1 } : product
      )
    );
  };

  // Function to remove product
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
        {/* Search by category, segment, or brand */}
        <input 
          type="text" 
          placeholder="Search for product..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="searchBar" 
          disabled={searchType === 'all'} 
        />
        <button onClick={search} className="button">Search</button>

        {/* Search by SKU */}
        <input 
          type="text" 
          placeholder="Product SKU" 
          value={sku} 
          onChange={(e) => setSku(e.target.value)} 
          className="skuInput" 
          disabled={searchType === 'all'} 
        />
        <button onClick={searchBySku} className="button">Search by SKU</button>
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

      {/* Quantity Input Field */}
      <div className="dropdownContainer">
        <label>Quantity:</label>
        <input 
          type="number" 
          value={quantityInput} 
          onChange={(e) => setQuantityInput(Number(e.target.value))} 
          min="1"
          className="quantityInput"
        />
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
                <th>Quantity</th>
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
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      {/* Quantity Control with + and - buttons */}
                      <button onClick={() => decreaseQuantity(product.id)} className="quantityButton">-</button>
                      <span>{product.quantity}</span>
                      <button onClick={() => increaseQuantity(product.id)} className="quantityButton">+</button>
                    </td>
                    <td>${adjustmentValue.toFixed(2)}</td>
                    <td>${newPrice}</td>
                    <td>
                      {/* Remove product button */}
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
