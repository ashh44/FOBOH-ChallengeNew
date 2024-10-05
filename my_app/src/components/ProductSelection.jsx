import React from 'react';

function ProductSelection({ products, onProductSelect, selectAll }) {
    return (
        <div className="product-selection">
            <div>
                <input type="radio" name="selectionType" value="oneProduct" />
                <label>One Product</label>
                <input type="radio" name="selectionType" value="multipleProducts" />
                <label>Multiple Products</label>
                <input type="radio" name="selectionType" value="allProducts" />
                <label>All Products</label>
            </div>
            <button onClick={selectAll}>Select All</button>
            {products.map(product => (
                <div key={product.sku}>
                    <input
                        type="checkbox"
                        onChange={() => onProductSelect(product.sku)}
                    />
                    {product.title} - {product.sku}
                </div>
            ))}
        </div>
    );
}

export default ProductSelection;
