import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page-container">
      <h2>About Recovery Hub</h2>

      <div className="purpose-section">
        <div className="purpose-text">
          <p>
            This is a purpose-built application designed to assist with Jessica's post-surgery recovery by tracking medications, symptoms, and daily activities to ensure compliance and safety.
          </p>
        </div>
        <img src="/IMG_8542.jpg" alt="Jessica" className="profile-pic" />
      </div>

      <div className="about-section">
        <h4>Version</h4>
        <p>1.0.0</p>
      </div>

      <div className="about-section">
        <h4>Technology Stack</h4>
        <p>This application is built with the MERN stack (MongoDB, Express, React, Node.js) and utilizes Twilio for SMS notifications and date-fns for time-based logic.</p>
      </div>

      <div className="about-section">
        <h4>Development</h4>
        <p>Developed by Matthew Colsia in conjunction with Google Gemini.</p>
      </div>

      <div className="about-section contact-dev">
        <h4>Interested in purpose-built software?</h4>
        <p>Contact the dev team at: <a href="mailto:matt.colsia@gmail.com">matt.colsia@gmail.com</a> or <a href="tel:404-242-9940">404-242-9940</a>.</p>
      </div>
    </div>
  );
}

export default AboutPage;