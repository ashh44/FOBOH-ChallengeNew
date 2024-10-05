import React from 'react';

function PricingSummary({ products, selectedProducts, originalPrice, newPrices }) {
    return (
        <div className="pricing-summary">
            <h3>Pricing Summary</h3>
            <p>Original Price: ${originalPrice.toFixed(2)}</p>
            <h4>New Prices for Selected Products:</h4>
            <ul>
                {selectedProducts.map((productId) => {
                    const product = products.find(p => p.id === productId);
                    const newPrice = newPrices[productId] || 0; // Default to 0 if no new price is available

                    return (
                        <li key={productId}>
                            {product.title}: ${newPrice.toFixed(2)}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default PricingSummary;
