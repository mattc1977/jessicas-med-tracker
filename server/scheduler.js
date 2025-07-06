const { addHours, set, isAfter, startOfDay, subHours } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');

const timeZone = 'America/New_York';

function generateSchedule(medications, log) {
  const schedule = [];
  if (!medications || !log) return schedule;

  const scheduledMeds = medications.filter(m => m.schedule_type === 'scheduled');
  const now = utcToZonedTime(new Date(), timeZone);
  const today = startOfDay(now);

  scheduledMeds.forEach(med => {
    const lastTakenEvent = log
      .filter(e => e.medicationId === med.id && (e.type === 'SCHEDULED_MED_TAKEN' || e.type === 'PRN_MED_TAKEN'))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    switch (med.frequency) {
      case 'tid': {
        let nextDoseTime;
        let isAdjusted = false;
        if (lastTakenEvent && isAfter(new Date(lastTakenEvent.timestamp), addHours(new Date(), -8))) {
          nextDoseTime = addHours(new Date(lastTakenEvent.timestamp), 8);
          isAdjusted = true;
        } else {
          const slots = [set(today, { hours: 8 }), set(today, { hours: 16 }), set(today, { hours: 24 })];
          nextDoseTime = slots.find(slot => isAfter(slot, now)) || slots[0];
        }
        schedule.push({ uniqueId: med.id + '@' + nextDoseTime.toISOString(), medicationId: med.id, name: med.name, dose: `${med.dose_mg} mg`, time: nextDoseTime, isAdjusted: isAdjusted });
        break;
      }
      case 'qd': {
        const time = set(today, { hours: 8, minutes: 0, seconds: 0 });
        schedule.push({ uniqueId: med.id + '@' + time.toISOString(), medicationId: med.id, name: med.name, dose: `${med.dose_mg} mg`, time: time, isAdjusted: false });
        break;
      }
      case 'qpm': {
        const time = set(today, { hours: 21, minutes: 0, seconds: 0 });
        schedule.push({ uniqueId: med.id + '@' + time.toISOString(), medicationId: med.id, name: med.name, dose: `${med.dose_mg} mg`, time: time, isAdjusted: false });
        break;
      }
    }
  });
  return schedule.sort((a, b) => new Date(a.time) - new Date(b.time));
}

module.exports = { generateSchedule };
