const mongoose = require('mongoose');
const caregiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
});
const Caregiver = mongoose.model('Caregiver', caregiverSchema);
module.exports = Caregiver;