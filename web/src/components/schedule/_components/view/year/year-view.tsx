"use client";

import React, { useState } from "react";
import { useScheduler } from "@/providers/schedular-provider";
import { Event, CustomEventModal } from "@/types/index";
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  getDaysInMonth,
  startOfMonth,
  isToday,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function YearView({
  CustomEventComponent,
  CustomEventModal,
  classNames,
  prevButton,
  nextButton,
}: {
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: {
    prev?: string;
    next?: string;
  };
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
}) {
  const { events } = useScheduler();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handlePrevYear = () => {
    setCurrentYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((prev) => prev + 1);
  };

  // Get all months in the year
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Get events count per day
  const getEventsForDay = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    return events.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">{currentYear}</h2>
        <div className="flex gap-2">
          {prevButton ? (
            <div onClick={handlePrevYear}>{prevButton}</div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevYear}
              className={classNames?.prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextYear}>{nextButton}</div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextYear}
              className={classNames?.next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Year Grid - 12 months */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((monthDate) => {
          const month = monthDate.getMonth();
          const daysInMonth = getDaysInMonth(monthDate);
          const firstDayOfMonth = new Date(currentYear, month, 1).getDay();
          const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div
              key={monthDate.toString()}
              className="border rounded-lg p-3 bg-card hover:shadow-md transition-shadow"
            >
              {/* Month Header */}
              <h3 className="text-sm font-semibold mb-2">
                {format(monthDate, "MMMM")}
              </h3>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="text-xs text-center font-medium">
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day, month, currentYear);
                  const isTodayDate = isToday(new Date(currentYear, month, day));

                  return (
                    <div
                      key={day}
                      className={`aspect-square rounded border text-xs p-1 flex flex-col items-start justify-start transition-colors ${
                        isTodayDate
                          ? "bg-primary/10 border-primary"
                          : dayEvents.length > 0
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium text-gray-700">{day}</span>
                      {dayEvents.length > 0 && (
                        <div className="w-full flex gap-0.5 flex-wrap mt-0.5">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={event.id}
                              className="w-1.5 h-1.5 rounded-full bg-blue-500"
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{dayEvents.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
