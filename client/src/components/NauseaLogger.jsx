import { useState } from 'react';
import './ActivityLogger.css'; // Reuse the same styles

function NauseaLogger({ onDataRefresh }) {
  const [nauseaLevel, setNauseaLevel] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const logNausea = async () => {
    setFeedbackMessage('Logging...');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/log-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'NAUSEA_LOGGED', details: { level: nauseaLevel } }),
      });
      if (!res.ok) throw new Error('Log failed');
      setFeedbackMessage('Nausea level logged! ✔');
      if (onDataRefresh) onDataRefresh();
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch {
      setFeedbackMessage('Error logging.');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleSliderChange = (e) => {
    setNauseaLevel(Number(e.target.value));
  };

  return (
    <div className="activity-section">
      <label htmlFor="nausea-slider">
        Nausea Level: <strong>{nauseaLevel}</strong>
      </label>
      <input
        id="nausea-slider"
        type="range"
        min="0"
        max="10"
        value={nauseaLevel}
        onChange={handleSliderChange}
        aria-label="Nausea level slider"
      />
      <button onClick={logNausea} aria-label="Log nausea event">
        Log Nausea
      </button>
      {nauseaLevel > 5 && (
        <small className="tip">Consider taking Zofran for nausea relief.</small>
      )}
      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
    </div>
  );
}

export default NauseaLogger;
