import { useState } from 'react';
import './Inventory.css';

function Inventory({ medications, onDataRefresh }) { 
  const [inputs, setInputs] = useState({});

  const handleInputChange = (medId, value) => {
    setInputs(prev => ({ ...prev, [medId]: value }));
  };

  const handleUpdate = (medId) => {
    const newQuantity = inputs[medId];
    if (!newQuantity || isNaN(newQuantity)) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/inventory/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationId: medId, newQuantity: newQuantity }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Update failed');
      onDataRefresh(); 
      setInputs(prev => ({ ...prev, [medId]: '' }));
    })
    .catch(console.error);
  };
  
  return (
    <div className="inventory-container">
      <h3>Medication Inventory</h3>
      <ul className="inventory-list">
        {medications && medications.map(med => (
          <li key={med.id} className={med.quantity_on_hand <= 20 ? 'warning' : ''}>
            <span className="med-name">{med.name} ({med.quantity_on_hand} left)</span>
            <div className="update-group">
              <input 
                type="number" 
                placeholder="New Qty" 
                value={inputs[med.id] || ''}
                onChange={(e) => handleInputChange(med.id, e.target.value)} 
              />
              <button onClick={() => handleUpdate(med.id)}>Update</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Inventory;