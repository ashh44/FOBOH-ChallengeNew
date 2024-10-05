import React, { useState, useEffect } from 'react';
import ProductFilter from './components/ProductFilter';
import ProductSelection from './components/ProductSelection';
import PriceAdjustment from './components/PriceAdjustment';
import PricingSummary from './components/PricingSummary';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // Define states
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [adjustmentType, setAdjustmentType] = useState('fixed');
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [pricingDetails, setPricingDetails] = useState({
    originalPrice: 0,
    newPrices: {}, // Change this to store new prices for each selected product
  });

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?${new URLSearchParams(filters)}`);
        const data = await response.json();
        setProducts(data); // Set the products fetched from backend
        if (data.length > 0) {
          setPricingDetails(prev => ({
            ...prev,
            originalPrice: data[0].price, // Set original price for the first product (or based on selection)
            newPrices: { [data[0].id]: data[0].price }, // Initialize new prices
          }));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (filterType, filterValue) => {
    setFilters(prev => ({ ...prev, [filterType]: filterValue }));
  };

  const handleProductSelect = productId => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    // Update original price based on the selected product
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setPricingDetails(prev => ({
        ...prev,
        originalPrice: selectedProduct.price,
        newPrices: { ...prev.newPrices, [productId]: selectedProduct.price }, // Reset new price to original
      }));
    }
    console.log('Selected Products:', [...selectedProducts, productId]);
  };

  const handleSelectAll = () => {
    setSelectedProducts(products.map(product => product.id));
  };

  const handleAdjustmentChange = (type, value) => {
    setAdjustmentType(type);
    setAdjustmentValue(value);

    // Calculate new prices for all selected products
    const updatedPrices = {};
    
    selectedProducts.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      let adjustedPrice = product.price; // Start with the original price

      if (type === 'fixed') {
        adjustedPrice += parseFloat(value); // Add or subtract fixed amount
      } else if (type === 'dynamic') {
        const percentageAdjustment = (parseFloat(value) / 100) * adjustedPrice;
        adjustedPrice += percentageAdjustment; // Increase or decrease by percentage
      }

      updatedPrices[productId] = Math.max(adjustedPrice, 0); // Ensure price does not go negative
    });

    // Update the pricing details with all new prices
    setPricingDetails(prev => ({
      ...prev,
      newPrices: updatedPrices,
    }));

    // Log the updated prices for debugging
    console.log('Updated Prices:', updatedPrices);
  };

  return (
    <div className="App">
      <h1>Pricing Profile Manager</h1>
      <ProductFilter filters={filters} onFilterChange={handleFilterChange} />
      <ProductSelection
        products={products}
        onProductSelect={handleProductSelect}
        selectAll={handleSelectAll}
        selectedProducts={selectedProducts}
      />
      <PriceAdjustment 
        basePrice={pricingDetails.originalPrice} 
        adjustmentType={adjustmentType}
        adjustmentValue={adjustmentValue}
        onAdjustmentChange={handleAdjustmentChange} 
      />
      <PricingSummary
        originalPrice={pricingDetails.originalPrice}
        newPrices={pricingDetails.newPrices}
        selectedProducts={selectedProducts.map(id => products.find(p => p.id === id))} // Pass selected products
      />
    </div>
  );
}

export default App;
