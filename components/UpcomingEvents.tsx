'use client';

import { Calendar, Clock } from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function UpcomingEvents({ events, onEventClick }: UpcomingEventsProps) {
  // 今日以降のイベントを日付順にソート
  const upcomingEvents = events
    .filter(event => !isPast(new Date(event.date)) || isToday(new Date(event.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // 最大5件表示

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return '今日';
    if (isTomorrow(date)) return '明日';
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `${days}日後`;
    return format(date, 'M月d日(E)', { locale: ja });
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">直近の予定</h2>
        </div>
        <p className="text-gray-500 text-center py-8">予定はありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">直近の予定</h2>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const eventDate = new Date(event.date);
          const isUrgent = differenceInDays(eventDate, new Date()) <= 3;

          return (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                EVENT_TYPE_COLORS[event.type].replace('bg-', 'border-')
              } ${isUrgent ? 'bg-red-50' : 'bg-gray-50'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded text-white ${EVENT_TYPE_COLORS[event.type]}`}
                    >
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      {getDateLabel(eventDate)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {event.companyName}
                  </h3>
                  <p className="text-sm text-gray-700">{event.title}</p>
                  {event.notes && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {event.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {format(eventDate, 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
