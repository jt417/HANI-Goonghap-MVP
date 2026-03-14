import { reminderCycleOptions } from './constants';

function parseCycleDays(cycle) {
  const preset = reminderCycleOptions.find((c) => c.value === cycle);
  if (preset) return preset.days;
  const match = cycle.match(/^(\d+)일$/);
  if (match) return parseInt(match[1], 10);
  return null;
}

export function calculateReminder(member, today = new Date('2026-03-14')) {
  if (!member.lastContactDate || !member.reminderCycle) return null;

  const cycleDays = parseCycleDays(member.reminderCycle);
  if (!cycleDays) return null;

  const lastDate = new Date(member.lastContactDate);
  const dueDate = new Date(lastDate);
  dueDate.setDate(dueDate.getDate() + cycleDays);

  const diffMs = today - dueDate;
  const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    isOverdue: daysOverdue >= 0,
    daysOverdue: Math.max(0, daysOverdue),
    dueDate: dueDate.toISOString().split('T')[0],
    urgency: daysOverdue >= cycleDays ? 'high' : daysOverdue >= 0 ? 'medium' : 'none',
    cycleLabel: member.reminderCycle,
  };
}

export function getOverdueReminders(members, today = new Date('2026-03-14')) {
  return members
    .map((m) => ({ member: m, reminder: calculateReminder(m, today) }))
    .filter(({ reminder }) => reminder?.isOverdue)
    .sort((a, b) => b.reminder.daysOverdue - a.reminder.daysOverdue);
}
