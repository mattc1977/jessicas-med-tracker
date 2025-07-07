import { useState, useEffect } from 'react';
import './RefillList.css';

function RefillList({ onDataRefresh }) {
  const [refillMeds, setRefillMeds] = useState([]);
  const [showConfirm, setShowConfirm] = useState({});
  const [receivedQuantities, setReceivedQuantities] = useState({});

  const fetchRefills = () => {
    // It now fetches its own specialized data again
    fetch(`${import.meta.env.VITE_API_URL}/api/refills')
      .then(res => res.json())
      .then(data => setRefillMeds(data))
      .catch(console.error);
  };

  // Fetch when the component loads
  useEffect(fetchRefills, []);

  const handleRequestRefill = (med) => {
    if (!window.confirm(`Confirm you are requesting a refill for ${med.name}?`)) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'REFILL_REQUESTED', medicationId: med.id, name: med.name, details: `Refill requested for ${med.name}.` }),
    }).then(() => onDataRefresh());
  };

  const handleReceiveRefill = (medId) => {
    const quantityReceived = receivedQuantities[medId];
    if (!quantityReceived || isNaN(quantityReceived) || quantityReceived <= 0) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/refills/received', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationId: medId, quantityReceived }),
    }).then(() => {
      setShowConfirm({});
      fetchRefills(); // Re-fetch its own list
      onDataRefresh(); // Refresh the rest of the app's data
    });
  };

  if (refillMeds.length === 0) {
    return (
      <div className="refill-container all-good">
        <h4>Refill Status</h4>
        <p>No refills needed at this time.</p>
      </div>
    );
  }

  return (
    <div className="refill-container warning">
      <h4>Refill Reminders</h4>
      {refillMeds.map(med => (
        <div key={med.id} className="refill-item">
          <p><strong>{med.name}</strong> has only {Math.floor(med.daysOfSupply)} days of supply left. Request refill soon.</p>
          { showConfirm[med.id] ? (
            <div className="confirm-received-section">
              <input type="number" placeholder="Qty Received" onChange={e => setReceivedQuantities({ [med.id]: e.target.value })}/>
              <button onClick={() => handleReceiveRefill(med.id)}>Confirm</button>
              <button className="cancel-button" onClick={() => setShowConfirm({})}>Cancel</button>
            </div>
          ) : (
            <div className="refill-workflow">
              <button onClick={() => handleRequestRefill(med)}>Log Refill Request</button>
              <button onClick={() => setShowConfirm({ [med.id]: true })}>Log Received Refill</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RefillList;