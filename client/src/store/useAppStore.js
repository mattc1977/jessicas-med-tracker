import { create } from 'zustand';

// Use the API_URL for deployment, but default to localhost for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAppStore = create((set) => ({
  // State
  medications: [],
  log: [],
  contacts: [],
  caregivers: [],
  refills: [],
  schedule: [],

  // Actions
  fetchData: async () => {
    try {
      // Fetch all data sources simultaneously
      const [medsRes, logRes, contactsRes, caregiversRes, refillsRes, scheduleRes] = await Promise.all([
        fetch(`${API_URL}/api/medications`),
        fetch(`${API_URL}/api/log`),
        fetch(`${API_URL}/api/contacts`),
        fetch(`${API_URL}/api/caregivers`),
        fetch(`${API_URL}/api/refills`), // This was the missing line
        fetch(`${API_URL}/api/schedule`),
      ]);

      // Update the state with all the new data
      set({
        medications: await medsRes.json(),
        log: await logRes.json(),
        contacts: await contactsRes.json(),
        caregivers: await caregiversRes.json(),
        refills: await refillsRes.json(),
        schedule: await scheduleRes.json(),
      });

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  },
}));

export default useAppStore;