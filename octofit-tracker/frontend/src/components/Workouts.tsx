import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason?: string; focus?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns."><p role="alert">Unable to load workout suggestions: {error}</p></CapabilityCard>;
  if (suggestions === null) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns."><p role="status">Loading workout suggestions...</p></CapabilityCard>;
  if (suggestions.length === 0) return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns."><p>No workout suggestions available.</p></CapabilityCard>;

  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns."><ul>{suggestions.map((workout, index) => <li key={index}><strong>{workout.title}</strong>{workout.reason ? ` - ${workout.reason}` : ''}</li>)}</ul></CapabilityCard>;
}
