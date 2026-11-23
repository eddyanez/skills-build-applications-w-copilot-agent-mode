import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError(400, 'Activity details are required');
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw httpError(400, 'A valid userId and teamId are required');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw httpError(400, 'Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Minutes must be a positive number');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');

  const points = minutes;
  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError(400, 'Team details are required');
  }

  const { name, mascot, members = [] } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };
  if (typeof name !== 'string' || !name.trim()) {
    throw httpError(400, 'Team name is required');
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw httpError(400, 'Team mascot is required');
  }
  if (!Array.isArray(members) || members.some((member) => !isObjectId(member))) {
    throw httpError(400, 'Team members must contain valid user IDs');
  }

  const memberCount = await User.countDocuments({ _id: { $in: members } });
  if (memberCount !== members.length) {
    throw httpError(404, 'One or more team members were not found');
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members,
  });
  await User.updateMany({ _id: { $in: members } }, { $set: { team: team._id } });
  return team;
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const teams = await Team.find({
    _id: { $in: totals.map((entry) => entry._id) },
  }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .map((entry) => ({
      teamName: teamNames.get(entry._id.toString()) ?? 'Unknown team',
      totalPoints: entry.totalPoints,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recentActivity = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(1)
    .lean();
  const focus = recentActivity[0]?.type === 'run'
    ? 'endurance'
    : recentActivity[0]?.type
      ? 'strength'
      : user.fitnessGoal;

  const workout = await Workout.findOne({ focus }).lean();
  if (!workout) return [];

  return [{
    ...workout,
    reason: recentActivity[0]
      ? `Based on your recent ${recentActivity[0].type} activity and ${focus} goal`
      : `Based on your ${focus} fitness goal`,
  }];
}

export { User };
