const dateFnsTz = require('date-fns-tz');
// Defensive import to support both CJS and ESM builds of date-fns-tz
const utcToZonedTime = dateFnsTz.utcToZonedTime || (dateFnsTz.default && dateFnsTz.default.utcToZonedTime);

const { addHours, set, isAfter, startOfDay } = require('date-fns');

const timeZone = 'America/New_York';

function generateSchedule(medications, log) {
  const schedule = [];
  if (!medications || !log) return schedule;

  const scheduledMeds = medications.filter(m => m.schedule_type === 'scheduled');
  const now = utcToZonedTime(new Date(), timeZone);
  const today = startOfDay(now);

  scheduledMeds.forEach(med => {
    const lastTakenEvent = log
      .filter(e => e.medicationId === med.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    switch (med.frequency) {
      case 'tid': {
        let nextDoseTime;
        let isAdjusted = false;
        if (lastTakenEvent && isAfter(new Date(lastTakenEvent.timestamp), addHours(now, -8))) {
          nextDoseTime = addHours(new Date(lastTakenEvent.timestamp), 8);
          isAdjusted = true;
        } else {
          const slots = [
            set(today, { hours: 8 }),
            set(today, { hours: 16 }),
            set(today, { hours: 24 })
          ];
          nextDoseTime = slots.find(slot => isAfter(slot, now)) || slots[0];
        }
        schedule.push({
          uniqueId: med.id + '@' + nextDoseTime.toISOString(),
          medicationId: med.id,
          name: med.name,
          dose: `${med.dose_mg} mg`,
          time: nextDoseTime,
          isAdjusted: isAdjusted
        });
        break;
      }
      case 'qd': {
        // Once daily at 8am
        const nextDoseTime = isAfter(set(today, { hours: 8 }), now)
          ? set(today, { hours: 8 })
          : addHours(set(today, { hours: 8 }), 24);
        schedule.push({
          uniqueId: med.id + '@' + nextDoseTime.toISOString(),
          medicationId: med.id,
          name: med.name,
          dose: `${med.dose_mg} mg`,
          time: nextDoseTime,
          isAdjusted: false
        });
        break;
      }
      case 'qpm': {
        // Once daily at 8pm
        const nextDoseTime = isAfter(set(today, { hours: 20 }), now)
          ? set(today, { hours: 20 })
          : addHours(set(today, { hours: 20 }), 24);
        schedule.push({
          uniqueId: med.id + '@' + nextDoseTime.toISOString(),
          medicationId: med.id,
          name: med.name,
          dose: `${med.dose_mg} mg`,
          time: nextDoseTime,
          isAdjusted: false
        });
        break;
      }
      default:
        break;
    }
  });
  return schedule.sort((a, b) => new Date(a.time) - new Date(b.time));
}

module.exports = { generateSchedule };