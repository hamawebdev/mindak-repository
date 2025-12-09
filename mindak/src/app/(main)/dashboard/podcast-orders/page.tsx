"use client";

import { PodcastScheduler } from "./_components/podcast-scheduler";

export default function PodcastOrdersPage() {
    return (
        <div className="@container/main h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Podcast Orders</h1>
                <p className="text-muted-foreground">
                    Manage pending requests and confirmed reservations.
                </p>
            </div>
            <div className="flex-1 min-h-0">
                <PodcastScheduler />
            </div>
        </div>
    );
}
