import { format } from 'date-fns';
import './Schedule.css';

function Schedule({ schedule, log, onDataRefresh }) {

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
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body === null ? undefined : body })
    .then(res => { if (!res.ok) throw new Error('Action failed'); onDataRefresh(); })
    .catch(error => console.error('Error logging event:', error));
  };

  if (!schedule || schedule.length === 0) {
    return ( <div className="schedule-container"> <h3>Today's Medication Schedule</h3> <p>No scheduled medications at this time.</p> </div> );
  }

  return (
    <div className="schedule-container">
      <h3>Today's Medication Schedule</h3>
      {schedule.map(item => {
        // Check if there is an entry in the main log that matches this scheduled item's unique ID
        const isLogged = log.some(entry => entry.uniqueId === item.uniqueId);

        return (
          <div key={item.uniqueId} className={`schedule-item ${isLogged ? 'logged' : ''} ${item.isAdjusted ? 'adjusted' : ''}`}>
            <div className="schedule-time">{format(new Date(item.time), 'p')}</div>
            <div className="schedule-details">
              <div className="schedule-med-name">{item.name}</div>
              <div className="schedule-med-dose">{item.dose}</div>
            </div>
            <button
              className={`schedule-log-button ${isLogged ? 'undo' : ''}`}
              onClick={() => handleLogAction(item, isLogged)}
            >
              {isLogged ? 'Undo' : 'Log as Taken'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
export default Schedule;