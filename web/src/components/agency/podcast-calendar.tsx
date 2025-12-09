"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Sun, Sunset } from "lucide-react";
import { TimeSlot } from "@/lib/api/client/podcast";

interface PodcastCalendarProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    selectedTime: string | undefined;
    onTimeSelect: (time: string) => void;
    availability: TimeSlot[];
    loadingAvailability: boolean;
}

export function PodcastCalendar({
    selectedDate,
    onDateSelect,
    selectedTime,
    onTimeSelect,
    availability,
    loadingAvailability,
}: PodcastCalendarProps) {

    // State for controlling the displayed month
    const [month, setMonth] = React.useState<Date>(() =>
        selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
    );

    // Ref for time selection section
    const timeSelectionRef = React.useRef<HTMLDivElement>(null);

    // Update month when selectedDate changes
    React.useEffect(() => {
        if (selectedDate) {
            setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        }
    }, [selectedDate]);

    // Group time slots by period
    const timeSlots = React.useMemo(() => {
        const morning: TimeSlot[] = [];
        const afternoon: TimeSlot[] = [];
        const evening: TimeSlot[] = [];

        availability.forEach((slot) => {
            const hour = parseInt(slot.startTime.split(":")[0]);
            if (hour < 12) {
                morning.push(slot);
            } else if (hour < 17) {
                afternoon.push(slot);
            } else {
                evening.push(slot);
            }
        });

        return { morning, afternoon, evening };
    }, [availability]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
            {/* Column 1: Map */}
            <div className="flex flex-col h-full order-3 lg:order-1">
                <div className="relative w-full h-full min-h-[400px] rounded-[2rem] overflow-hidden border border-white/10 bg-[#1a1a1a] group">
                    {/* Embedded Google Maps for Mindak Agency location */}
                    <div className="absolute inset-0 bg-[#e5e5e5]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.5657706159404!2d3.0005304755454314!3d36.732988671485806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fafac2188a261%3A0xc4b21187c43ad957!2sMindak%20agency!5e0!3m2!1sen!2sdz!4v1765026986375!5m2!1sen!2sdz"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: "grayscale(1) contrast(1.2) opacity(0.7)" }}
                            allowFullScreen={false}
                            loading="lazy"
                            className="opacity-80 hover:opacity-100 transition-opacity duration-500"
                        />
                    </div>

                    {/* Pin Marker Overlay (Simulated) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute inset-0 opacity-75"></div>
                            <MapPin className="w-8 h-8 text-red-600 relative z-10 drop-shadow-lg" fill="currentColor" />
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-black">Mindak agency</p>
                                <p className="text-xs text-gray-500">Professional Studio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2: Calendar */}
            <div className="flex flex-col h-full order-1 lg:order-2">
                <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/10 h-full min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            onDateSelect(date);
                            // Auto-scroll to time selection on mobile
                            if (typeof window !== 'undefined' && window.innerWidth < 1024 && timeSelectionRef.current) {
                                timeSelectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                        month={month}
                        onMonthChange={setMonth}
                        className="w-full max-w-[480px] bg-transparent p-0 [--cell-size:3rem]"
                        classNames={{
                            months: "flex flex-col w-full",
                            month: "space-y-4 w-full flex flex-col",
                            caption: "flex justify-center pt-1 relative items-center mb-6",
                            caption_label: "text-2xl font-bold text-white whitespace-nowrap",
                            nav: "hidden",
                            nav_button: "hidden",
                            nav_button_previous: "hidden",
                            nav_button_next: "hidden",
                            table: "w-full border-collapse",
                            head_row: "flex justify-between mb-3",
                            head_cell: "text-white/40 rounded-md w-12 font-normal text-sm uppercase tracking-wider",
                            row: "flex w-full mt-2 justify-between",
                            cell: "h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20 group",
                            day: "h-12 w-12 p-0 font-medium aria-selected:opacity-100 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all text-sm group-data-[today=true]:!text-black hover:group-data-[today=true]:!text-black",
                            day_selected: "text-black hover:text-black font-bold shadow-[0_0_15px_rgba(113,255,123,0.4)]",
                            day_today: "data-[selected=false]:bg-white !text-black hover:!text-black",
                            day_outside: "text-white/20 opacity-30",
                            day_disabled: "text-white/20 opacity-30",
                            day_hidden: "invisible",
                        }}
                    />
                    {/* Navigation arrows below calendar */}
                    <div className="flex items-center justify-center gap-4 mt-6 w-full">
                        <button
                            onClick={() => {
                                const newMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
                                setMonth(newMonth);
                                onDateSelect(undefined);
                            }}
                            className="h-10 w-10 bg-white/5 hover:bg-white/10 p-0 text-white rounded-full transition-all flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                const newMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
                                setMonth(newMonth);
                                onDateSelect(undefined);
                            }}
                            className="h-10 w-10 bg-white/5 hover:bg-white/10 p-0 text-white rounded-full transition-all flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Column 3: Time Selection */}
            <div ref={timeSelectionRef} className="flex flex-col h-full order-2 lg:order-3">
                <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/10 h-full min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="mb-4 shrink-0">
                        <h3 className="text-2xl font-bold text-white">Select time:</h3>
                    </div>
                    {!selectedDate ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-white/40 text-center p-8">
                            <Clock className="w-12 h-12 mb-4 opacity-30 font-thin" />
                            <p className="text-lg font-light">Please select a date first</p>
                        </div>
                    ) : loadingAvailability ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-white/40">
                            <div className="w-8 h-8 border-2 border-[#71ff7b] border-t-transparent rounded-full animate-spin mb-4" />
                            <p>Checking availability...</p>
                        </div>
                    ) : availability.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-white/40 text-center p-8">
                            <p>No slots available for this date</p>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {/* Morning */}
                            {timeSlots.morning.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider font-medium">
                                        <Sun className="w-4 h-4" />
                                        Morning
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {timeSlots.morning.map((slot) => (
                                            <TimeSlotButton
                                                key={slot.startTime}
                                                slot={slot}
                                                isSelected={selectedTime === slot.startTime}
                                                onClick={() => onTimeSelect(slot.startTime)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Afternoon */}
                            {timeSlots.afternoon.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider font-medium">
                                        <Sun className="w-4 h-4" />
                                        Afternoon
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {timeSlots.afternoon.map((slot) => (
                                            <TimeSlotButton
                                                key={slot.startTime}
                                                slot={slot}
                                                isSelected={selectedTime === slot.startTime}
                                                onClick={() => onTimeSelect(slot.startTime)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Evening */}
                            {timeSlots.evening.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider font-medium">
                                        <Sunset className="w-4 h-4" />
                                        Evening
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {timeSlots.evening.map((slot) => (
                                            <TimeSlotButton
                                                key={slot.startTime}
                                                slot={slot}
                                                isSelected={selectedTime === slot.startTime}
                                                onClick={() => onTimeSelect(slot.startTime)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TimeSlotButton({
    slot,
    isSelected,
    onClick
}: {
    slot: TimeSlot;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border",
                isSelected
                    ? "bg-gradient-primary text-black border-transparent shadow-[0_0_15px_rgba(113,255,123,0.4)] scale-[1.02]"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
            )}
        >
            {slot.startTime}
        </button>
    );
}
