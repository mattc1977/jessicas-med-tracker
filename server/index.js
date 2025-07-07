const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db.js');
const { generateSchedule } = require('./scheduler.js');
const { getPrnRecommendation } = require('./prnLogic.js');
const { sendSms } = require('./smsService.js');

const Medication = require('./models/medicationModel.js');
const Log = require('./models/logModel.js');
const Contact = require('./models/contactModel.js');
const Caregiver = require('./models/caregiverModel.js');

console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
connectDB();
const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN
};
app.use(cors(corsOptions));
app.use(express.json());

// Route logging proxy for debugging
['get', 'post', 'put', 'delete'].forEach(method => {
  const orig = app[method];
  app[method] = function(path, ...rest) {
    console.log(`Registering ${method.toUpperCase()} route:`, path);
    return orig.call(this, path, ...rest);
  };
});

// API Routes
app.get('/api/medications', async (req, res) => res.json(await Medication.find()));
app.get('/api/log', async (req, res) => res.json(await Log.find()));
app.get('/api/contacts', async (req, res) => res.json(await Contact.find()));
app.get('/api/caregivers', async (req, res) => res.json(await Caregiver.find()));

app.get('/api/schedule', async (req, res) => {
  const allMeds = await Medication.find();
  const eventLog = await Log.find();
  res.json(generateSchedule(allMeds, eventLog));
});

app.get('/api/refills', async (req, res) => {
  const allMeds = await Medication.find({});
  const today = new Date().getDay();
  const isPreWeekend = [3, 4, 5].includes(today);
  const dayThreshold = isPreWeekend ? 7 : 5;
  const medsWithDaysOfSupply = allMeds.map(med => {
    let pillsPerDay;
    switch (med.frequency) {
      case 'tid': pillsPerDay = 3; break;
      case 'q4h': pillsPerDay = 6; break;
      default: pillsPerDay = 1; break;
    }
    const daysOfSupply = pillsPerDay > 0 ? med.quantity_on_hand / pillsPerDay : Infinity;
    return { ...med.toObject(), daysOfSupply };
  });
  const needsRefill = medsWithDaysOfSupply.filter(med => med.daysOfSupply <= dayThreshold && med.quantity_on_hand > 0);
  res.json(needsRefill);
});

app.post('/api/report-pain', async (req, res) => {
  const eventLog = await Log.find();
  res.json(getPrnRecommendation(req.body.painLevel, eventLog));
});

app.post('/api/log-event', async (req, res) => {
  const eventData = req.body;
  const timestamp = eventData.timestamp ? new Date(eventData.timestamp) : new Date();
  const event = {
    ...eventData,
    timestamp,
    uniqueId: eventData.uniqueId || `${eventData.medicationId || 'event'}@${timestamp.toISOString()}`
  };
  const newLogEntry = await Log.create(event);
  if (event.medicationId && event.pillsTaken) {
    await Medication.findOneAndUpdate({ id: event.medicationId }, { $inc: { quantity_on_hand: -event.pillsTaken } });
  }
  if (event.type === 'PRN_MED_TAKEN' && event.medicationId === 'med-3') {
    sendSms(`Alert: Jessica has logged a dose of Hydromorphone.`);
  }
  res.status(201).json(newLogEntry);
});

app.delete('/api/log-event/:uniqueId', async (req, res) => {
  const { uniqueId } = req.params;
  const deletedEvent = await Log.findOneAndDelete({ uniqueId: uniqueId });
  if (deletedEvent && deletedEvent.medicationId && deletedEvent.pillsTaken) {
    await Medication.findOneAndUpdate({ id: deletedEvent.medicationId }, { $inc: { quantity_on_hand: deletedEvent.pillsTaken } });
  }
  res.status(200).json({ message: 'Event successfully undone.' });
});

app.post('/api/inventory/update', async (req, res) => {
  const { medicationId, newQuantity } = req.body;
  res.status(200).json(await Medication.findOneAndUpdate(
    { id: medicationId },
    { quantity_on_hand: parseInt(newQuantity, 10) },
    { new: true }
  ));
});

app.post('/api/refills/received', async (req, res) => {
  const { medicationId, quantityReceived } = req.body;
  const quantity = parseInt(quantityReceived, 10);
  if (!medicationId || !quantity || quantity <= 0) return res.status(400).json({ message: 'Invalid data' });
  const med = await Medication.findOne({ id: medicationId });
  if (!med) return res.status(404).json({ message: 'Medication not found' });
  med.quantity_on_hand += quantity;
  await med.save();
  await Log.create({
    type: 'REFILL_RECEIVED',
    uniqueId: `refill-received-${medicationId}-${new Date().getTime()}`,
    timestamp: new Date(),
    medicationId: med.id,
    name: med.name,
    details: `Added ${quantity} pills. New total: ${med.quantity_on_hand}.`
  });
  res.json(med);
});

// Serve static files and handle client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get(/.*/, (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'))
  );
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));