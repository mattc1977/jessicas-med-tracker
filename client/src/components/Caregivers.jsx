import PropTypes from 'prop-types';
import './Contacts.css'; // Reuse the same styles

function Caregivers({ caregivers }) {
  // Ensure caregivers is always an array to prevent runtime errors
  const safeCaregivers = Array.isArray(caregivers) ? caregivers : [];

  return (
    <div className="contacts-container">
      <h3>Caregiver List</h3>
      <ul className="contacts-list">
        {safeCaregivers.length === 0 ? (
          <li>No caregivers available.</li>
        ) : (
          safeCaregivers.map((person, idx) => {
            // Fallbacks for missing name or phone
            const name = person?.name || 'Unknown';
            const phone = person?.phone || '';
            const key = phone || `caregiver-${idx}`;
            return (
              <li key={key}>
                <div className="contact-details">
                  <span className="contact-name">{name}</span>
                </div>
                {phone ? (
                  <a href={`tel:${phone}`} className="phone-button" aria-label={`Call ${name}`}>
                    Call
                  </a>
                ) : (
                  <span className="phone-button disabled" aria-disabled="true">
                    No phone
                  </span>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

Caregivers.propTypes = {
  caregivers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
    })
  ),
};

Caregivers.defaultProps = {
  caregivers: [],
};

export default Caregivers;
