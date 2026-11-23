import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: Entry[] }>('/api/leaderboard')
      .then((data) => setEntries(data.leaderboard))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <CapabilityCard title="Leaderboard" description="Compare team point totals."><p role="alert">Unable to load leaderboard: {error}</p></CapabilityCard>;
  if (entries === null) return <CapabilityCard title="Leaderboard" description="Compare team point totals."><p role="status">Loading leaderboard...</p></CapabilityCard>;
  if (entries.length === 0) return <CapabilityCard title="Leaderboard" description="Compare team point totals."><p>No leaderboard rankings yet.</p></CapabilityCard>;

  return <CapabilityCard title="Leaderboard" description="Compare team point totals."><ol>{entries.map((entry) => <li key={`${entry.rank}-${entry.teamName}`}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol></CapabilityCard>;
}
