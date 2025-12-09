"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
    getAvailabilityForDate,
    getAvailablePacks,
    type DayAvailability,
} from "@/lib/api/admin";
import type { PackOffer } from "@/types/admin-api";
import { format } from "date-fns";

export function AvailabilityPreview() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedPack, setSelectedPack] = useState<string>("");
    const [packs, setPacks] = useState<PackOffer[]>([]);
    const [availability, setAvailability] = useState<DayAvailability | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPacks();
    }, []);

    useEffect(() => {
        if (selectedDate && selectedPack) {
            loadAvailability();
        }
    }, [selectedDate, selectedPack]);

    const loadPacks = async () => {
        try {
            const data = await getAvailablePacks();
            setPacks(data);
            if (data.length > 0) {
                setSelectedPack(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load packs:", error);
            toast.error("Failed to load pack options");
        }
    };

    const loadAvailability = async () => {
        if (!selectedDate || !selectedPack) return;

        try {
            setLoading(true);
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const data = await getAvailabilityForDate(dateStr, selectedPack);
            setAvailability(data);
        } catch (error) {
            console.error("Failed to load availability:", error);
            toast.error("Failed to load availability");
            setAvailability(null);
        } finally {
            setLoading(false);
        }
    };

    const selectedPackData = packs.find((p) => p.id === selectedPack);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Availability Preview</h2>
                <p className="text-muted-foreground">
                    See how your configuration affects available booking slots
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Date and Pack Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Select Date & Package
                        </CardTitle>
                        <CardDescription>Choose a date and package to preview availability</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Package</label>
                            <Select value={selectedPack} onValueChange={setSelectedPack}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packs.map((pack) => (
                                        <SelectItem key={pack.id} value={pack.id}>
                                            {pack.name} ({pack.durationMin} min)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedPackData && (
                                <p className="text-sm text-muted-foreground">
                                    Duration: {selectedPackData.durationMin} minutes (
                                    {selectedPackData.durationMin / 60}h)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                className="rounded-md border"
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Available Slots */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Available Time Slots
                        </CardTitle>
                        <CardDescription>
                            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : availability ? (
                            <div className="space-y-4">
                                {/* Available Slots */}
                                {availability.availableSlots.length > 0 ? (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Available ({availability.availableSlots.length})
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {availability.availableSlots.map((slot, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-3 py-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-300"
                                                >
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No available slots</p>
                                    </div>
                                )}

                                {/* Unavailable Slots */}
                                {availability.unavailableSlots.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Unavailable ({availability.unavailableSlots.length})
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {availability.unavailableSlots.map((slot, idx) => (
                                                <div
                                                    key={idx}
                                                    className="px-3 py-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-300"
                                                >
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Select a date and package to view availability</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Summary Stats */}
            {availability && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {availability.availableSlots.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Available Slots</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {availability.unavailableSlots.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Booked Slots</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {availability.availableSlots.length + availability.unavailableSlots.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Slots</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
