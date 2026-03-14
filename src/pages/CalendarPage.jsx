import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Edit3, Trash2,
  Clock, MapPin, CalendarDays, AlertCircle, Bell, Users, FileText,
} from 'lucide-react';
import useAppStore from '../stores/appStore';
import { useMembers } from '../hooks/useMembers';
import { useReminders } from '../hooks/useReminders';
import { meetingTypeColors } from '../lib/constants';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MEETING_TYPES = ['상담', '만남', '피드백', '프로필촬영', '계약'];
const TIME_OPTIONS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00',
];

const TODAY_STR = '2026-03-14';
const TODAY = new Date(2026, 2, 14);

const MEETING_TYPE_ICONS = {
  '상담': '💬',
  '만남': '🤝',
  '피드백': '📝',
  '프로필촬영': '📸',
  '계약': '📋',
};

const STATUS_STYLES = {
  '신규 상담': 'bg-blue-100 text-blue-700',
  '소개 가능': 'bg-emerald-100 text-emerald-700',
  '소개 진행중': 'bg-violet-100 text-violet-700',
  '보류': 'bg-amber-100 text-amber-700',
  '휴면': 'bg-slate-100 text-slate-500',
};

export default function CalendarPage() {
  const members = useAppStore((s) => s.members);
  const profile = useAppStore((s) => s.profile);
  const showToast = useAppStore((s) => s.showToast);
  const { updateMember } = useMembers();
  const { myReminders, allReminders } = useReminders();

  const [currentMonth, setCurrentMonth] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    memberId: '', type: '상담', time: '14:00', location: '', note: '',
  });

  const targetMembers = showOnlyMine
    ? members.filter((m) => m.manager === profile?.full_name)
    : members;

  const activeReminders = showOnlyMine ? myReminders : allReminders;

  // Build map of date -> meetings
  const meetingMap = useMemo(() => {
    const map = {};
    targetMembers.forEach((member) => {
      (member.meetings || []).forEach((meeting) => {
        if (!map[meeting.date]) map[meeting.date] = [];
        map[meeting.date].push({ member, meeting });
      });
    });
    // Sort each date's meetings by time
    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => (a.meeting.time || '99:99').localeCompare(b.meeting.time || '99:99'));
    });
    return map;
  }, [targetMembers]);

  // Reminder dates map
  const reminderDateMap = useMemo(() => {
    const map = {};
    activeReminders.forEach(({ member, reminder }) => {
      const d = reminder.dueDate;
      if (!map[d]) map[d] = [];
      map[d].push({ member, reminder });
    });
    return map;
  }, [activeReminders]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const formatDate = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
    setSelectedDate(TODAY_STR);
  };

  const selectedMeetings = selectedDate ? meetingMap[selectedDate] || [] : [];
  const selectedReminders = selectedDate ? reminderDateMap[selectedDate] || [] : [];
  const totalMeetings = Object.values(meetingMap).reduce((s, arr) => s + arr.length, 0);

  // Today's meetings count
  const todayMeetings = meetingMap[TODAY_STR] || [];

  // This week's meetings (Mon-Sun containing today)
  const thisWeekMeetings = useMemo(() => {
    const dayOfWeek = TODAY.getDay();
    const weekStart = new Date(TODAY);
    weekStart.setDate(TODAY.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const results = [];
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (meetingMap[ds]) {
        meetingMap[ds].forEach((item) => results.push({ ...item, dateStr: ds }));
      }
    }
    return results;
  }, [meetingMap]);

  // Meeting type stats for this month
  const monthStats = useMemo(() => {
    const stats = {};
    MEETING_TYPES.forEach((t) => (stats[t] = 0));
    Object.entries(meetingMap).forEach(([date, arr]) => {
      if (date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        arr.forEach(({ meeting }) => {
          stats[meeting.type] = (stats[meeting.type] || 0) + 1;
        });
      }
    });
    return stats;
  }, [meetingMap, year, month]);

  // Format selected date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = DAY_LABELS[d.getDay()];
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}월 ${day}일 (${dayOfWeek})`;
  };

  const openNewForm = () => {
    setEditIdx(null);
    setMeetingForm({ memberId: '', type: '상담', time: '14:00', location: '', note: '' });
    setAddFormOpen(true);
  };

  const handleAddMeeting = () => {
    if (!meetingForm.memberId || !selectedDate) return;
    const member = members.find((m) => m.id === meetingForm.memberId);
    if (!member) return;
    const newMeeting = {
      date: selectedDate,
      type: meetingForm.type,
      time: meetingForm.time,
      location: meetingForm.location,
      note: meetingForm.note || `${meetingForm.type} 예정`,
    };
    const meetings = [...(member.meetings || []), newMeeting];
    updateMember(member.id, { meetings });
    showToast(`${member.name} ${meetingForm.type} 일정 추가됨`, 'emerald');
    setMeetingForm({ memberId: '', type: '상담', time: '14:00', location: '', note: '' });
    setAddFormOpen(false);
  };

  const handleEditMeeting = (memberObj, meetingIdx) => {
    const meeting = memberObj.meetings[meetingIdx];
    setMeetingForm({
      memberId: memberObj.id,
      type: meeting.type,
      time: meeting.time || '',
      location: meeting.location || '',
      note: meeting.note || '',
    });
    setEditIdx({ memberId: memberObj.id, idx: meetingIdx });
    setAddFormOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editIdx) return;
    const member = members.find((m) => m.id === editIdx.memberId);
    if (!member) return;
    const meetings = [...(member.meetings || [])];
    meetings[editIdx.idx] = {
      ...meetings[editIdx.idx],
      type: meetingForm.type,
      time: meetingForm.time,
      location: meetingForm.location,
      note: meetingForm.note,
    };
    updateMember(member.id, { meetings });
    showToast('일정 수정됨', 'emerald');
    setEditIdx(null);
    setMeetingForm({ memberId: '', type: '상담', time: '14:00', location: '', note: '' });
    setAddFormOpen(false);
  };

  const handleDeleteMeeting = (memberObj, meetingIdx) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
    const meetings = (memberObj.meetings || []).filter((_, i) => i !== meetingIdx);
    updateMember(memberObj.id, { meetings });
    showToast('일정 삭제됨', 'slate');
  };

  const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth();

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── Left: Calendar ─── */}
      <div className={`flex min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-6 ${showRightPanel ? 'hidden lg:flex' : 'flex'}`}>

        {/* Top bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">캘린더</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              이번 달 <span className="font-bold text-violet-600">{totalMeetings}건</span>
              {todayMeetings.length > 0 && (
                <span className="ml-2">
                  · 오늘 <span className="font-bold text-rose-600">{todayMeetings.length}건</span>
                </span>
              )}
              {activeReminders.length > 0 && (
                <span className="ml-2">
                  · 리마인더 <span className="font-bold text-amber-600">{activeReminders.length}건</span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { openNewForm(); setShowRightPanel(true); }}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition md:px-4"
            >
              <Plus size={15} /> <span className="hidden sm:inline">일정 </span>추가
            </button>
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setShowOnlyMine(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${showOnlyMine ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                내 담당
              </button>
              <button
                onClick={() => setShowOnlyMine(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${!showOnlyMine ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                전체
              </button>
            </div>
          </div>
        </div>

        {/* Month type stats bar */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {MEETING_TYPES.map((type) => (
            <div
              key={type}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meetingTypeColors[type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
            >
              <span>{MEETING_TYPE_ICONS[type]}</span>
              <span>{type}</span>
              <span className="ml-0.5 font-bold">{monthStats[type] || 0}</span>
            </div>
          ))}
        </div>

        {/* Month navigation */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
              <ChevronLeft size={20} />
            </button>
            <h3 className="min-w-[120px] text-center text-lg font-bold text-slate-900">
              {year}년 {month + 1}월
            </h3>
            <button onClick={nextMonth} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
              <ChevronRight size={20} />
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              onClick={goToday}
              className="flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition"
            >
              <CalendarDays size={13} /> 오늘
            </button>
          )}
        </div>

        {/* Day labels */}
        <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wider">
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className={`py-1.5 ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
          {calendarDays.map((day, i) => {
            if (day === null)
              return <div key={`empty-${i}`} className="min-h-[60px] bg-slate-50/80 md:min-h-[90px]" />;
            const dateStr = formatDate(day);
            const meetings = meetingMap[dateStr] || [];
            const reminders = reminderDateMap[dateStr] || [];
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === TODAY_STR;
            const colIndex = i % 7;
            const isSunday = colIndex === 0;
            const isSaturday = colIndex === 6;
            const isPast = dateStr < TODAY_STR;

            return (
              <button
                key={day}
                onClick={() => { setSelectedDate(dateStr); setShowRightPanel(true); }}
                className={`
                  min-h-[60px] p-1 text-left transition-all relative md:min-h-[90px] md:p-1.5
                  ${isSelected ? 'ring-2 ring-inset ring-violet-500 bg-violet-50' : 'bg-white hover:bg-slate-50'}
                  ${isToday && !isSelected ? 'bg-violet-50/60' : ''}
                  ${isPast && !isSelected && !isToday ? 'bg-slate-50/40' : ''}
                `}
              >
                {/* Date number */}
                <div className="flex items-center justify-between">
                  <div
                    className={`
                      inline-flex h-6 w-6 items-center justify-center rounded-full text-xs
                      ${isToday ? 'bg-violet-600 font-bold text-white' : ''}
                      ${!isToday && isSunday ? 'font-medium text-rose-500' : ''}
                      ${!isToday && isSaturday ? 'font-medium text-blue-500' : ''}
                      ${!isToday && !isSunday && !isSaturday ? 'font-medium text-slate-700' : ''}
                      ${isPast && !isToday ? 'opacity-50' : ''}
                    `}
                  >
                    {day}
                  </div>
                  {/* Meeting count badge */}
                  {meetings.length > 0 && (
                    <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                      isToday ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {meetings.length}
                    </span>
                  )}
                </div>

                {/* Meeting pills — text on md+, dots on mobile */}
                <div className="mt-0.5 space-y-px">
                  {/* Mobile: color dots */}
                  <div className="flex flex-wrap gap-0.5 md:hidden">
                    {meetings.slice(0, 4).map(({ meeting }, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          meeting.type === '상담' ? 'bg-blue-500' :
                          meeting.type === '만남' ? 'bg-emerald-500' :
                          meeting.type === '피드백' ? 'bg-amber-500' :
                          meeting.type === '프로필촬영' ? 'bg-rose-500' :
                          meeting.type === '계약' ? 'bg-violet-500' : 'bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Desktop: text pills */}
                  <div className="hidden md:block md:space-y-px">
                    {meetings.slice(0, 3).map(({ member, meeting }, idx) => (
                      <div
                        key={idx}
                        className={`truncate rounded px-1 py-px text-[9px] font-medium leading-tight ${meetingTypeColors[meeting.type] || 'bg-slate-100 text-slate-600'}`}
                        style={{ borderWidth: 0 }}
                      >
                        {meeting.time ? `${meeting.time.slice(0, 5)} ` : ''}{member.name}
                      </div>
                    ))}
                    {meetings.length > 3 && (
                      <div className="text-[9px] font-medium text-slate-400 pl-1">+{meetings.length - 3}</div>
                    )}
                  </div>
                </div>

                {/* Reminder dot */}
                {reminders.length > 0 && (
                  <div className="absolute bottom-1 right-1.5">
                    <div className="flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-amber-400 px-0.5 text-[8px] font-bold text-white" title={`리마인더 ${reminders.length}건`}>
                      {reminders.length}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div className={`fixed inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto lg:w-[360px] lg:shrink-0 lg:border-l lg:border-slate-200 ${showRightPanel ? '' : 'hidden lg:block'}`}>
        <button
          onClick={() => setShowRightPanel(false)}
          className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
        >
          <ChevronLeft size={18} /> 캘린더로 돌아가기
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Selected date header */}
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 md:text-lg">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedMeetings.length > 0 ? `${selectedMeetings.length}건의 일정` : '일정 없음'}
                {selectedReminders.length > 0 && ` · 리마인더 ${selectedReminders.length}건`}
              </p>
            </div>
            <button
              onClick={openNewForm}
              className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700 transition shadow-sm"
            >
              <Plus size={13} /> 추가
            </button>
          </div>
        </div>

        <div className="px-4 py-3 space-y-5 md:px-5 md:py-4">
          {/* ── Add/Edit Form ── */}
          {addFormOpen && (
            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-violet-900">
                  {editIdx ? '일정 수정' : '새 일정'}
                </h4>
                <button
                  onClick={() => { setAddFormOpen(false); setEditIdx(null); }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {/* Member select */}
                {!editIdx && (
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-600">회원 선택 *</label>
                    <select
                      value={meetingForm.memberId}
                      onChange={(e) => setMeetingForm((f) => ({ ...f, memberId: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="">회원을 선택하세요</option>
                      {targetMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.gender === 'M' ? '남' : '여'}, {m.age}세) — {m.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Meeting type */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">유형 *</label>
                  <div className="flex flex-wrap gap-1">
                    {MEETING_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setMeetingForm((f) => ({ ...f, type: t }))}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                          meetingForm.type === t
                            ? meetingTypeColors[t] || 'bg-violet-100 text-violet-700 border-violet-200'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {MEETING_TYPE_ICONS[t]} {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time & Location row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <Clock size={10} /> 시간
                    </label>
                    <select
                      value={meetingForm.time}
                      onChange={(e) => setMeetingForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="">미정</option>
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <MapPin size={10} /> 장소
                    </label>
                    <input
                      value={meetingForm.location}
                      onChange={(e) => setMeetingForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="예: 압구정 오피스"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <FileText size={10} /> 메모
                  </label>
                  <input
                    value={meetingForm.note}
                    onChange={(e) => setMeetingForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="회원 성향, 준비사항 등"
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setAddFormOpen(false); setEditIdx(null); }}
                    className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={editIdx ? handleSaveEdit : handleAddMeeting}
                    disabled={!editIdx && !meetingForm.memberId}
                    className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40 transition shadow-sm"
                  >
                    {editIdx ? '수정 저장' : '일정 추가'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Selected Date Meetings ── */}
          {selectedMeetings.length === 0 && selectedReminders.length === 0 && !addFormOpen ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-10">
              <CalendarDays size={28} className="text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">일정이 없습니다</p>
              <button
                onClick={openNewForm}
                className="mt-3 text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                + 새 일정 추가
              </button>
            </div>
          ) : (
            <>
              {/* Reminders for this date */}
              {selectedReminders.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Bell size={13} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">컨택 리마인더</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedReminders.map(({ member, reminder }, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border px-3 py-2 ${
                          reminder.urgency === 'high'
                            ? 'border-rose-200 bg-rose-50'
                            : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-800">{member.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            reminder.urgency === 'high' ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'
                          }`}>
                            {reminder.daysOverdue > 0 ? `${reminder.daysOverdue}일 초과` : '오늘까지'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          주기: {reminder.cycleLabel} · 마지막 컨택: {member.lastContactDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting cards */}
              {selectedMeetings.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={13} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">일정 목록</span>
                  </div>
                  <div className="space-y-2">
                    {selectedMeetings.map(({ member, meeting }, idx) => {
                      const meetingIdx = (member.meetings || []).findIndex(
                        (mt) => mt.date === meeting.date && mt.type === meeting.type && mt.note === meeting.note
                      );
                      return (
                        <div
                          key={idx}
                          className="group rounded-xl border border-slate-200 bg-white p-3 hover:shadow-sm transition"
                        >
                          {/* Top row: type badge + time + actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meetingTypeColors[meeting.type] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {MEETING_TYPE_ICONS[meeting.type]} {meeting.type}
                              </span>
                              {meeting.time && (
                                <span className="flex items-center gap-0.5 text-xs font-semibold text-slate-700">
                                  <Clock size={10} className="text-slate-400" /> {meeting.time}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleEditMeeting(member, meetingIdx >= 0 ? meetingIdx : idx)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                title="수정"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteMeeting(member, meetingIdx >= 0 ? meetingIdx : idx)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                                title="삭제"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Member info */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-bold text-slate-600">
                              {member.gender === 'M' ? '남' : '여'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-slate-900 truncate">{member.name}</span>
                                <span className="text-[10px] text-slate-400">{member.age}세</span>
                                <span className={`rounded px-1.5 py-px text-[9px] font-medium ${STATUS_STYLES[member.status] || 'bg-slate-100 text-slate-500'}`}>
                                  {member.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">{member.job}</p>
                            </div>
                          </div>

                          {/* Location */}
                          {meeting.location && (
                            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                              <MapPin size={10} className="text-slate-400 shrink-0" />
                              <span className="truncate">{meeting.location}</span>
                            </div>
                          )}

                          {/* Note */}
                          {meeting.note && (
                            <p className="mt-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600 leading-relaxed">
                              {meeting.note}
                            </p>
                          )}

                          {/* Manager */}
                          <div className="mt-1.5 text-[10px] text-slate-400">
                            담당: {member.manager}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── This Week Overview ── */}
          {selectedDate === TODAY_STR && thisWeekMeetings.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <CalendarDays size={13} className="text-violet-500" />
                <span className="text-xs font-bold text-slate-700">이번 주 일정</span>
                <span className="text-[10px] text-slate-400 ml-auto">{thisWeekMeetings.length}건</span>
              </div>
              <div className="space-y-1">
                {thisWeekMeetings.map(({ member, meeting, dateStr }, idx) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const dayLabel = DAY_LABELS[d.getDay()];
                  const dayNum = d.getDate();
                  const isPastMeeting = dateStr < TODAY_STR;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-50 transition ${
                        dateStr === TODAY_STR ? 'bg-violet-50/50' : ''
                      } ${isPastMeeting ? 'opacity-50' : ''}`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 flex-col items-center justify-center rounded-lg text-[9px] leading-tight ${
                        dateStr === TODAY_STR ? 'bg-violet-600 text-white font-bold' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span>{dayLabel}</span>
                        <span className="text-[10px] font-bold">{dayNum}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-slate-800 truncate">{member.name}</span>
                          <span className={`shrink-0 rounded px-1 py-px text-[8px] font-bold ${meetingTypeColors[meeting.type] || 'bg-slate-100 text-slate-600'}`} style={{ borderWidth: 0 }}>
                            {meeting.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {meeting.time || '시간 미정'}{meeting.location ? ` · ${meeting.location}` : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Overdue Reminders Summary ── */}
          {activeReminders.length > 0 && selectedDate === TODAY_STR && (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={13} className="text-rose-500" />
                <span className="text-xs font-bold text-slate-700">컨택 필요 회원</span>
                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 ml-auto">
                  {activeReminders.length}
                </span>
              </div>
              <div className="space-y-1">
                {activeReminders.slice(0, 5).map(({ member, reminder }, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 ${
                      reminder.urgency === 'high' ? 'bg-rose-50' : 'bg-amber-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-800">{member.name}</span>
                      <p className="text-[10px] text-slate-500">{reminder.cycleLabel} 주기 · {member.lastContactDate}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      reminder.urgency === 'high' ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'
                    }`}>
                      +{reminder.daysOverdue}일
                    </span>
                  </div>
                ))}
                {activeReminders.length > 5 && (
                  <p className="text-center text-[10px] text-slate-400">외 {activeReminders.length - 5}건</p>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
