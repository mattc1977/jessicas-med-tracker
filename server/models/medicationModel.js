const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dose_mg: { type: Number, required: true },
  pills_per_dose: { type: Number },
  pills_per_dose_max: { type: Number },
  schedule_type: { type: String, required: true },
  frequency: { type: String, required: true },
  quantity_on_hand: { type: Number, required: true },
  prn_pain_level: { type: Number },
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;