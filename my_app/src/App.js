import React, { useState,useEffect } from 'react';
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
  const [selectedProfile, setSelectedProfile] = useState(false);
  const[profiles, setProfiles] = useState([]);
  // New state variables for price adjustment
  const [showResultsTable, setShowResultsTable] = useState(false);

  const [basedOnPrice, setBasedOnPrice] = useState(0); // Default price set to 500
  const [adjustmentMode, setAdjustmentMode] = useState('fixed'); // Default adjustment mode
  const [adjustmentValue, setAdjustmentValue] = useState(0); // Default adjustment value
  const [adjustmentIncrement, setAdjustmentIncrement] = useState('increase'); // Default increment
  const [adjustedProducts, setAdjustedProducts] = useState([]);

  const [quantityInput, setQuantityInput] = useState(1); // Default quantity
  const [isDisabled, setIsDisabled] = useState(false); // State for disabling buttons after adding a product

  const categories = ['Wine', 'Beer', 'Liquor', 'Cider', 'Premixed & Ready-to-Drink', 'Other'];
  const segments = {
    wine: ['Red', 'White', 'Rosé', 'Orange', 'Sparkling', 'Port/Dessert'],
    beer: ['Lager', 'Ale', 'Stout', 'IPA', 'Wheat Beer'],
    liquor: ['Whiskey', 'Vodka', 'Rum', 'Gin'],
    cider: ['Dry Cider', 'Sweet Cider'],
    premixed: ['RTD Cocktails', 'Hard Seltzers'],
    other: ['Miscellaneous'],
  };
  const brands = ['High Garden', 'Koyama Wines', 'Lacourte-Godbillon'];


  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pricing-profiles');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error("There was a problem fetching the profiles:", error);
        setError("Failed to load profiles. Please try again later.");
      }
    };
    fetchProfiles();
  }, []);
  const handleProfileComplete = async () => {
    const unselectedProducts = selectedProducts.filter(product => !product.checked);
  
    const allProducts = [
      ...adjustedProducts.map(product => ({
        sku: product.sku,
        adjustedPrice: product.adjustedPrice, // Use adjusted price for selected products
      })),
      ...unselectedProducts.map(product => ({
        sku: product.sku,
        adjustedPrice: product.price, // Use original price for unselected products
      }))
    ];
  
    const profileName = `Profile_${Date.now()}`;  // Generate a profile name
  
    try {
      if (selectedProfile) {
        // Update the existing profile with new products
        const response = await fetch(`http://localhost:5000/api/profiles/${selectedProfile}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: allProducts,
          }),
        });
  
        if (response.ok) {
          alert('Profile updated successfully!');
        } else {
          alert('Failed to update profile');
        }
      } else {
        // Create a new profile and add products
        const response = await fetch('http://localhost:5000/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileName,
            products: allProducts,
          }),
        });
  
        if (response.ok) {
          const newProfile = await response.json(); // Assuming the new profile is returned
          setProfiles([...profiles, newProfile]); // Add new profile to the dropdown
          setSelectedProfile(newProfile.id); // Set newly created profile as selected
          alert('Profile created and saved successfully!');
        } else {
          alert('Failed to create profile');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

// Radio button functionality
const handleRadioChange = (type) => {
  setSearchType(type);
  setSelectedProducts([]); // Clear selected products when switching modes
  setIsDisabled(false); // Reset the disabled state when changing modes
  if (type === 'all') {
    fetchAllProducts(); // Automatically fetch all products if 'all' is selected
  }
};

// Fetch all products for "All Products" mode
const fetchAllProducts = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await fetch('http://localhost:5000/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const products = await response.json();
    setSelectedProducts(products); // Add all products to the result table
  } catch (error) {
    setError('Error fetching all products. Please try again.');
    console.error('Error fetching all products:', error);
  } finally {
    setLoading(false);
  }
};

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
        setQuantityInput(1); // Reset quantity input value

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

        if (searchType === 'one') {
          setIsDisabled(true); // Disable buttons after adding one product in "One Product" mode
        }

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
  
const addProduct = async () => {
  if (category && segment && brand) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const products = await response.json();
      const matchingProduct = products.find(
        product =>
          product.category.toLowerCase() === category.toLowerCase() &&
          product.brand.toLowerCase() === brand.toLowerCase() &&
          product.title.toLowerCase().includes(segment.toLowerCase())
      );

      if (matchingProduct) {
        const newProduct = {
          id: matchingProduct.id,
          category: matchingProduct.category,
          segment,
          brand: matchingProduct.brand,
          sku: matchingProduct.sku,
          price: matchingProduct.price,
          quantity: quantityInput,
          title: matchingProduct.title
        };
        setSelectedProducts(prevSelected => [...prevSelected, newProduct]);
        
        // Reset input fields
        setCategory('');
        setSegment('');
        setBrand('');
        setSku('');
        setQuantityInput(1);
      } else {
        setError('No matching product found. Please try different selections.');
      }
    } catch (error) {
      setError('Error fetching product data. Please try again.');
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  } else {
    alert("Please select category, segment, and brand.");
  }
};
  // const increaseQuantity = (productId) => {
  //   setSelectedProducts(prevProducts =>
  //     prevProducts.map(product =>
  //       product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
  //     )
  //   );
  // };

  // // Function to decrease quantity
  // const decreaseQuantity = (productId) => {
  //   setSelectedProducts(prevProducts =>
  //     prevProducts.map(product =>
  //       product.id === productId && product.quantity > 1 ? { ...product, quantity: product.quantity - 1 } : product
  //     )
  //   );
  // };

  // Function to remove product
  const removeProduct = productId => {
    setSelectedProducts(prevSelected => 
      prevSelected.filter(product => product.id !== productId)
    );

    setIsDisabled(false); // Re-enable buttons when a product is removed in "One Product" mode

  };
  const handleCheckboxChange = (productId) => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, checked: !product.checked } : product
      )
    );
  };


  const calculateNewPrice = (productPrice) => {
    if (typeof productPrice !== 'number') {
      return '0.00';
    }
    let newPrice;
    const adjustment = adjustmentMode === 'fixed' 
      ? adjustmentValue 
      : (adjustmentValue / 100) * productPrice;
  
    if (adjustmentIncrement === 'increase') {
      newPrice = productPrice + adjustment;
    } else {
      newPrice = productPrice - adjustment;
    }
    return Math.max(0, newPrice).toFixed(2); // Ensure price doesn't go below 0
  };

  const applyPriceAdjustment = () => {
    const updatedProducts = selectedProducts.map(product => {
      if (product.checked) {
        const newPrice = calculateNewPrice(product.price);
        return { ...product, adjustedPrice: newPrice };
      }
      return { ...product, adjustedPrice: product.price.toFixed(2) };
    });
  
    // Set only the checked products in adjustedProducts
    setAdjustedProducts(updatedProducts.filter(product => product.checked));
    setShowResultsTable(true); // Show the final table
  };
  

  const calculateTotalNewPrice = () => {
    return adjustedProducts.reduce((total, product) => {
      const price = product.adjustedPrice ? parseFloat(product.adjustedPrice) : product.price;
      return total + price * product.quantity;
    }, 0).toFixed(2);
  };
  return (
    <div className="container">
      <h1 className="heading">User Profile Setup</h1>
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

       {/* User profile dropdown */}
       <label htmlFor="profile-select">Select Profile:</label>
<select
  id="profile-select"
  value={selectedProfile}
  onChange={(e) => setSelectedProfile(e.target.value)}
>
  <option value="">Select Profile</option>
  {Array.isArray(profiles) && profiles.map((profile) => (
    <option key={profile.id} value={profile.id}>
      {profile.name}
    </option>
  ))}
</select>

   {/* Radio Buttons */}
   <div className="radioContainer">
        <label>
          <input type="radio" value="one" checked={searchType === 'one'} onChange={() => handleRadioChange('one')} /> One Product
        </label>
        <label>
          <input type="radio" value="multiple" checked={searchType === 'multiple'} onChange={() => handleRadioChange('multiple')} /> Multiple Products
        </label>
        <label>
          <input type="radio" value="all" checked={searchType === 'all'} onChange={() => handleRadioChange('all')} /> All Products
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
           disabled={searchType === 'all' || isDisabled} 
        />
        <button onClick={search} className="button" disabled={isDisabled}>Search</button>


        {/* Search by SKU */}
        <input 
          type="text" 
          placeholder="Product SKU" 
          value={sku} 
          onChange={(e) => setSku(e.target.value)} 
          className="skuInput" 
          disabled={searchType === 'all' || isDisabled}
        />
        <button onClick={searchBySku} className="button" disabled={isDisabled}>Search by SKU</button>
      </div>

      <div className="dropdownContainer">
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={searchType === 'all' || isDisabled}>
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat.toLowerCase()}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="dropdownContainer">
        <label>Segment:</label>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} disabled={!category || isDisabled}>
          <option value="">Select Segment</option>
          {category && segments[category]?.map((seg, index) => (
            <option key={index} value={seg.toLowerCase()}>{seg}</option>
          ))}
        </select>
      </div>

      <div className="dropdownContainer">
        <label>Brand:</label>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} disabled={!segment || isDisabled}>
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

      {/* Add button to update the list */}
      <button onClick={addProduct} className="button" disabled={isDisabled}>
        Add
      </button>
  

{/* Selected Products List */}
<div className="selectedProductsContainer">
        <h2 className="subheading">Showing Results:</h2>
        {selectedProducts.length > 0 ? (
          <ul className="selectedProductsList">
            {selectedProducts.map((product, index) => (
              <li key={index} className="selectedProductItem">
                <input 
                  type="checkbox" 
                  checked={product.checked} 
                  onChange={() => handleCheckboxChange(product.id)} 
                />
                <strong>Category:</strong> {product.category} <br />
                <strong>Segment:</strong> {product.segment} <br />
                <strong>Brand:</strong> {product.brand} <br />
                <strong>SKU:</strong> {product.sku} <br />
                <strong>Price:</strong> ${product.price.toFixed(2)} <br />
                <strong>Quantity:</strong> {product.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No products added yet.</p>
        )}
      </div>

      <div className="dropdownContainer">
        <label>Based On Price:</label>
        <select value={basedOnPrice} onChange={(e) => setBasedOnPrice(Number(e.target.value))}>
        <option value="">Select Base Price</option>
          <option value="">current</option>
          <option value="">Global Wholesale Price</option>
         
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
     

      <button onClick={applyPriceAdjustment} className="button">Apply Price Adjustment</button>

      </div>

      {showResultsTable && adjustedProducts.length > 0 ? (
  <div className="selectedProductsContainer">
    <h2 className="subheading">Selected Products:</h2>
    <table className="resultsTable">
      <thead>
        <tr>
          <th>Select</th>
          <th>Product Title</th>
          <th>SKU Code</th>
          <th>Category</th>
          <th>Original Price</th>
          <th>Adjustment</th>
          <th>Adjusted Price</th>
          {/* <th>Quantity</th> */}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  {adjustedProducts.map(product => (
    <tr key={product.id}>
      <td>
        <input 
          type="checkbox" 
          checked={product.checked} 
          onChange={() => handleCheckboxChange(product.id)} 
          disabled
        />
      </td>
      <td>{product.title}</td>
      <td>{product.sku}</td>
      <td>{product.category}</td>
      <td>${product.price.toFixed(2)}</td>
      <td>
        {adjustmentMode === 'fixed' 
          ? `$${adjustmentValue}` 
          : `${adjustmentValue}%`
        }
      </td>
      <td>${product.adjustedPrice || product.price.toFixed(2)}</td>
      {/* <td>
        <button onClick={() => decreaseQuantity(product.id)} className="quantityButton">-</button>
        <span>{product.quantity}</span>
        <button onClick={() => increaseQuantity(product.id)} className="quantityButton">+</button>
      </td> */}
      <td>
        <button onClick={() => removeProduct(product.id)} className="removeButton">
          Remove
        </button>
      </td>
    </tr>
  ))}
</tbody>

    </table>
  </div>
) : (
  <p>No products selected</p>
)}


      <div className="totalPriceContainer">
        <h2>Total New Price: ${calculateTotalNewPrice()}</h2> {/* Show total new price */}
      </div>

      <button onClick={handleProfileComplete} className="button">
  Profile Complete
</button>

    </div>
  );
}

export default ProductPriceFetcher;