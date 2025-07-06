
const { subHours, subDays, isAfter } = require('date-fns');

function getPrnRecommendation(painLevel, log) {
  const now = new Date();
  const hydroId = 'med-3';
  const tramadolId = 'med-2';

  // --- Calculate Pills Taken in Window ---
  const hydroDosesInLast4Hours = log.filter(e => e.type === 'PRN_MED_TAKEN' && e.medicationId === hydroId && isAfter(new Date(e.timestamp), subHours(now, 4)));
  const hydroPillsTakenInWindow = hydroDosesInLast4Hours.reduce((sum, current) => sum + (current.pillsTaken || 0), 0);

  const tramadolDosesInLast24Hours = log.filter(e => e.type === 'PRN_MED_TAKEN' && e.medicationId === tramadolId && isAfter(new Date(e.timestamp), subDays(now, 1))).length;

  // --- Advanced Hydromorphone Logic ---
  if (hydroPillsTakenInWindow >= 2) {
    return { suggestion: `Unavailable: Maximum dose (2 tablets) of Hydromorphone taken in the last 4 hours.`, medicationId: null, requiresAction: true };
  }
  if (painLevel >= 7 && hydroPillsTakenInWindow === 1) {
    return { suggestion: 'You can take 1 additional tablet of Hydromorphone.', medicationId: hydroId, pillsToTake: 1 };
  }

  // --- Tramadol Safety Check ---
  if (tramadolDosesInLast24Hours >= 3) {
    return { suggestion: 'Unavailable: You have taken the maximum of 3 Tramadol doses in the last 24 hours. Please contact the surgical team.', medicationId: null, requiresAction: true };
  }

  // --- Standard Pain Level Logic ---
  if (painLevel <= 5) return { suggestion: 'For mild to moderate pain, consider your scheduled Tylenol.', medicationId: null };
  if (painLevel === 6) return { suggestion: 'Take 1-2 tablets of Tramadol for moderate pain.', medicationId: tramadolId, pillsToTake: 2 }; // Default to max dose suggestion
  if (painLevel >= 7) {
    const pills = painLevel > 7 ? 2 : 1;
    return { suggestion: `Take ${pills} tablet(s) of Hydromorphone.`, medicationId: hydroId, pillsToTake: pills };
  }

  return { suggestion: 'No pain medication needed.' };
}

module.exports = { getPrnRecommendation };