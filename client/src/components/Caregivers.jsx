import './Contacts.css'; // We can reuse the same styles

function Caregivers({ caregivers }) {
  return (
    <div className="contacts-container">
      <h3>Caregiver List</h3>
      <ul className="contacts-list">
        {/* Add safety check here */}
        {caregivers && caregivers.map(person => (
          <li key={person.phone}>
            <div className="contact-details">
              <span className="contact-name">{person.name}</span>
          
            </div>
            <a href={`tel:${person.phone}`} className="phone-button">Call</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Caregivers;