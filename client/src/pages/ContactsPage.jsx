import Caregivers from "../components/Caregivers";
import Contacts from "../components/Contacts";
import useAppStore from "../store/useAppStore";

function ContactsPage() {
  // Get both lists from the global store
  const { contacts, caregivers } = useAppStore((state) => state);

  return (
    <>
      {/* Pass the data down to the components as props */}
      <Caregivers caregivers={caregivers} />
      <Contacts contacts={contacts} />
    </>
  );
}

export default ContactsPage;