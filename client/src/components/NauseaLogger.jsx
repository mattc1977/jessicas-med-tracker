import { useState } from 'react';
import './ActivityLogger.css'; // We can reuse the same styles

function NauseaLogger({ onDataRefresh }) {
  const [nauseaLevel, setNauseaLevel] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const logNausea = () => {
    setFeedbackMessage('Logging...');
    fetch('http://localhost:3000/api/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'NAUSEA_LOGGED', details: { level: nauseaLevel } }),
    })
    .then(res => { if (!res.ok) throw new Error('Log failed'); setFeedbackMessage('Nausea level logged! ✔'); onDataRefresh(); })
    .catch(() => setFeedbackMessage('Error logging.'))
    .finally(() => setTimeout(() => setFeedbackMessage(''), 3000));
  };

  return (
    <div className="activity-section">
      <label>Nausea Level: {nauseaLevel}</label>
      <input type="range" min="0" max="10" value={nauseaLevel} onChange={e => setNauseaLevel(e.target.value)} />
      <button onClick={logNausea}>Log Nausea</button>
      {nauseaLevel > 5 && <small className="tip">Consider taking Zofran for nausea relief.</small>}
      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
    </div>
  );
}
export default NauseaLogger;