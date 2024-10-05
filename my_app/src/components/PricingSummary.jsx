import React from 'react';

function PricingSummary({ originalPrice, newPrices, selectedProducts }) {
    return (
        <div className="pricing-summary">
            <p>Original Price: ${originalPrice.toFixed(2)}</p>
            <h3>New Prices for Selected Products:</h3>
            <ul>
                {selectedProducts.map(product => (
                    <li key={product.id}>
                        {product.name}: ${newPrices[product.id]?.toFixed(2) || '0.00'}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PricingSummary;
