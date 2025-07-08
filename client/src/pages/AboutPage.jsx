import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page-container">
      <div className="about-header">
        <h2>About Recovery Hub (v1.0.0)</h2>
        <p>A purpose-built application for post-surgery care.</p>
      </div>

      <div className="profile-pic-container">
        <img src="/IMG_8542.jpg" alt="Jessica" className="profile-pic" />
      </div>

      <div className="about-section">
        <h4>Application Purpose</h4>
        <p>
          This is a private, non-commercial application designed and built to assist with the post-surgery recovery of a single individual, Jessica. Its sole purpose is to send critical, time-sensitive medication and activity alerts to her designated caregiver to ensure medication compliance and safety.
        </p>
      </div>

      <div className="about-section">
        <h4>Contact Information</h4>
        <p>
          <strong>Developer:</strong> Matthew Colsia<br />
          <strong>Email:</strong> <a href="mailto:matt.colsia@gmail.com">matt.colsia@gmail.com</a><br />
          <strong>Phone:</strong> <a href="tel:404-242-9940">404-242-9940</a>
        </p>
      </div>

      <div className="about-section">
        <h4>SMS Program Details</h4>
        <ul>
          <li><strong>Message Type:</strong> Transactional alerts related to medication reminders and critical logged events.</li>
          <li><strong>Message Frequency:</strong> Frequency varies based on medication schedule and user activity.</li>
          <li><strong>Opt-Out:</strong> You can opt out of messages at any time by replying STOP.</li>
          <li><strong>Help:</strong> For help, reply HELP.</li>
          <li>Message and data rates may apply. Carriers are not liable for delayed or undelivered messages.</li>
        </ul>
      </div>

      <div className="about-section">
        <h4>Terms of Service & Privacy Policy</h4>
        <p><strong>Terms:</strong> This application is a private tool intended for personal, non-commercial use by its designated users. It is provided as-is, without warranty.</p>
        <p><strong>Privacy:</strong> Phone numbers associated with this application are used exclusively for sending the alerts described above. All data is provided with direct consent from the users. We will never share or sell phone numbers or personal data to any third parties.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;