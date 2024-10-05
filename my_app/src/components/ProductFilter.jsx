import React, { useState, useEffect } from 'react';

function ProductFilter({ filters, onFilterChange }) {
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    const categoryOptions = {
        wine: ['Red', 'White', 'Rosé', 'Orange', 'Sparkling', 'Port/Dessert'],
        beer: ['Lager', 'Ale', 'Stout', 'IPA', 'Wheat Beer'],
        liquor: ['Whiskey', 'Vodka', 'Rum', 'Gin'],
        cider: ['Dry Cider', 'Sweet Cider'],
        premixed: ['RTD Cocktails', 'Hard Seltzers'],
        other: ['Miscellaneous'],
    };

    useEffect(() => {
        if (selectedCategory) {
            setSubCategories(categoryOptions[selectedCategory]);
            onFilterChange('segment', ''); // Reset segment when category changes
        } else {
            setSubCategories([]);
        }
    }, [selectedCategory, onFilterChange]);

    return (
        <div className="product-filter">
            <input
                type="text"
                placeholder="Search by Product Name or SKU"
                onChange={e => onFilterChange('search', e.target.value)}
            />
            <select onChange={e => {
                setSelectedCategory(e.target.value);
                onFilterChange('category', e.target.value);
            }}>
                <option value="">Select Category</option>
                <option value="wine">Wine</option>
                <option value="beer">Beer</option>
                <option value="liquor">Liquor & Spirits</option>
                <option value="cider">Cider</option>
                <option value="premixed">Premixed & Ready-to-Drink</option>
                <option value="other">Other</option>
            </select>
            <select onChange={e => onFilterChange('segment', e.target.value)} disabled={!selectedCategory}>
                <option value="">Select Segment</option>
                {subCategories.map((segment, index) => (
                    <option key={index} value={segment.toLowerCase()}>{segment}</option>
                ))}
            </select>
            <select onChange={e => onFilterChange('brand', e.target.value)}>
                <option value="">Select Brand</option>
                <option value="highgarden">High Garden</option>
                <option value="koyama">Koyama Wines</option>
                <option value="lacourte">Lacourte-Godbillon</option>
            </select>
        </div>
    );
}

export default ProductFilter;
