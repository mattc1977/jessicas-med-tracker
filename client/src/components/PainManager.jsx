import { useState } from 'react';
import './PainManager.css';

function PainManager({ onDataRefresh }) {
  const [painLevel, setPainLevel] = useState(5);
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoggedEvent, setLastLoggedEvent] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handlePainLevelChange = (e) => {
    setPainLevel(Number(e.target.value));
    setRecommendation(null);
    setLastLoggedEvent(null);
    setError(null);
  };

  const getRecommendation = async () => {
    setIsLoading(true);
    setRecommendation(null);
    setLastLoggedEvent(null);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/report-pain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ painLevel: Number(painLevel) }),
      });
      if (!res.ok) throw new Error('Failed to fetch recommendation');
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      setError('Error fetching recommendation.');
      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logPrnDose = async () => {
    if (!recommendation) return;
    const pillsToLog = recommendation.pillsToTake || 0;
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/log-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PRN_MED_TAKEN',
          medicationId: recommendation.medicationId,
          pillsTaken: pillsToLog,
          details: `Pain level ${painLevel}, recommendation: ${recommendation.suggestion}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to log medication event');
      const loggedEvent = await res.json();
      setLastLoggedEvent(loggedEvent);
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      setError('Error logging PRN dose.');
    }
  };

  const handleUndoPrnLog = async () => {
    if (!lastLoggedEvent || !lastLoggedEvent.uniqueId) return;
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/log-event/${lastLoggedEvent.uniqueId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to undo event');
      setLastLoggedEvent(null);
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      setError('Error undoing PRN log.');
    }
  };

  return (
    <div className="pain-manager-container">
      <h3>I'm in Pain</h3>
      <div className="pain-input-section">
        <label htmlFor="pain-slider">
          Current Pain Level: <strong>{painLevel}</strong>
        </label>
        <input
          type="range"
          id="pain-slider"
          min="0"
          max="10"
          value={painLevel}
          onChange={handlePainLevelChange}
          className="pain-slider"
          aria-label="Pain level slider"
        />
        <button
          onClick={getRecommendation}
          disabled={isLoading}
          aria-label="Get pain management recommendation"
        >
          {isLoading ? 'Getting Advice...' : 'Get Recommendation'}
        </button>
      </div>
      {error && (
        <div className="recommendation-section warning">
          <p>{error}</p>
        </div>
      )}
      {recommendation && (
        <div className="recommendation-section">
          <h4>Recommendation:</h4>
          <p className={recommendation.requiresAction ? 'warning' : ''}>
            {recommendation.suggestion}
          </p>
          {!lastLoggedEvent && recommendation.medicationId && (
            <button
              onClick={logPrnDose}
              className="log-prn-button"
              aria-label="Log this PRN dose"
            >
              Log This Dose
            </button>
          )}
          {lastLoggedEvent && (
            <div>
              <p className="logged-feedback">Dose logged successfully! ✔</p>
              <button
                onClick={handleUndoPrnLog}
                className="undo-prn-button"
                aria-label="Undo PRN log"
              >
                Undo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PainManager;
