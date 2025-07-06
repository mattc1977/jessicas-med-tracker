import GeneralActivityLogger from "../components/GeneralActivityLogger";

function ActivityPage() {
  // This function can be built out later if other components are added to this page.
  // For now, it's just a placeholder that we can pass down.
  const handleDataRefresh = () => {
    console.log("Activity logged, refresh triggered.");
  };

  return (
    <GeneralActivityLogger onDataRefresh={handleDataRefresh} />
  );
}
export default ActivityPage;