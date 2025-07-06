import PainManager from '../components/PainManager';
import { differenceInCalendarDays, format } from 'date-fns';
import './HomePage.css';

// A simple array of quotes
const quotes = [
  "The body heals with play, the mind heals with laughter, and the spirit heals with joy.",
  "Healing takes courage, and we all have courage, even if we have to dig a little to find it.",
  "The wound is the place where the Light enters you. - Rumi",
  "Every day is a step closer to recovery.",
  "Be patient with yourself. Healing is not linear."
];

function HomePage() {
  // Get surgery date from your input
  const surgeryDate = new Date('2025-07-03T08:00:00');
  const today = new Date();
  const postOpDay = differenceInCalendarDays(today, surgeryDate);

  // Select a quote that changes daily
  const quoteIndex = today.getDate() % quotes.length;
  const dailyQuote = quotes[quoteIndex];

  return (
    <div className="homepage-container">
      <div className="welcome-card">
        <h2>Welcome to Recovery Hub</h2>
        <p className="post-op-day">Today is Post-Op Day: <strong>{postOpDay}</strong></p>
        <p className="quote"><em>"{dailyQuote}"</em></p>
      </div>
      <PainManager />
    </div>
  );
}

export default HomePage;