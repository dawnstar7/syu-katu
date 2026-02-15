'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function Calendar({ events, onEventClick, onDateClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ja });
  const calendarEnd = endOfWeek(monthEnd, { locale: ja });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentMonth, 'yyyy年M月', { locale: ja })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            今日
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSunday = index % 7 === 0;
          const isSaturday = index % 7 === 6;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={`min-h-[100px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : isSunday
                    ? 'text-red-600'
                    : isSaturday
                    ? 'text-blue-600'
                    : isCurrentMonth
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {format(day, 'd')}
              </div>

              {/* イベント表示 */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className={`text-xs px-2 py-1 rounded text-white truncate hover:opacity-80 transition-opacity ${
                      EVENT_TYPE_COLORS[event.type]
                    }`}
                    title={`${event.companyName}: ${event.title}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayEvents.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600 font-medium">凡例:</span>
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${EVENT_TYPE_COLORS[type as CalendarEvent['type']]}`} />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
