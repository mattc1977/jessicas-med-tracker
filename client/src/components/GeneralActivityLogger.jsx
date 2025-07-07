import { useState } from 'react';
import './ActivityLogger.css';

function GeneralActivityLogger({ onDataRefresh }) {
  const [compressionMinutes, setCompressionMinutes] = useState(30);
  const [painBefore, setPainBefore] = useState(0);
  const [painDuring, setPainDuring] = useState(0);
  const [painAfter, setPainAfter] = useState(0);
  const [mobilityMinutes, setMobilityMinutes] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const logActivity = (logData) => {
    setFeedbackMessage('Logging...');
    fetch(`${import.meta.env.VITE_API_URL}/api/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    })
    .then(res => {
      if (!res.ok) throw new Error('Log failed');
      setFeedbackMessage(`${logData.type.replace(/_/g, ' ')} logged! ✔`);
      if (onDataRefresh) onDataRefresh();
    })
    .catch(() => setFeedbackMessage('Error logging.'))
    .finally(() => setTimeout(() => setFeedbackMessage(''), 3000));
  };

  return (
    <div className="activity-logger-container">
      <h3>Daily Activities</h3>

      {/* Compression Machine Section */}
      <div className="activity-section">
        <label>Compression / Cooling Machine</label>
        <div className="button-group">
            <button onClick={() => logActivity({ type: 'COMPRESSION_MACHINE_START' })}>Log Start Time</button>
            <button onClick={() => logActivity({ type: 'COMPRESSION_MACHINE_STOP' })}>Log Stop Time</button>
        </div>
      </div>

      {/* Leg Compression Sleeves */}
      <div className="activity-section">
        <label>Lower Leg Compressions (last 60 mins)</label>
        <div className="input-group">
          <input type="number" min="0" max="60" value={compressionMinutes} onChange={e => setCompressionMinutes(e.target.value)} />
          <span>minutes</span>
        </div>
        <button onClick={() => logActivity({ type: 'LEG_COMPRESSION_LOGGED', details: { minutes: compressionMinutes } })}>Log Minutes</button>
      </div>

      {/* Mobility Section */}
      <div className="activity-section">
        <label>Mobility</label>
        <label>Duration (minutes):</label>
        <input type="number" min="0" value={mobilityMinutes} onChange={e => setMobilityMinutes(e.target.value)} />

        <label>Pain Before (1-10): {painBefore}</label>
        <input type="range" min="0" max="10" value={painBefore} onChange={e => setPainBefore(e.target.value)} />

        <label>Pain During (1-10): {painDuring}</label>
        <input type="range" min="0" max="10" value={painDuring} onChange={e => setPainDuring(e.target.value)} />

        <label>Pain After (1-10): {painAfter}</label>
        <input type="range" min="0" max="10" value={painAfter} onChange={e => setPainAfter(e.target.value)} />

        <button onClick={() => logActivity({ type: 'MOBILITY_LOGGED', details: { minutes: mobilityMinutes, painBefore, painDuring, painAfter } })}>Log Mobility</button>
      </div>

      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
    </div>
  );
}

export default GeneralActivityLogger;