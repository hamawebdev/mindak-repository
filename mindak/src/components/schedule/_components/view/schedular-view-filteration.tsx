"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CalendarDaysIcon } from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek, BsCalendar2 } from "react-icons/bs";

import AddEventModal from "../../_modals/add-event-modal";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import YearView from "./year/year-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views, Event } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";

// Animation settings for Framer Motion
const animationConfig = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, type: "spring" as const, stiffness: 250 },
};

export default function SchedulerViewFilteration({
    views = {
        views: ["day", "week", "month"],
        mobileViews: ["day"],
    },
    stopDayEventSummary = false,
    CustomComponents,
    classNames,
    onAddEventClick,
    currentDate,
    onDateChange,
    activeView: propActiveView,
    onViewChange,
}: {
    views?: Views;
    stopDayEventSummary?: boolean;
    CustomComponents?: CustomComponents;
    classNames?: ClassNames;
    onAddEventClick?: (event?: Partial<Event>) => void;
    currentDate?: Date;
    onDateChange?: (date: Date) => void;
    activeView?: string;
    onViewChange?: (view: string) => void;
}) {
    const { setOpen } = useModal();
    const [internalActiveView, setInternalActiveView] = useState<string>("day");
    const [clientSide, setClientSide] = useState(false);

    const activeView = propActiveView || internalActiveView;

    const handleViewChange = (view: string) => {
        if (onViewChange) {
            onViewChange(view);
        } else {
            setInternalActiveView(view);
        }
    };

    useEffect(() => {
        setClientSide(true);
    }, []);

    const [isMobile, setIsMobile] = useState(
        clientSide ? window.innerWidth <= 768 : false
    );

    useEffect(() => {
        if (!clientSide) return;
        setIsMobile(window.innerWidth <= 768);
        function handleResize() {
            if (window && window.innerWidth <= 768) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        }

        window && window.addEventListener("resize", handleResize);

        return () => window && window.removeEventListener("resize", handleResize);
    }, [clientSide]);

    function handleAddEvent(selectedDay?: number) {
        // Create the modal content with proper data
        const startDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            selectedDay ?? new Date().getDate(),
            0,
            0,
            0,
            0
        );

        const endDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            selectedDay ?? new Date().getDate(),
            23,
            59,
            59,
            999
        );

        if (onAddEventClick) {
            onAddEventClick({ startDate, endDate });
            return;
        }

        // Create a wrapper component to handle data passing
        const ModalWrapper = () => {
            const title =
                CustomComponents?.CustomEventModal?.CustomAddEventModal?.title ||
                "Add Event";

            return (
                <div>
                    <h2 className="text-xl font-semibold mb-4">{title}</h2>
                </div>
            );
        };

        // Open the modal with the content
        setOpen(
            <CustomModal title="Add Event">
                <AddEventModal
                    CustomAddEventModal={
                        CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm
                    }
                />{" "}
            </CustomModal>
        );
    }

    const viewsSelector = isMobile ? views?.mobileViews : views?.views;

    // Set initial active view
    useEffect(() => {
        if (viewsSelector?.length) {
            handleViewChange(viewsSelector[0]);
        }
    }, []);

    return (
        <div className="flex w-full flex-col">
            <div className="flex w-full">
                <div className="dayly-weekly-monthly-selection relative w-full">
                    <Tabs
                        value={activeView}
                        onValueChange={handleViewChange}
                        className={cn("w-full", classNames?.tabs)}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <TabsList className={cn(
                                "grid",
                                viewsSelector?.length === 4 && "grid-cols-4",
                                viewsSelector?.length === 3 && "grid-cols-3",
                                viewsSelector?.length === 2 && "grid-cols-2",
                                viewsSelector?.length === 1 && "grid-cols-1"
                            )}>
                                {viewsSelector?.includes("day") && (
                                    <TabsTrigger value="day">
                                        {CustomComponents?.customTabs?.CustomDayTab ? (
                                            CustomComponents.customTabs.CustomDayTab
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <CalendarDaysIcon size={15} />
                                                <span>Day</span>
                                            </div>
                                        )}
                                    </TabsTrigger>
                                )}

                                {viewsSelector?.includes("week") && (
                                    <TabsTrigger value="week">
                                        {CustomComponents?.customTabs?.CustomWeekTab ? (
                                            CustomComponents.customTabs.CustomWeekTab
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <BsCalendarWeek />
                                                <span>Week</span>
                                            </div>
                                        )}
                                    </TabsTrigger>
                                )}

                                {viewsSelector?.includes("month") && (
                                    <TabsTrigger value="month">
                                        {CustomComponents?.customTabs?.CustomMonthTab ? (
                                            CustomComponents.customTabs.CustomMonthTab
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <BsCalendarMonth />
                                                <span>Month</span>
                                            </div>
                                        )}
                                    </TabsTrigger>
                                )}

                                {viewsSelector?.includes("year") && (
                                    <TabsTrigger value="year">
                                        {CustomComponents?.customTabs?.CustomYearTab ? (
                                            CustomComponents.customTabs.CustomYearTab
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <BsCalendar2 size={15} />
                                                <span>Year</span>
                                            </div>
                                        )}
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {/* Add Event Button */}
                            {CustomComponents?.customButtons?.CustomAddEventButton ? (
                                <div onClick={() => handleAddEvent()}>
                                    {CustomComponents?.customButtons.CustomAddEventButton}
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleAddEvent()}
                                    className={classNames?.buttons?.addEvent}
                                    variant="default"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Add Event
                                </Button>
                            )}
                        </div>

                        {viewsSelector?.includes("day") && (
                            <TabsContent value="day">
                                <AnimatePresence mode="wait">
                                    <motion.div {...animationConfig}>
                                        <DailyView
                                            stopDayEventSummary={stopDayEventSummary}
                                            classNames={classNames?.buttons}
                                            prevButton={
                                                CustomComponents?.customButtons?.CustomPrevButton
                                            }
                                            nextButton={
                                                CustomComponents?.customButtons?.CustomNextButton
                                            }
                                            CustomEventComponent={
                                                CustomComponents?.CustomEventComponent
                                            }
                                            CustomEventModal={CustomComponents?.CustomEventModal}
                                            onAddEventClick={onAddEventClick}
                                            currentDate={currentDate}
                                            onDateChange={onDateChange}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </TabsContent>
                        )}

                        {viewsSelector?.includes("week") && (
                            <TabsContent value="week">
                                <AnimatePresence mode="wait">
                                    <motion.div {...animationConfig}>
                                        <WeeklyView
                                            classNames={classNames?.buttons}
                                            prevButton={
                                                CustomComponents?.customButtons?.CustomPrevButton
                                            }
                                            nextButton={
                                                CustomComponents?.customButtons?.CustomNextButton
                                            }
                                            CustomEventComponent={
                                                CustomComponents?.CustomEventComponent
                                            }
                                            CustomEventModal={CustomComponents?.CustomEventModal}
                                            onAddEventClick={onAddEventClick}
                                            currentDate={currentDate}
                                            onDateChange={onDateChange}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </TabsContent>
                        )}

                        {viewsSelector?.includes("month") && (
                            <TabsContent value="month">
                                <AnimatePresence mode="wait">
                                    <motion.div {...animationConfig}>
                                        <MonthView
                                            classNames={classNames?.buttons}
                                            prevButton={
                                                CustomComponents?.customButtons?.CustomPrevButton
                                            }
                                            nextButton={
                                                CustomComponents?.customButtons?.CustomNextButton
                                            }
                                            CustomEventComponent={
                                                CustomComponents?.CustomEventComponent
                                            }
                                            CustomEventModal={CustomComponents?.CustomEventModal}
                                            onAddEventClick={onAddEventClick}
                                            currentDate={currentDate}
                                            onDateChange={onDateChange}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </TabsContent>
                        )}

                        {viewsSelector?.includes("year") && (
                            <TabsContent value="year">
                                <AnimatePresence mode="wait">
                                    <motion.div {...animationConfig}>
                                        <YearView
                                            classNames={classNames?.buttons}
                                            prevButton={
                                                CustomComponents?.customButtons?.CustomPrevButton
                                            }
                                            nextButton={
                                                CustomComponents?.customButtons?.CustomNextButton
                                            }
                                            CustomEventComponent={
                                                CustomComponents?.CustomEventComponent
                                            }
                                            CustomEventModal={CustomComponents?.CustomEventModal}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
