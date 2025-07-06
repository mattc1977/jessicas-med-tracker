const mongoose = require('mongoose');
const connectDB = require('./db.js');
const { medications, contacts, caregivers } = require('./database.js');
const Medication = require('./models/medicationModel.js');
const Contact = require('./models/contactModel.js');
const Caregiver = require('./models/caregiverModel.js');
const Log = require('./models/logModel.js');

connectDB();

const importData = async () => {
  try {
    // Clear all existing data
    await Medication.deleteMany();
    await Contact.deleteMany();
    await Caregiver.deleteMany();
    await Log.deleteMany();

    // Insert the initial data
    await Medication.insertMany(medications);
    await Contact.insertMany(contacts);
    await Caregiver.insertMany(caregivers);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();