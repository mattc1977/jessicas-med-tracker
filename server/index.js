const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

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

// Debug: check for dist
const distPath = path.join(__dirname, '../client/dist');
console.log('[STARTUP] DIST PATH:', distPath, 'Exists?', fs.existsSync(distPath));

// --- API Endpoints ---
// (your routes here, unchanged for brevity)

app.get('/api/medications', async (req, res) => {
  try {
    res.json({ success: true, data: await Medication.find() });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ... other API endpoints ...

// --- Static serving for production ---
if (process.env.NODE_ENV === 'production') {
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) =>
      res.sendFile(path.join(distPath, 'index.html'))
    );
  } else {
    console.error('[ERROR] client/dist does not exist. Did you run `npm run build` in /client?');
    app.get('*', (req, res) =>
      res.status(500).send('Build not found: client/dist missing.')
    );
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
