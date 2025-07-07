import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './ActivityLogger.css';

function GeneralActivityLogger({ onDataRefresh }) {
  const [compressionMinutes, setCompressionMinutes] = useState(30);
  const [painBefore, setPainBefore] = useState(0);
  const [painDuring, setPainDuring] = useState(0);
  const [painAfter, setPainAfter] = useState(0);
  const [mobilityMinutes, setMobilityMinutes] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const feedbackTimeout = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const clearFeedback = () => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
    setFeedbackMessage('');
  };

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    clearFeedback();
    feedbackTimeout.current = setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const logActivity = async (logData) => {
    try {
      setFeedbackMessage('Logging...');
      const res = await fetch(`${apiUrl}/api/log-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (!res.ok) throw new Error('Log failed');
      showFeedback(`${logData.type.replace(/_/g, ' ')} logged! ✔`);
      if (onDataRefresh) onDataRefresh();
    } catch {
      showFeedback('Error logging.');
    }
  };

  // Input handlers to ensure state is always numeric
  const handleCompressionMinutes = (e) => setCompressionMinutes(Number(e.target.value));
  const handleMobilityMinutes = (e) => setMobilityMinutes(Number(e.target.value));
  const handlePainBefore = (e) => setPainBefore(Number(e.target.value));
  const handlePainDuring = (e) => setPainDuring(Number(e.target.value));
  const handlePainAfter = (e) => setPainAfter(Number(e.target.value));

  return (
    <div className="activity-logger-container">
      {/* Leg Compression Section */}
      <div className="activity-section">
        <label htmlFor="compression-minutes">Leg Compression</label>
        <label htmlFor="compression-minutes">Minutes:</label>
        <input
          id="compression-minutes"
          type="number"
          min="0"
          value={compressionMinutes}
          onChange={handleCompressionMinutes}
          aria-label="Leg compression minutes"
        />
        <button
          onClick={() =>
            logActivity({
              type: 'LEG_COMPRESSION_LOGGED',
              details: { minutes: compressionMinutes },
            })
          }
          aria-label="Log leg compression"
        >
          Log Minutes
        </button>
      </div>

      {/* Mobility Section */}
      <div className="activity-section">
        <label htmlFor="mobility-minutes">Mobility</label>
        <label htmlFor="mobility-minutes">Duration (minutes):</label>
        <input
          id="mobility-minutes"
          type="number"
          min="0"
          value={mobilityMinutes}
          onChange={handleMobilityMinutes}
          aria-label="Mobility minutes"
        />
        <label htmlFor="pain-before">
          Pain Before (1-10): <strong>{painBefore}</strong>
        </label>
        <input
          id="pain-before"
          type="range"
          min="0"
          max="10"
          value={painBefore}
          onChange={handlePainBefore}
          aria-label="Pain before mobility"
        />
        <label htmlFor="pain-during">
          Pain During (1-10): <strong>{painDuring}</strong>
        </label>
        <input
          id="pain-during"
          type="range"
          min="0"
          max="10"
          value={painDuring}
          onChange={handlePainDuring}
          aria-label="Pain during mobility"
        />
        <label htmlFor="pain-after">
          Pain After (1-10): <strong>{painAfter}</strong>
        </label>
        <input
          id="pain-after"
          type="range"
          min="0"
          max="10"
          value={painAfter}
          onChange={handlePainAfter}
          aria-label="Pain after mobility"
        />
        <button
          onClick={() =>
            logActivity({
              type: 'MOBILITY_LOGGED',
              details: {
                minutes: mobilityMinutes,
                painBefore,
                painDuring,
                painAfter,
              },
            })
          }
          aria-label="Log mobility"
        >
          Log Mobility
        </button>
      </div>

      {feedbackMessage && (
        <div className="feedback-message">{feedbackMessage}</div>
      )}
    </div>
  );
}

GeneralActivityLogger.propTypes = {
  onDataRefresh: PropTypes.func,
};

export default GeneralActivityLogger;
