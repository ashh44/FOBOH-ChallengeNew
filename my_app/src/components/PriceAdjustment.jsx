import React, { useState } from 'react';

function PriceAdjustment({ basePrice, onAdjustmentChange }) {
    const [adjustmentType, setAdjustmentType] = useState('fixed');
    const [incrementType, setIncrementType] = useState('increase');
    const [adjustmentValue, setAdjustmentValue] = useState(0);

    const handleRecalculate = () => {
        let newPrice = parseFloat(basePrice);
        const adjustment = parseFloat(adjustmentValue);
        
        // Update newPrice based on adjustment type and increment type
        if (adjustmentType === 'fixed') {
            newPrice = incrementType === 'increase' ? newPrice + adjustment : newPrice - adjustment;
        } else if (adjustmentType === 'dynamic') {
            const percentageAdjustment = (adjustment / 100) * newPrice;
            newPrice = incrementType === 'increase' ? newPrice + percentageAdjustment : newPrice - percentageAdjustment;
        }
    
        // Prevent negative prices
        newPrice = Math.max(newPrice, 0);
    
        // Call the passed prop to update pricing in the parent component
        onAdjustmentChange(adjustmentType, adjustmentValue); // Update this line to also inform of type and value
    };
    

    return (
        <div className="price-adjustment">
            <select onChange={e => setAdjustmentType(e.target.value)}>
                <option value="global">Global wholesale price</option>
            </select>
            <div>
                <input
                    type="radio"
                    name="adjustmentType"
                    value="fixed"
                    onChange={e => setAdjustmentType(e.target.value)}
                    checked={adjustmentType === 'fixed'}
                />
                <label>Fixed ($)</label>
                <input
                    type="radio"
                    name="adjustmentType"
                    value="dynamic"
                    onChange={e => setAdjustmentType(e.target.value)}
                    checked={adjustmentType === 'dynamic'}
                />
                <label>Dynamic (%)</label>
            </div>
            <input
                type="number"
                placeholder="Adjustment Value"
                value={adjustmentValue}
                onChange={e => setAdjustmentValue(e.target.value)}
            />
            <div>
                <input
                    type="radio"
                    name="incrementType"
                    value="increase"
                    onChange={e => setIncrementType(e.target.value)}
                    checked={incrementType === 'increase'}
                />
                <label>Increase (+)</label>
                <input
                    type="radio"
                    name="incrementType"
                    value="decrease"
                    onChange={e => setIncrementType(e.target.value)}
                    checked={incrementType === 'decrease'}
                />
                <label>Decrease (-)</label>
            </div>
            <button onClick={handleRecalculate}>Recalculate Prices</button>
        </div>
    );
}

export default PriceAdjustment;
