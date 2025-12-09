"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  addPodcastReservationNote,
  deletePodcastReservation,
  getPodcastReservationDetails,
  updatePodcastReservationStatus,
} from "@/lib/api/admin/podcast-reservations";
import type { PodcastReservationDetailsResponse, ReservationStatus } from "@/types/admin-api";
import { useModal } from "@/providers/modal-context";

interface ReservationDetailsModalProps {
  reservationId: string;
  onClose?: () => void;
}

const statusVariants: Record<
  ReservationStatus,
  { 
    variant: "default" | "secondary" | "destructive" | "outline"; 
    label: string;
    bgClass: string;
    textClass: string;
  }
> = {
  pending: { 
    variant: "outline", 
    label: "Pending",
    bgClass: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
    textClass: "text-amber-700 dark:text-amber-400"
  },
  confirmed: { 
    variant: "secondary", 
    label: "Confirmed",
    bgClass: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
    textClass: "text-blue-700 dark:text-blue-400"
  },
  completed: { 
    variant: "default", 
    label: "Completed",
    bgClass: "bg-green-500/10 hover:bg-green-500/20 border-green-500/30",
    textClass: "text-green-700 dark:text-green-400"
  },
  cancelled: { 
    variant: "destructive", 
    label: "Cancelled",
    bgClass: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30",
    textClass: "text-red-700 dark:text-red-400"
  },
};

export function ReservationDetailsModal({ reservationId, onClose }: ReservationDetailsModalProps) {
  const { setClose } = useModal();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<PodcastReservationDetailsResponse | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleClose = () => {
      if (onClose) onClose();
      setClose();
  };

  const fetchDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPodcastReservationDetails(reservationId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reservation details");
      console.error("Error fetching podcast reservation details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  React.useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    try {
      setIsUpdatingStatus(true);
      await updatePodcastReservationStatus(reservationId, { status: newStatus });
      await fetchDetails();
    } catch (err) {
      console.error("Error updating status:", err);
      // Use toast in a real app
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      await addPodcastReservationNote(reservationId, { noteText: newNote });
      setNewNote("");
      await fetchDetails();
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePodcastReservation(reservationId);
      handleClose();
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading details...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <h3 className="font-semibold text-destructive">Error</h3>
        <p className="mt-2 text-muted-foreground">{error || "Reservation not found"}</p>
        <Button variant="outline" className="mt-4" onClick={handleClose}>Close</Button>
      </div>
    );
  }

  const { reservation, statusHistory, notes } = data;
  const { bgClass, textClass } = statusVariants[reservation.status];

  // We need to cast the reservation object carefully or ensure the types match
  // The details response might have different fields than the scheduler event
  // Assuming PodcastReservationDetailsResponse matches the API spec I analyzed earlier

  return (
    <div className="flex flex-col h-[80vh] max-h-[800px] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
            <div>
                <h2 className="text-xl font-semibold">Reservation Details</h2>
                <p className="text-sm text-muted-foreground">{reservation.confirmationId}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                    <Package className="size-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Current Status</p>
                        <Badge className={bgClass + ' ' + textClass + ' mt-1'}>
                            {statusVariants[reservation.status].label}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <Select
                        value={reservation.status}
                        onValueChange={(val) => handleStatusChange(val as ReservationStatus)}
                        disabled={isUpdatingStatus}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid gap-1">
                            <p className="text-muted-foreground text-xs">Name</p>
                            <p className="font-medium">{reservation.customer.name}</p>
                        </div>
                        <div className="grid gap-1">
                            <p className="text-muted-foreground text-xs">Email</p>
                            <a href={`mailto:${reservation.customer.email}`} className="text-primary hover:underline">{reservation.customer.email}</a>
                        </div>
                        {reservation.customer.phone && (
                             <div className="grid gap-1">
                                <p className="text-muted-foreground text-xs">Phone</p>
                                <p>{reservation.customer.phone}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                 {/* Reservation Info */}
                 <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Reservation Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid gap-1">
                            <p className="text-muted-foreground text-xs">Time Slot</p>
                            <p className="font-medium">
                                {reservation.startAt ? format(new Date(reservation.startAt), "MMM dd, yyyy") : "N/A"}
                            </p>
                            <p>
                                {reservation.startAt ? format(new Date(reservation.startAt), "h:mm a") : ""} - {reservation.endAt ? format(new Date(reservation.endAt), "h:mm a") : ""}
                            </p>
                        </div>
                        {reservation.decor && (
                            <div className="grid gap-1">
                                <p className="text-muted-foreground text-xs">Decor</p>
                                <p>{reservation.decor.name}</p>
                            </div>
                        )}
                         {reservation.packOffer && (
                            <div className="grid gap-1">
                                <p className="text-muted-foreground text-xs">Pack</p>
                                <p>{reservation.packOffer.name}</p>
                            </div>
                        )}
                         {reservation.supplements && reservation.supplements.length > 0 && (
                            <div className="grid gap-1">
                                <p className="text-muted-foreground text-xs">Supplements</p>
                                <ul className="list-disc list-inside">
                                    {reservation.supplements.map(s => (
                                        <li key={s.id}>{s.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Form Answers */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Questionnaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {reservation.clientAnswers.map(a => (
                         <div key={a.questionId} className="flex flex-col">
                             <span className="text-muted-foreground font-medium">{a.questionText}</span>
                             <span>{a.answerText || a.value}</span>
                         </div>
                     ))}
                </CardContent>
            </Card>

             {/* Notes */}
             <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="size-4" />
                        Admin Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notes.length > 0 ? (
                        <div className="space-y-3">
                            {notes.map((note) => (
                                <div key={note.id} className="bg-muted/50 p-3 rounded-md text-sm">
                                    <p>{note.noteText}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(note.createdAt), "MMM dd h:mm a")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No notes added.</p>
                    )}
                    <div className="flex gap-2">
                        <Textarea 
                            placeholder="Add internal note..." 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || isAddingNote}>
                        {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Note
                    </Button>
                </CardContent>
            </Card>

            {/* Status History */}
             <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">History</h3>
                <div className="border rounded-lg bg-background">
                     {statusHistory.map((item, i) => (
                         <div key={item.id} className={`flex items-center gap-2 p-3 text-sm ${i !== statusHistory.length - 1 ? 'border-b' : ''}`}>
                             <Badge variant="outline" className="text-xs">{item.newStatus}</Badge>
                             <span className="text-muted-foreground text-xs">
                                 {format(new Date(item.changedAt), "MMM dd h:mm a")}
                             </span>
                             {item.notes && <span className="text-muted-foreground text-xs">- {item.notes}</span>}
                         </div>
                     ))}
                </div>
            </div>
        </div>

        <div className="border-t p-4 bg-muted/10 flex justify-between items-center">
             <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Reservation
            </Button>
             <Button variant="outline" onClick={handleClose}>Close</Button>
        </div>
    </div>
  );
}
