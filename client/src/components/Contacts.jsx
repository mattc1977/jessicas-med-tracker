import './Contacts.css';

function Contacts({ contacts }) {
  return (
    <div className="contacts-container">
      <h3>Emergency Contacts</h3>
      <ul className="contacts-list">
        {/* Add safety check */}
        {contacts && contacts.map(contact => (
          <li key={contact.id}>
            <div className="contact-details">
              <span className="contact-name">{contact.name}</span>
              {contact.instruction && (
                <span className="contact-instruction">{contact.instruction}</span>
              )}
            </div>
            <a href={`tel:${contact.phone}`} className="phone-button">Call</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Contacts;