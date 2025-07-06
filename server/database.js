// A simple "mock" database for now.
const medications = [
  { id: 'med-1', name: 'Tylenol', dose_mg: 325, pills_per_dose: 1, schedule_type: 'scheduled', frequency: 'tid', quantity_on_hand: 270 },
  { id: 'med-2', name: 'Tramadol', dose_mg: 50, pills_per_dose_max: 2, schedule_type: 'prn', frequency: 'tid', quantity_on_hand: 90, prn_pain_level: 6 },
  { id: 'med-3', name: 'Hydromorphone', dose_mg: 2, pills_per_dose_max: 2, schedule_type: 'prn', frequency: 'q4h', quantity_on_hand: 90, prn_pain_level: 7 },
  { id: 'med-4', name: 'Celebrex', dose_mg: 200, pills_per_dose: 1, schedule_type: 'scheduled', frequency: 'qd', quantity_on_hand: 30 },
  { id: 'med-5', name: 'Omeprazole', dose_mg: 40, pills_per_dose: 1, schedule_type: 'scheduled', frequency: 'qd', quantity_on_hand: 30 },
  { id: 'med-6', name: 'Zofran', dose_mg: 4, pills_per_dose: 1, schedule_type: 'scheduled', frequency: 'tid', quantity_on_hand: 14 },
  { id: 'med-7', name: 'Senna', dose_mg: 8.6, pills_per_dose: 1, schedule_type: 'scheduled', frequency: 'qpm', quantity_on_hand: 30 },
];

const contacts = [
  { id: 'contact-1', name: 'Ortho Surgery Clinic (Business Hours)', phone: '301-295-4290', instruction: null },
  { id: 'contact-2', name: 'Tim Rankin, RN (Nurse Line)', phone: '301-319-4457', instruction: null },
  { id: 'contact-3', name: 'Ortho Resident on Call (After Hours)', phone: '301-295-4611', instruction: 'Select option 4, then ask for the ortho surgery resident on call.' },
  { id: 'contact-4', name: 'Walter Reed ED', phone: '301-295-4611', instruction: null },
  { id: 'contact-5', name: 'Fort Belvoir ED', phone: '571-231-3124', instruction: null },
  { id: 'contact-6', name: 'Inova Fairfax ED (Gallows Rd)', phone: '703-776-4001', instruction: null },
];

const caregivers = [
  { name: 'Matthew', phone: '404-242-9940' },
  { name: 'Jody', phone: '503-949-8058' },
  { name: 'Abigail', phone: '434-284-1038' },
  { name: 'Gabriella', phone: '254-312-1118' },
  { name: 'Sophia', phone: '571-647-0625' },
  { name: 'Alexc', phone: '591-501-9974' },
  { name: 'Marrisa', phone: '719-640-6116' },
  { name: 'Jocelyn', phone: '617-645-2567' },
  { name: 'Elaf', phone: '901-721-3979' },
];

// This file is no longer used by the main app, but is used by the seeder.
// It is kept for reference and to populate the database.
module.exports = {
  medications,
  contacts,
  caregivers,
};