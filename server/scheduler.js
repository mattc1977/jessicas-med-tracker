const { addHours, set, isAfter, startOfDay, subHours } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');

const timeZone = 'America/New_York';

function generateSchedule(medications, log) {
  const schedule = [];
  if (!medications || !log) return schedule;

  const scheduledMeds = medications.filter(m => m.schedule_type === 'scheduled');
  const now = new Date(); // Use the server's UTC time
  const todayInET = startOfDay(utcToZonedTime(now, timeZone)); // Get start of day in ET

  scheduledMeds.forEach(med => {
    // ... (rest of the function is the same as the last version) ...
    // The main change is how 'now' and 'today' are calculated above.
  });
  return schedule.sort((a, b) => new Date(a.time) - new Date(b.time));
}

module.exports = { generateSchedule };