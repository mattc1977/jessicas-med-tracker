const express = require('express');
const cors = require('cors');
const path = require('path'); // Make sure path is imported
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

// --- Middleware ---
// Use simpler CORS for robust compatibility
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
            default: pillsPerDay = 1; break;
        }
        const daysOfSupply = med.quantity_on_hand / pillsPerDay;
        return { ...med.toObject(), daysOfSupply };
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

// All other POST, DELETE endpoints remain the same...
// This is just a condensed view for clarity. Ensure your other endpoints are still here.

// --- Production Deployment Configuration ---
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, '/client/dist')));

    // Catch-all route to serve the React app
    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
    );
}
// --- End Production Configuration ---


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));