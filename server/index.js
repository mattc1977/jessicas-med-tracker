const express = require('express');
const cors = require('cors');
const connectDB = require('./db.js');
const { generateSchedule } = require('./scheduler.js');
const { getPrnRecommendation } = require('./prnLogic.js');
const { sendSms } = require('./smsService.js');

// Import Models
const Medication = require('./models/medicationModel.js');
const Log = require('./models/logModel.js');
const Contact = require('./models/contactModel.js');
const Caregiver = require('./models/caregiverModel.js');

// Connect to Database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- API Endpoints ---
app.get('/api/medications', async (req, res) => res.json(await Medication.find()));
app.get('/api/log', async (req, res) => res.json(await Log.find()));
app.get('/api/contacts', async (req, res) => res.json(await Contact.find()));
app.get('/api/caregivers', async (req, res) => res.json(await Caregiver.find()));

app.get('/api/schedule', async (req, res) => {
  const allMeds = await Medication.find();
  const eventLog = await Log.find();
  const dailySchedule = generateSchedule(allMeds, eventLog);
  res.json(dailySchedule);
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
      case 'qd':
      case 'qpm':
      default: pillsPerDay = 1; break;
    }

    const daysOfSupply = med.quantity_on_hand / pillsPerDay;

    // This is the new, detailed log we need to see
    console.log(
      `-- For ${med.name}: ` +
      `quantity (${typeof med.quantity_on_hand}): ${med.quantity_on_hand}, ` +
      `pillsPerDay (${typeof pillsPerDay}): ${pillsPerDay}, ` +
      `Result (${typeof daysOfSupply}): ${daysOfSupply}`
    );

    return { ...med.toObject(), daysOfSupply: daysOfSupply };
  });

  const needsRefill = medsWithDaysOfSupply.filter(med => {
    return med.daysOfSupply <= dayThreshold && med.quantity_on_hand > 0;
  });

  res.json(needsRefill);
});

app.post('/api/report-pain', async (req, res) => {
  const eventLog = await Log.find();
  const recommendation = getPrnRecommendation(req.body.painLevel, eventLog);
  res.json(recommendation);
});

app.post('/api/log-event', async (req, res) => {
  const eventData = req.body;
  const timestamp = eventData.timestamp ? new Date(eventData.timestamp) : new Date();
    const event = {
    ...eventData,
    timestamp: timestamp, // Use the potentially custom timestamp
    uniqueId: eventData.uniqueId || (eventData.medicationId + '@' + timestamp.toISOString())
  };

  const newLogEntry = await Log.create(event);
  console.log('Event Logged to DB:', newLogEntry);

  if (event.medicationId && event.pillsTaken) {
    await Medication.findOneAndUpdate({ id: event.medicationId }, { $inc: { quantity_on_hand: -event.pillsTaken } });
    console.log(`Inventory updated in DB for medication ${event.medicationId}`);
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
    console.log(`Inventory restored in DB for medication ${deletedEvent.medicationId}`);
  }

  console.log('Event Undone in DB:', uniqueId);
  res.status(200).json({ message: 'Event successfully undone.' });
});

app.post('/api/inventory/update', async (req, res) => {
  const { medicationId, newQuantity } = req.body;
  const updatedMed = await Medication.findOneAndUpdate({ id: medicationId }, { quantity_on_hand: parseInt(newQuantity, 10) }, { new: true });
  console.log(`Manual inventory update in DB for ${updatedMed.name}`);
  res.status(200).json(updatedMed);
});

app.post('/api/refills/received', async (req, res) => {
  const { medicationId, quantityReceived } = req.body;
  const quantity = parseInt(quantityReceived, 10);

  if (!medicationId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid medicationId or quantity' });
  }

  const med = await Medication.findOne({ id: medicationId });
  if (!med) {
    return res.status(404).json({ message: 'Medication not found' });
  }

  med.quantity_on_hand += quantity;
  await med.save();
  console.log(`Inventory for ${med.name} updated to ${med.quantity_on_hand}`);

  await Log.create({
    type: 'REFILL_RECEIVED',
    uniqueId: `refill-received-${medicationId}-${new Date().getTime()}`,
    timestamp: new Date(),
    medicationId: med.id,
    name: med.name,
    details: `Added ${quantity} pills. New total: ${med.quantity_on_hand}.`
  });
  console.log(`Created log for received refill of ${med.name}`);

  res.json(med);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));