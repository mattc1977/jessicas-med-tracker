import { useState } from 'react';
import './PainManager.css';

function PainManager({ onDataRefresh }) {
  const [painLevel, setPainLevel] = useState(5);
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoggedEvent, setLastLoggedEvent] = useState(null);

  const getRecommendation = () => {
    setIsLoading(true);
    setRecommendation(null);
    setLastLoggedEvent(null);

    // The backend will now handle getting the log, simplifying this component
    fetch('http://localhost:3000/api/report-pain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ painLevel: Number(painLevel) }),
    })
    .then(res => res.json())
    .then(data => setRecommendation(data))
    .catch(console.error)
    .finally(() => setIsLoading(false));
  };

  const logPrnDose = () => {
    const pillsToLog = recommendation.pillsToTake || 0;
    fetch('http://localhost:3000/api/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'PRN_MED_TAKEN',
        medicationId: recommendation.medicationId,
        pillsTaken: pillsToLog,
        details: `Pain level ${painLevel}, recommendation: ${recommendation.suggestion}`,
      }),
    })
    .then(res => res.json())
    .then(loggedEvent => {
      setLastLoggedEvent(loggedEvent);
      onDataRefresh();
    })
    .catch(console.error);
  };

  const handleUndoPrnLog = () => {
    if (!lastLoggedEvent || !lastLoggedEvent.uniqueId) return;
    fetch(`http://localhost:3000/api/log-event/${lastLoggedEvent.uniqueId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Failed to undo event');
      setLastLoggedEvent(null);
      onDataRefresh();
    })
    .catch(console.error);
  };

  return (
    <div className="pain-manager-container">
      <h3>I'm in Pain</h3>
      <div className="pain-input-section">
        <label htmlFor="pain-slider">Current Pain Level: {painLevel}</label>
        <input type="range" id="pain-slider" min="0" max="10" value={painLevel} onChange={(e) => setPainLevel(e.target.value)} className="pain-slider" />
        <button onClick={getRecommendation} disabled={isLoading}>
          {isLoading ? 'Getting Advice...' : 'Get Recommendation'}
        </button>
      </div>
      {recommendation && (
        <div className="recommendation-section">
          <h4>Recommendation:</h4>
          <p className={recommendation.requiresAction ? 'warning' : ''}>{recommendation.suggestion}</p>
          {!lastLoggedEvent && recommendation.medicationId && (
            <button onClick={logPrnDose} className="log-prn-button">Log This Dose</button>
          )}
          {lastLoggedEvent && (
            <div>
              <p className="logged-feedback">Dose logged successfully! ✔</p>
              <button onClick={handleUndoPrnLog} className="undo-prn-button">Undo</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default PainManager;