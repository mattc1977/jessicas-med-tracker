import { useState, useEffect } from 'react';
import './RefillList.css';

function RefillList({ onDataRefresh }) {
  const [refillMeds, setRefillMeds] = useState([]);
  const [showConfirm, setShowConfirm] = useState({});
  const [receivedQuantities, setReceivedQuantities] = useState({});

  const fetchRefills = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/refills`);
      const data = await res.json();
      setRefillMeds(data);
    } catch (err) {
      console.error('Failed to fetch refills:', err);
    }
  };

  useEffect(() => {
    fetchRefills();
  }, []);

  const handleRequestRefill = async (med) => {
    if (!window.confirm(`Confirm you are requesting a refill for ${med.name}?`)) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/log-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REFILL_REQUESTED',
          medicationId: med.id,
          name: med.name,
          details: `Refill requested for ${med.name}.`
        }),
      });
      onDataRefresh();
      fetchRefills();
    } catch (err) {
      console.error('Error logging refill request:', err);
    }
  };

  const handleReceiveRefill = async (medId) => {
    const quantityReceived = receivedQuantities[medId];
    if (!quantityReceived || isNaN(quantityReceived) || quantityReceived <= 0) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/refills/received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId: medId, quantityReceived: Number(quantityReceived) }),
      });
      setShowConfirm(prev => ({ ...prev, [medId]: false }));
      setReceivedQuantities(prev => ({ ...prev, [medId]: '' }));
      fetchRefills();
      onDataRefresh();
    } catch (err) {
      console.error('Error logging received refill:', err);
    }
  };

  if (!refillMeds.length) {
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
          <p>
            <strong>{med.name}</strong> has only {Math.floor(med.daysOfSupply)} days of supply left. Request refill soon.
          </p>
          {showConfirm[med.id] ? (
            <div className="confirm-received-section">
              <input
                type="number"
                placeholder="Qty Received"
                value={receivedQuantities[med.id] || ''}
                onChange={e =>
                  setReceivedQuantities(prev => ({
                    ...prev,
                    [med.id]: e.target.value
                  }))
                }
                min={1}
              />
              <button onClick={() => handleReceiveRefill(med.id)}>Confirm</button>
              <button className="cancel-button" onClick={() => setShowConfirm(prev => ({ ...prev, [med.id]: false }))}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="refill-workflow">
              <button onClick={() => handleRequestRefill(med)}>Log Refill Request</button>
              <button onClick={() => setShowConfirm(prev => ({ ...prev, [med.id]: true }))}>Log Received Refill</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RefillList;
