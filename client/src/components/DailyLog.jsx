import { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import './DailyLog.css';

function DailyLog({ log, onDataRefresh }) {
  const [todaysLog, setTodaysLog] = useState([]);

  useEffect(() => {
    if (Array.isArray(log)) {
      const filtered = log.filter(event => isToday(new Date(event.timestamp)));
      setTodaysLog(filtered.reverse());
    }
  }, [log]);

  const handleDelete = (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    fetch(`http://localhost:3000/api/log-event/${uniqueId}`, { method: 'DELETE' })
    .then(res => { if (!res.ok) throw new Error('Delete failed'); onDataRefresh(); })
    .catch(console.error);
  };

  const formatEvent = (event) => { /* ... formatEvent function from previous steps ... */ };

  return (
    <div className="daily-log-container">
      <h3>Today's Activity Log</h3>
      <ul className="log-list">
        {todaysLog.length > 0 ? (
          {todaysLog && todaysLog.map(  event => (
            <li key={event.uniqueId || event.timestamp}>
              <span className="log-time">{format(new Date(event.timestamp), 'p')}</span>
              <span className="log-entry">{formatEvent(event)}</span>
              <button onClick={() => handleDelete(event.uniqueId)} className="delete-button">X</button>
            </li>
          ))
        ) : ( <li className="no-events">No events logged for today.</li> )}
      </ul>
    </div>
  );
}
export default DailyLog;