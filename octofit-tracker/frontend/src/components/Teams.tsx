import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <CapabilityCard title="Teams" description="Manage teams and members."><p role="alert">Unable to load teams: {error}</p></CapabilityCard>;
  if (teams === null) return <CapabilityCard title="Teams" description="Manage teams and members."><p role="status">Loading teams...</p></CapabilityCard>;
  if (teams.length === 0) return <CapabilityCard title="Teams" description="Manage teams and members."><p>No teams yet.</p></CapabilityCard>;

  return <CapabilityCard title="Teams" description="Manage teams and members."><ul>{teams.map((team, index) => <li key={index}><strong>{team.name}</strong>{team.mascot ? ` - ${team.mascot}` : ''}</li>)}</ul></CapabilityCard>;
}
