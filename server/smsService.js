const path = require('path');
// Point directly to the .env file in the server directory
require('dotenv').config({ path: path.resolve(__dirname, './.env') });


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const caregiverPhone = process.env.CAREGIVER_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

async function sendSms(message) {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: caregiverPhone,
    });
    console.log('SMS alert sent successfully!');
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

module.exports = { sendSms };