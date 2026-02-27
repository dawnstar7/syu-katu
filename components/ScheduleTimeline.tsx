'use client';

import { isToday, isTomorrow, isThisWeek, differenceInDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarCheck, AlertCircle, Building2 } from 'lucide-react';
import type { CalendarEvent } from '@/types';

interface ScheduleTimelineProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const EVENT_COLORS: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  deadline: { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  interview: { dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  event:     { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
};

function getDateLabel(date: Date): string {
  const d = new Date(date);
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  if (isToday(d)) return '今日';
  if (isTomorrow(d)) return '明日';
  const diff = differenceInDays(d, new Date());
  if (diff <= 7) return `${dayNames[d.getDay()]}曜日 (あと${diff}日)`;
  return format(d, 'M月d日(E)', { locale: ja });
}

function getGroupLabel(date: Date): string {
  const d = new Date(date);
  if (isToday(d)) return '今日';
  if (isTomorrow(d)) return '明日';
  if (isThisWeek(d, { weekStartsOn: 1 })) return '今週';
  const diff = differenceInDays(d, new Date());
  if (diff <= 14) return '来週';
  return '来月以降';
}

const GROUP_ORDER = ['今日', '明日', '今週', '来週', '来月以降'];

export default function ScheduleTimeline({ events, onEventClick }: ScheduleTimelineProps) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groups: Record<string, CalendarEvent[]> = {};
  upcoming.forEach(event => {
    const label = getGroupLabel(new Date(event.date));
    if (!groups[label]) groups[label] = [];
    groups[label].push(event);
  });

  const sortedGroupKeys = GROUP_ORDER.filter(k => groups[k]);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <CalendarCheck className="w-14 h-14 mb-4 opacity-30" />
        <p className="text-base font-medium">予定はありません</p>
        <p className="text-sm mt-1">企業を追加してスケジュールを登録しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sortedGroupKeys.map(groupLabel => (
        <div key={groupLabel}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              groupLabel === '今日' ? 'bg-red-100 text-red-700'
              : groupLabel === '明日' ? 'bg-orange-100 text-orange-700'
              : 'bg-gray-100 text-gray-600'
            }`}>
              {groupLabel}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-2">
            {groups[groupLabel].map(event => {
              const colorSet = EVENT_COLORS[event.type] || EVENT_COLORS.event;
              const urgent = isToday(new Date(event.date)) || isTomorrow(new Date(event.date));

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all active:scale-95 ${
                    urgent
                      ? `${colorSet.bg} ${colorSet.border} shadow-sm`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <span className={`flex-shrink-0 w-3 h-3 rounded-full ${colorSet.dot}`} />

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${urgent ? colorSet.text : 'text-gray-800'}`}>
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500 truncate">{event.companyName}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className={`text-xs font-medium ${urgent ? colorSet.text : 'text-gray-500'}`}>
                      {getDateLabel(new Date(event.date))}
                    </p>
                  </div>

                  {isToday(new Date(event.date)) && (
                    <AlertCircle className={`flex-shrink-0 w-4 h-4 ${colorSet.text}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
