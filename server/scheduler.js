const { utcToZonedTime } = require('date-fns-tz');
const { addHours, set, isAfter, startOfDay, isValid } = require('date-fns');

const timeZone = 'America/New_York';

/**
 * Helper to safely parse a date string or Date object.
 * Returns null if invalid.
 */
function safeDate(dateInput) {
  const d = new Date(dateInput);
  return isValid(d) ? d : null;
}

/**
 * Get the dose slots for TID (three times daily).
 * @param {Date} todayMidnight - Date at the start of the local day.
 */
function getTidSlots(todayMidnight) {
  return [
    set(todayMidnight, { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 }),
    set(todayMidnight, { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 }),
    set(todayMidnight, { hours: 24, minutes: 0, seconds: 0, milliseconds: 0 })
  ];
}

/**
 * Generate the next dose time for a medication.
 * Returns a Date object.
 */
function getNextDoseTime(med, lastTakenEvent, now, today) {
  switch (med.frequency) {
    case 'tid': {
      // TID (three times daily: 8am, 4pm, 12am)
      if (
        lastTakenEvent &&
        isAfter(safeDate(lastTakenEvent.timestamp), addHours(now, -8))
      ) {
        return {
          nextDose: addHours(safeDate(lastTakenEvent.timestamp), 8),
          isAdjusted: true
        };
      } else {
        const slots = getTidSlots(today);
        const nextSlot = slots.find(slot => isAfter(slot, now)) || slots[0];
        return { nextDose: nextSlot, isAdjusted: false };
      }
    }
    case 'qd': {
      // Once daily at 8am
      const base = set(today, { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 });
      return {
        nextDose: isAfter(base, now) ? base : addHours(base, 24),
        isAdjusted: false
      };
    }
    case 'qpm': {
      // Once daily at 8pm
      const base = set(today, { hours: 20, minutes: 0, seconds: 0, milliseconds: 0 });
      return {
        nextDose: isAfter(base, now) ? base : addHours(base, 24),
        isAdjusted: false
      };
    }
    default:
      return null;
  }
}

function generateSchedule(medications, log) {
  const schedule = [];
  if (!Array.isArray(medications) || !Array.isArray(log)) return schedule;

  const scheduledMeds = medications.filter(m => m.schedule_type === 'scheduled');
  const now = utcToZonedTime(new Date(), timeZone);
  const today = startOfDay(now);

  scheduledMeds.forEach(med => {
    const relevantEvents = log.filter(e => e.medicationId === med.id);
    const lastTakenEvent = relevantEvents.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )[0];

    const result = getNextDoseTime(med, lastTakenEvent, now, today);
    if (result && result.nextDose && isValid(result.nextDose)) {
      schedule.push({
        uniqueId: med.id + '@' + result.nextDose.toISOString(),
        medicationId: med.id,
        name: med.name,
        dose: `${med.dose_mg} mg`,
        time: result.nextDose,
        isAdjusted: result.isAdjusted
      });
    }
  });

  // Always return sorted schedule by time
  return schedule.sort((a, b) => new Date(a.time) - new Date(b.time));
}

module.exports = { generateSchedule };