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
    fetch(`${import.meta.env.VITE_API_URL}/api/log-event/${uniqueId}`, { method: 'DELETE' })
    .then(res => { if (!res.ok) throw new Error('Delete failed'); onDataRefresh(); })
    .catch(console.error);
  };

  const formatEvent = (event) => {
    switch (event.type) {
        case 'REFILL_REQUESTED': return `Logged Refill Request for ${event.name}`;
        case 'REFILL_RECEIVED': return `Logged Refill Received for ${event.name}`;
        case 'SCHEDULED_MED_TAKEN': return `Logged ${event.name} (${event.dose})`;
        case 'PRN_MED_TAKEN': return `Logged PRN: ${event.details}`;
        case 'NAUSEA_LOGGED': return `Logged Nausea: Level ${event.details.level}`;
        case 'COMPRESSION_MACHINE_START': return 'Started Compression / Cooling Machine';
        case 'COMPRESSION_MACHINE_STOP': return 'Stopped Compression / Cooling Machine';
        case 'LEG_COMPRESSION_LOGGED': return `Logged Leg Compressions: ${event.details.minutes} minutes`;
        case 'MOBILITY_LOGGED': return `Logged Mobility: ${event.details.minutes} min, Pain (B/D/A): ${event.details.painBefore}/${event.details.painDuring}/${event.details.painAfter}`;
        default: return `Logged event: ${event.type}`;
    }
  };

  return (
    <div className="daily-log-container">
      <div className="log-header">
        <h3>Today's Activity Log</h3>
      </div>
      <ul className="log-list">
        {todaysLog && todaysLog.length > 0 ? (
          // The extra check is removed from here
          todaysLog.map(event => (
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