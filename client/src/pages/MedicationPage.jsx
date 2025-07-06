import Inventory from '../components/Inventory';
import RefillList from '../components/RefillList';
import Schedule from '../components/Schedule';
import NauseaLogger from '../components/NauseaLogger';
import useAppStore from '../store/useAppStore';

function MedicationPage() {
  // Get all data and the refresh function from the global store
  const { log, medications, refills, fetchData } = useAppStore();

  return (
    <>
      <RefillList refills={refills} onDataRefresh={fetchData} />
      <Schedule log={log} medications={medications} onDataRefresh={fetchData} />
      <div className="activity-logger-container">
        <NauseaLogger onDataRefresh={fetchData} />
      </div>
      <Inventory medications={medications} onDataRefresh={fetchData} />
    </>
  );
}
export default MedicationPage;