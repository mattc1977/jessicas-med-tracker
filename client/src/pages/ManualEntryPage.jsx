import { useState } from 'react';
import { format } from 'date-fns';
import useAppStore from '../store/useAppStore';
import './ManualEntryPage.css';

function ManualEntryPage() {
  const { medications, fetchData } = useAppStore((state) => state);
  const [eventType, setEventType] = useState('SCHEDULED_MED_TAKEN');
  const [timestamp, setTimestamp] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [selectedMedId, setSelectedMedId] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (!eventType || !timestamp) { return setFeedback('Please select an event type and a timestamp.'); }
    const selectedMed = medications.find(m => m.id === selectedMedId);
    if ((eventType === 'SCHEDULED_MED_TAKEN' || eventType === 'PRN_MED_TAKEN') && !selectedMed) {
      return setFeedback('Please select a medication for this event type.');
    }

    const logData = {
      type: eventType,
      timestamp: new Date(timestamp),
      medicationId: selectedMedId,
      name: selectedMed?.name,
      pillsTaken: 1,
      dose: selectedMed ? `${selectedMed.dose_mg} mg` : null,
      details: `Manually logged event.`
    };

    setFeedback('Logging...');
    fetch('http://localhost:3000/api/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    })
    .then(res => {
      if (!res.ok) throw new Error('Log failed');
      setFeedback('Event logged successfully!');
      fetchData(); // Refresh global state
    })
    .catch(err => setFeedback('Error: ' + err.message))
    .finally(() => setTimeout(() => setFeedback(''), 4000));
  };

  return (
    <div className="manual-entry-container">
      <h2>Manual Log Entry</h2>
      <p>Use this form to log an event that happened in the past.</p>
      <div className="form-group">
        <label>Date and Time of Event:</label>
        <input type="datetime-local" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Event Type:</label>
        <select value={eventType} onChange={e => setEventType(e.target.value)}>
          <option value="SCHEDULED_MED_TAKEN">Scheduled Med Taken</option>
          <option value="PRN_MED_TAKEN">PRN Med Taken</option>
          {/* Add other simple event types here if needed */}
        </select>
      </div>
      {(eventType === 'SCHEDULED_MED_TAKEN' || eventType === 'PRN_MED_TAKEN') && (
        <div className="form-group">
          <label>Medication:</label>
          <select value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)}>
            <option value="">-- Select a Medication --</option>
            {medications && medications.map(med => (<option key={med.id} value={med.id}>{med.name}</option>))}
          </select>
        </div>
      )}
      <button onClick={handleSubmit}>Submit Log Entry</button>
      {feedback && <div className="feedback-message">{feedback}</div>}
    </div>
  );
}
export default ManualEntryPage;