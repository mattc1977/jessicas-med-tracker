import { format } from 'date-fns';
import './Schedule.css';

// The component just receives props now, no more hooks or fetching
function Schedule({ schedule, onDataRefresh }) {

  const handleLogAction = (item, isUndo = false) => {
    const url = `http://localhost:3000/api/log-event/${isUndo ? item.uniqueId : ''}`;
    const method = isUndo ? 'DELETE' : 'POST';

    const body = isUndo ? null : JSON.stringify({
      type: 'SCHEDULED_MED_TAKEN',
      medicationId: item.medicationId,
      name: item.name,
      dose: item.dose,
      pillsTaken: 1,
      uniqueId: item.uniqueId,
    });

    const headers = isUndo ? {} : { 'Content-Type': 'application/json' };

    fetch(url, { method, headers, body: body === null ? undefined : body })
    .then(res => {
      if (!res.ok) throw new Error('Action failed');
      onDataRefresh(); // Refresh all app data
    })
    .catch(error => console.error('Error logging event:', error));
  };

  return (
    <div className="schedule-container">
      <h3>Today's Medication Schedule</h3>
     {schedule && schedule.map(item => (
        <div key={item.uniqueId} className={`schedule-item ${item.isLogged ? 'logged' : ''} ${item.isAdjusted ? 'adjusted' : ''}`}>
          <div className="schedule-time">{format(new Date(item.time), 'p')}</div>
          <div className="schedule-details">
            <div className="schedule-med-name">{item.name}</div>
            <div className="schedule-med-dose">{item.dose}</div>
          </div>
          <button
            className={`schedule-log-button ${item.isLogged ? 'undo' : ''}`}
            onClick={() => handleLogAction(item, item.isLogged)}
          >
            {item.isLogged ? 'Undo' : 'Log as Taken'}
          </button>
        </div>
      ))}
    </div>
  );
}
export default Schedule;