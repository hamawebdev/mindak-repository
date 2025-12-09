"use client";

import * as React from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { Loader2, RefreshCw, ArrowLeft, Calendar, Settings, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SchedulerProvider } from "@/providers/schedular-provider";
import SchedulerViewFilteration from "@/components/schedule/_components/view/schedular-view-filteration";
import { CreateReservationForm } from "./create-reservation-form";
import { PodcastEventComponent } from "./podcast-event-component";
import { ReservationDetailsModal } from "./reservation-details-modal";
import { AvailabilityEditor } from "./availability-editor";
import { AvailabilityPreview } from "./availability-preview";
import { useModal } from "@/providers/modal-context";
import {
    getConfirmedPodcastCalendar,
    getPendingPodcastCalendar,
    updatePodcastReservationSchedule
} from "@/lib/api/admin/podcast-reservations";
import type { PodcastReservation } from "@/types/admin-api";
import type { Event } from "@/types/index";
import { useToast } from "@/hooks/use-toast";

export function PodcastScheduler() {
    const { toast } = useToast();
    const { setOpen } = useModal();
    const [activeTab, setActiveTab] = React.useState("calendar");
    const [viewType, setViewType] = React.useState<"confirmed" | "pending">("confirmed");
    const [activeView, setActiveView] = React.useState<string>("day");
    const [isLoading, setIsLoading] = React.useState(false);
    const [reservations, setReservations] = React.useState<PodcastReservation[]>([]);
    const [events, setEvents] = React.useState<Event[]>([]);
    const [isCreating, setIsCreating] = React.useState(false);
    const [createData, setCreateData] = React.useState<any>(null);

    const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

    // Helper to transform API reservation to Scheduler Event
    const transformReservationToEvent = (res: PodcastReservation, type: "confirmed" | "pending"): Event => {
        // Use calendarStart/End if available (from calendar endpoints), otherwise startAt/endAt
        const startDate = res.calendarStart ? new Date(res.calendarStart) : new Date(res.startAt);
        const endDate = res.calendarEnd ? new Date(res.calendarEnd) : new Date(res.endAt);

        return {
            id: res.id,
            title: res.customerName,
            description: type === "pending" ? "Pending Confirmation" : undefined,
            startDate,
            endDate,
            variant: type === "pending" ? "warning" : "success", // Yellow for pending, Green for confirmed
        };
    };

    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            let data: PodcastReservation[] = [];

            if (activeView === "week") {
                // Fetch for the whole week
                const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
                const end = endOfWeek(currentDate, { weekStartsOn: 1 });
                const days = eachDayOfInterval({ start, end });

                const promises = days.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    return viewType === "confirmed"
                        ? getConfirmedPodcastCalendar(dateStr)
                        : getPendingPodcastCalendar(dateStr);
                });

                const results = await Promise.all(promises);
                data = results.flat();
            } else {
                // Fetch for single day (or default for month if we decide later)
                // For now, day view uses single day
                const dateStr = format(currentDate, "yyyy-MM-dd");
                if (viewType === "confirmed") {
                    data = await getConfirmedPodcastCalendar(dateStr);
                } else {
                    data = await getPendingPodcastCalendar(dateStr);
                }
            }

            if (data && Array.isArray(data)) {
                // Remove duplicates if any (though shouldn't be with day-by-day fetching)
                const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
                setReservations(uniqueData);
                setEvents(uniqueData.map(r => transformReservationToEvent(r, viewType)));
            } else {
                setReservations([]);
                setEvents([]);
            }
        } catch (error) {
            console.error("Failed to fetch calendar data:", error);
            toast({
                title: "Error",
                description: "Failed to load calendar data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [viewType, toast, currentDate, activeView]);

    React.useEffect(() => {
        if (activeTab === "calendar") {
            fetchData();
        }
    }, [activeTab, fetchData]);

    const handleDateChange = (date: Date) => {
        setCurrentDate(date);
    };

    const handleEventClick = (event: Event) => {
        setOpen(
            <div className="max-w-4xl w-full mx-auto bg-background rounded-lg overflow-hidden">
                <ReservationDetailsModal
                    reservationId={event.id}
                    onClose={() => {
                        fetchData(); // Refresh after closing to reflect changes
                    }}
                />
            </div>
        );
    };

    const handleUpdateEvent = async (event: Event) => {
        // Optimistic update is handled by the SchedulerProvider locally, 
        // but we need to validate and call API

        // Validation: Minutes must be 0
        if (event.startDate.getMinutes() !== 0 || event.endDate.getMinutes() !== 0) {
            toast({
                title: "Invalid Time",
                description: "Reservations must start and end on the hour (e.g. 10:00).",
                variant: "destructive",
            });
            fetchData(); // Revert
            return;
        }

        // Validation: Duration must be whole hours
        const durationMs = event.endDate.getTime() - event.startDate.getTime();
        const hours = durationMs / (1000 * 60 * 60);
        if (hours % 1 !== 0) {
            toast({
                title: "Invalid Duration",
                description: "Duration must be in whole hours.",
                variant: "destructive",
            });
            fetchData(); // Revert
            return;
        }

        try {
            await updatePodcastReservationSchedule(event.id, {
                startAt: event.startDate.toISOString(),
                endAt: event.endDate.toISOString(),
                keepStatus: true,
            });

            toast({
                title: "Success",
                description: "Reservation rescheduled.",
            });

            // Refresh to ensure sync
            fetchData();
        } catch (error) {
            console.error(error);
            toast({
                title: "Update Failed",
                description: "Could not update reservation schedule.",
                variant: "destructive",
            });
            fetchData(); // Revert
        }
    };

    const handleAddEvent = (event: Event) => {
        // This is called by the Scheduler when it adds an event locally
        // We don't strictly need this if we rely on the Modal form to create via API 
        // and then refresh.
    };

    const handleAddEventClick = (event?: Partial<Event>) => {
        setCreateData(event);
        setIsCreating(true);
    };

    if (isCreating) {
        return (
            <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center border-b pb-4">
                    <Button variant="ghost" onClick={() => setIsCreating(false)} className="mr-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h2 className="text-xl font-semibold">New Reservation</h2>
                </div>
                <div className="flex-1 overflow-auto">
                    <CreateReservationForm
                        initialData={createData}
                        onSuccess={() => {
                            setIsCreating(false);
                            fetchData();
                        }}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                </TabsTrigger>
                <TabsTrigger value="availability">
                    <Settings className="h-4 w-4 mr-2" />
                    Availability
                </TabsTrigger>
                <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <ToggleGroup type="single" value={viewType} onValueChange={(val) => val && setViewType(val as any)}>
                            <ToggleGroupItem value="confirmed" aria-label="Confirmed Reservations">
                                Confirmed
                            </ToggleGroupItem>
                            <ToggleGroupItem value="pending" aria-label="Pending Reservations">
                                Pending
                            </ToggleGroupItem>
                        </ToggleGroup>
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchData}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <div className="h-[800px] rounded-md p-4">
                    <SchedulerProvider
                        initialState={events}
                        onUpdateEvent={handleUpdateEvent}
                        onAddEvent={handleAddEvent}
                        weekStartsOn="monday"
                    >
                        <SchedulerViewFilteration
                            views={{
                                views: ["day", "week", "month"],
                                mobileViews: ["day"],
                            }}
                            onAddEventClick={handleAddEventClick}
                            currentDate={currentDate}
                            onDateChange={handleDateChange}
                            activeView={activeView}
                            onViewChange={setActiveView}
                            CustomComponents={{
                                CustomEventComponent: (props) => (
                                    <PodcastEventComponent
                                        {...props}
                                        onClick={() => handleEventClick(props)}
                                    />
                                ),
                                // CustomEventModal is no longer used for adding events
                            }}
                        />
                    </SchedulerProvider>
                </div>
            </TabsContent>

            <TabsContent value="availability" className="flex-1">
                <AvailabilityEditor />
            </TabsContent>

            <TabsContent value="preview" className="flex-1">
                <AvailabilityPreview />
            </TabsContent>
        </Tabs>
    );
}
