import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes?: number; points?: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <CapabilityCard title="Activities" description="Track student activity minutes and points." ><p role="alert">Unable to load activities: {error}</p></CapabilityCard>;
  if (activities === null) return <CapabilityCard title="Activities" description="Track student activity minutes and points." ><p role="status">Loading activities...</p></CapabilityCard>;
  if (activities.length === 0) return <CapabilityCard title="Activities" description="Track student activity minutes and points." ><p>No activities yet.</p></CapabilityCard>;

  return <CapabilityCard title="Activities" description="Track student activity minutes and points." ><ul>{activities.map((activity, index) => <li key={index}>{activity.type}{activity.minutes ? ` - ${activity.minutes} minutes` : ''}{activity.points ? ` - ${activity.points} points` : ''}</li>)}</ul></CapabilityCard>;
}
