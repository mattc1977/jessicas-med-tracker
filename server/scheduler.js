const { addHours, set, isAfter, startOfToday, subHours } = require('date-fns');

// Note: There is no more "require('./database.js')" here.

function generateSchedule(medications, log) { // Medications are now passed in as an argument
  const schedule = [];
  const scheduledMeds = medications.filter(m => m.schedule_type === 'scheduled');
  const today = startOfToday();

  scheduledMeds.forEach(med => {
    const lastTakenEvent = log
      .filter(e => e.medicationId === med.id && (e.type === 'SCHEDULED_MED_TAKEN' || e.type === 'PRN_MED_TAKEN'))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    switch (med.frequency) {
      case 'tid': {
        let nextDoseTime;
        let isAdjusted = false;
        if (lastTakenEvent && isAfter(new Date(lastTakenEvent.timestamp), subHours(new Date(), 8))) {
          nextDoseTime = addHours(new Date(lastTakenEvent.timestamp), 8);
          isAdjusted = true;
        } else {
          const now = new Date();
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

  return schedule.sort((a, b) => a.time - b.time);
}

module.exports = { generateSchedule };