"use client";

import { SchedulerProvider } from "@/providers/schedular-provider";
import SchedulerViewFilteration from "./schedular-view-filteration";

export default function SchedulerView() {
  return (
    <SchedulerProvider>
      <div className="flex flex-col gap-6">
        <SchedulerViewFilteration />
      </div>
    </SchedulerProvider>
  );
}
