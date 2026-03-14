import { useMemo } from 'react';
import useAppStore from '../stores/appStore';
import { getOverdueReminders, calculateReminder } from '../lib/reminders';

export function useReminders() {
  const members = useAppStore((s) => s.members);
  const profile = useAppStore((s) => s.profile);

  const allReminders = useMemo(() => getOverdueReminders(members), [members]);

  const myReminders = useMemo(
    () => allReminders.filter(({ member }) => member.manager === profile?.full_name),
    [allReminders, profile],
  );

  const getReminderForMember = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return null;
    return calculateReminder(member);
  };

  return { allReminders, myReminders, getReminderForMember };
}
