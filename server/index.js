const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Middleware
app.use(cors());
app.use(express.json());


// --- API Endpoints ---
app.get('/api/medications', async (req, res) => {
    try { res.json(await Medication.find()); } 
    catch (err) { res.status(500).send('Server Error'); }
});
app.get('/api/log', async (req, res) => {
    try { res.json(await Log.find()); } 
    catch (err) { res.status(500).send('Server Error'); }
});
app.get('/api/contacts', async (req, res) => {
    try { res.json(await Contact.find()); } 
    catch (err) { res.status(500).send('Server Error'); }
});
app.get('/api/caregivers', async (req, res) => {
    try { res.json(await Caregiver.find()); } 
    catch (err) { res.status(500).send('Server Error'); }
});

app.get('/api/schedule', async (req, res) => {
    try {
        const allMeds = await Medication.find();
        const eventLog = await Log.find();
        const dailySchedule = generateSchedule(allMeds, eventLog);
        res.json(dailySchedule);
    } catch (error) {
        console.error("Error in /api/schedule:", error);
        res.status(500).json({ message: "Server error generating schedule" });
    }
});

app.get('/api/refills', async (req, res) => {
    try {
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
    } catch(err) { res.status(500).send('Server Error'); }
});

app.post('/api/report-pain', async (req, res) => {
    try {
        const eventLog = await Log.find();
        const recommendation = getPrnRecommendation(req.body.painLevel, eventLog);
        res.json(recommendation);
    } catch(err) { res.status(500).send('Server Error'); }
});

app.post('/api/log-event', async (req, res) => {
    try {
        const eventData = req.body;
        const timestamp = eventData.timestamp ? new Date(eventData.timestamp) : new Date();
        const event = { ...eventData, timestamp, uniqueId: eventData.uniqueId || `${eventData.medicationId || 'event'}@${timestamp.toISOString()}` };
        const newLogEntry = await Log.create(event);
        if (event.medicationId && event.pillsTaken) {
            await Medication.findOneAndUpdate({ id: event.medicationId }, { $inc: { quantity_on_hand: -event.pillsTaken } });
        }
        if (event.type === 'PRN_MED_TAKEN' && event.medicationId === 'med-3') {
            sendSms(`Alert: Jessica has logged a dose of Hydromorphone.`);
        }
        res.status(201).json(newLogEntry);
    } catch(err) { res.status(500).send('Server Error'); }
});

app.delete('/api/log-event/:uniqueId', async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const deletedEvent = await Log.findOneAndDelete({ uniqueId: uniqueId });
        if (deletedEvent && deletedEvent.medicationId && deletedEvent.pillsTaken) {
            await Medication.findOneAndUpdate({ id: deletedEvent.medicationId }, { $inc: { quantity_on_hand: deletedEvent.pillsTaken } });
        }
        res.status(200).json({ message: 'Event successfully undone.' });
    } catch(err) { res.status(500).send('Server Error'); }
});

app.post('/api/inventory/update', async (req, res) => {
    try {
        const { medicationId, newQuantity } = req.body;
        const updatedMed = await Medication.findOneAndUpdate({ id: medicationId }, { quantity_on_hand: parseInt(newQuantity, 10) }, { new: true });
        res.status(200).json(updatedMed);
    } catch(err) { res.status(500).send('Server Error'); }
});

app.post('/api/refills/received', async (req, res) => {
    try {
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
    } catch(err) { res.status(500).send('Server Error'); }
});

// This block MUST be after all other API routes
if (process.env.NODE_ENV === 'production') {
    // Corrected path goes up one level from /server to find the /client folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'))
    );
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
