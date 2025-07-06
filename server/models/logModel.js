const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  timestamp: { type: Date, required: true },
  medicationId: { type: String },
  name: { type: String },
  dose: { type: String },
  pillsTaken: { type: Number },
  details: { type: mongoose.Schema.Types.Mixed }, // For flexible details object
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;