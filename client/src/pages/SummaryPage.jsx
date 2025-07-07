import { useState, useEffect } from 'react';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import useAppStore from '../store/useAppStore';
import '../components/DailyLog.css';

function SummaryPage() {
  const { log, fetchData } = useAppStore((state) => state);
  const [filteredLog, setFilteredLog] = useState([]);
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));

  useEffect(() => {
    if (log && Array.isArray(log)) {
      const filtered = log.filter(event => 
        isWithinInterval(new Date(event.timestamp), { start: startDate, end: endDate })
      );
      setFilteredLog(filtered);
    }
  }, [log, startDate, endDate]);

  const handleDelete = (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/log-event/${uniqueId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Delete failed');
      fetchData();
    })
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
        <h2>Summary Log</h2>
      </div>
      <div className="date-range-picker">
        <div>
          <label>Start Date:</label>
          <input 
            type="date" 
            className="date-picker" 
            value={format(startDate, 'yyyy-MM-dd')} 
            onChange={e => setStartDate(startOfDay(parseISO(e.target.value)))} 
          />
        </div>
        <div>
          <label>End Date:</label>
          <input 
            type="date" 
            className="date-picker" 
            value={format(endDate, 'yyyy-MM-dd')} 
            onChange={e => setEndDate(endOfDay(parseISO(e.target.value)))} 
          />
        </div>
      </div>
      <ul className="log-list">
        {filteredLog && filteredLog.length > 0 ? (
          filteredLog.map(event => (
            <li key={event.uniqueId || event.timestamp}>
              <span className="log-time">{format(new Date(event.timestamp), 'MMM d, p')}</span>
              <span className="log-entry">{formatEvent(event)}</span>
              <button onClick={() => handleDelete(event.uniqueId)} className="delete-button">X</button>
            </li>
          ))
        ) : (
          <li className="no-events">No events found for this date range.</li>
        )}
      </ul>
    </div>
  );
}

export default SummaryPage;