"use client";

import React, { useState } from "react";
import { useScheduler } from "@/providers/schedular-provider";
import { Event, CustomEventModal } from "@/types/index";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AgendaView({
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
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get events sorted by date
    const sortedEvents = React.useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        return events.events
            .filter(
                (event) =>
                    event.startDate >= monthStart && event.startDate <= monthEnd
            )
            .sort(
                (a, b) =>
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
    }, [events.events, currentDate]);

    // Group events by date
    const groupedByDate = React.useMemo(() => {
        const groups: { [key: string]: Event[] } = {};

        sortedEvents.forEach((event) => {
            const dateKey = format(new Date(event.startDate), "yyyy-MM-dd");
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(event);
        });

        return groups;
    }, [sortedEvents]);

    const handlePrevMonth = () => {
        setCurrentDate((prev) => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate((prev) => addMonths(prev, 1));
    };

    return (
        <div className="w-full space-y-4">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                    {prevButton ? (
                        <div onClick={handlePrevMonth}>{prevButton}</div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevMonth}
                            className={classNames?.prev}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                    {nextButton ? (
                        <div onClick={handleNextMonth}>{nextButton}</div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextMonth}
                            className={classNames?.next}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {Object.keys(groupedByDate).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No events scheduled for {format(currentDate, "MMMM yyyy")}</p>
                    </div>
                ) : (
                    Object.entries(groupedByDate).map(([dateKey, dayEvents]) => (
                        <div key={dateKey} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3">
                                {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                            </h3>
                            <div className="space-y-2">
                                {dayEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-blue-50 border border-blue-200 rounded-md p-3 hover:bg-blue-100 transition-colors"
                                    >
                                        {CustomEventComponent ? (
                                            <CustomEventComponent {...event} />
                                        ) : (
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">
                                                            {event.title}
                                                        </h4>
                                                        {event.description && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {format(new Date(event.startDate), "HH:mm")} -{" "}
                                                        {format(new Date(event.endDate), "HH:mm")}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
