"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Clock, Save, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import {
    getAvailabilityConfig,
    updateAvailabilityConfig,
    type BusinessHours,
    type AvailabilityConfig,
} from "@/lib/api/admin";

const DAYS_OF_WEEK = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
] as const;

type DayKey = keyof BusinessHours;

export function AvailabilityEditor() {
    const [config, setConfig] = useState<AvailabilityConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await getAvailabilityConfig();
            setConfig(data);
        } catch (error) {
            console.error("Failed to load availability config:", error);
            toast.error("Failed to load availability configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        try {
            setSaving(true);
            await updateAvailabilityConfig({
                timezone: config.timezone,
                businessHours: config.businessHours,
                slotDurationMin: config.slotDurationMin,
                advanceBookingDays: config.advanceBookingDays,
                minimumNoticeDays: config.minimumNoticeDays,
            });
            toast.success("Availability configuration updated successfully");
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to update availability config:", error);
            toast.error("Failed to update availability configuration");
        } finally {
            setSaving(false);
        }
    };

    const toggleDayEnabled = (day: DayKey) => {
        if (!config) return;

        const newBusinessHours = { ...config.businessHours };
        if (newBusinessHours[day]) {
            newBusinessHours[day] = null;
        } else {
            newBusinessHours[day] = { start: "09:00", end: "18:00" };
        }

        setConfig({ ...config, businessHours: newBusinessHours });
        setHasChanges(true);
    };

    const updateDayHours = (day: DayKey, field: "start" | "end", value: string) => {
        if (!config || !config.businessHours[day]) return;

        const newBusinessHours = { ...config.businessHours };
        newBusinessHours[day] = {
            ...newBusinessHours[day]!,
            [field]: value,
        };

        setConfig({ ...config, businessHours: newBusinessHours });
        setHasChanges(true);
    };

    const updateConstraint = (field: keyof AvailabilityConfig, value: number) => {
        if (!config) return;
        setConfig({ ...config, [field]: value });
        setHasChanges(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load configuration</p>
                    <Button onClick={loadConfig} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Availability Settings</h2>
                    <p className="text-muted-foreground">
                        Configure business hours and booking constraints
                    </p>
                </div>
                <Button onClick={handleSave} disabled={!hasChanges || saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="hours" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="hours">
                        <Clock className="h-4 w-4 mr-2" />
                        Business Hours
                    </TabsTrigger>
                    <TabsTrigger value="constraints">
                        <Calendar className="h-4 w-4 mr-2" />
                        Booking Constraints
                    </TabsTrigger>
                </TabsList>

                {/* Business Hours Tab */}
                <TabsContent value="hours" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>
                                Set your studio's operating hours for each day of the week
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {DAYS_OF_WEEK.map(({ key, label }) => {
                                const dayHours = config.businessHours[key];
                                const isEnabled = dayHours !== null;

                                return (
                                    <div
                                        key={key}
                                        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                                    >
                                        <div className="flex items-center space-x-2 min-w-[140px]">
                                            <Switch
                                                checked={isEnabled}
                                                onCheckedChange={() => toggleDayEnabled(key)}
                                            />
                                            <Label className="font-medium">{label}</Label>
                                        </div>

                                        {isEnabled && dayHours ? (
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-sm text-muted-foreground">From</Label>
                                                    <Input
                                                        type="time"
                                                        value={dayHours.start}
                                                        onChange={(e) => updateDayHours(key, "start", e.target.value)}
                                                        className="w-32"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-sm text-muted-foreground">To</Label>
                                                    <Input
                                                        type="time"
                                                        value={dayHours.end}
                                                        onChange={(e) => updateDayHours(key, "end", e.target.value)}
                                                        className="w-32"
                                                    />
                                                </div>
                                                <div className="text-sm text-muted-foreground ml-auto">
                                                    {calculateDuration(dayHours.start, dayHours.end)} hours
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic">Closed</div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Booking Constraints Tab */}
                <TabsContent value="constraints" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Rules</CardTitle>
                            <CardDescription>
                                Configure how far in advance clients can book and minimum notice requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input
                                    id="timezone"
                                    value={config.timezone}
                                    onChange={(e) => {
                                        setConfig({ ...config, timezone: e.target.value });
                                        setHasChanges(true);
                                    }}
                                    placeholder="Europe/Paris"
                                />
                                <p className="text-sm text-muted-foreground">
                                    IANA timezone identifier (e.g., Europe/Paris, America/New_York)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slotDuration">Minimum Slot Duration (minutes)</Label>
                                <Input
                                    id="slotDuration"
                                    type="number"
                                    min="30"
                                    step="30"
                                    value={config.slotDurationMin}
                                    onChange={(e) =>
                                        updateConstraint("slotDurationMin", parseInt(e.target.value))
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    Minimum duration for each booking slot (typically 60 minutes)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="advanceBooking">Maximum Advance Booking (days)</Label>
                                <Input
                                    id="advanceBooking"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={config.advanceBookingDays}
                                    onChange={(e) =>
                                        updateConstraint("advanceBookingDays", parseInt(e.target.value))
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    How far in advance clients can book (e.g., 90 days)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minimumNotice">Minimum Notice Required (days)</Label>
                                <Input
                                    id="minimumNotice"
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={config.minimumNoticeDays}
                                    onChange={(e) =>
                                        updateConstraint("minimumNoticeDays", parseInt(e.target.value))
                                    }
                                />
                                <p className="text-sm text-muted-foreground">
                                    Minimum days notice required before a booking (e.g., 2 days)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Card */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                Current Configuration Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Timezone:</span>
                                <span className="font-medium">{config.timezone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Slot Duration:</span>
                                <span className="font-medium">{config.slotDurationMin} minutes</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Advance Booking:</span>
                                <span className="font-medium">{config.advanceBookingDays} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Minimum Notice:</span>
                                <span className="font-medium">{config.minimumNoticeDays} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Open Days:</span>
                                <span className="font-medium">
                                    {Object.values(config.businessHours).filter((h) => h !== null).length} / 7
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6 bg-background border shadow-lg rounded-lg p-4 flex items-center gap-4">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div>
                        <p className="font-medium">You have unsaved changes</p>
                        <p className="text-sm text-muted-foreground">
                            Don't forget to save your configuration
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        Save Now
                    </Button>
                </div>
            )}
        </div>
    );
}

// Helper function to calculate duration between two times
function calculateDuration(start: string, end: string): number {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.round((endMinutes - startMinutes) / 60 * 10) / 10;
}
