"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  addServiceReservationNote,
  deleteServiceReservation,
  getServiceReservationDetails,
  updateServiceReservationStatus,
} from "@/lib/api/admin/service-reservations";
import type {
  ReservationStatus,
  ServiceReservationDetailsResponse,
} from "@/types/admin-api";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderDetailsViewProps {
  reservationId: string;
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

export function OrderDetailsView({ reservationId }: OrderDetailsViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ServiceReservationDetailsResponse | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Fetch reservation details
  const fetchDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const reservationResponse = await getServiceReservationDetails(reservationId);
      setData(reservationResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reservation details");
      console.error("Error fetching service reservation details:", err);
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
      await updateServiceReservationStatus(reservationId, { status: newStatus });
      await fetchDetails(); // Refresh data
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      await addServiceReservationNote(reservationId, { noteText: newNote });
      setNewNote("");
      await fetchDetails(); // Refresh data
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Extract unique service names from reservation answers
  // Must be called before any conditional returns (Rules of Hooks)
  const serviceNames = React.useMemo(() => {
    if (!data?.reservation?.clientAnswers) return [];
    
    const names = new Set<string>();
    data.reservation.clientAnswers.forEach((answer) => {
      if (answer.sectionType === "service_specific" && answer.serviceName) {
        names.add(answer.serviceName);
      }
    });
    
    return Array.from(names);
  }, [data?.reservation?.clientAnswers]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteServiceReservation(reservationId);
      router.push("/dashboard/service-orders");
    } catch (err) {
      console.error("Error deleting reservation:", err);
      alert("Failed to delete reservation");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading reservation details...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-destructive">
        <h3 className="font-semibold">Error Loading Reservation</h3>
        <p className="mt-2">{error || "Reservation not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/service-orders">Back to Service Orders</Link>
        </Button>
      </div>
    );
  }

  const { reservation, statusHistory, notes } = data;
  const { variant: statusVariant, label: statusLabel, bgClass, textClass } = statusVariants[reservation.status];

  return (
    <div className="@container/main space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/service-orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Service Reservation Details</h1>
            <p className="text-muted-foreground">View and manage reservation information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 />}
            <span className="hidden lg:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Confirmation ID and Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="size-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmation ID</p>
                <p className="text-2xl font-bold">{reservation.confirmationId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Select
                  value={reservation.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className={`w-40 ${bgClass} ${textClass} font-medium`}>
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
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Client Answers & Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Client Answers */}
          <Card>
            <CardHeader>
              <CardTitle>Client Form Answers</CardTitle>
              <CardDescription>Information submitted by the client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reservation.clientAnswers.map((answer, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {answer.questionText}
                      {answer.sectionType === "service_specific" && answer.serviceName && (
                        <Badge variant="outline" className="ml-2">
                          {answer.serviceName}
                        </Badge>
                      )}
                    </p>
                    <p className="text-base">
                      {answer.answerText || answer.value}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Timeline of status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-primary size-2 mt-2" />
                      {index < statusHistory.length - 1 && (
                        <div className="w-px bg-border flex-1 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        {item.oldStatus && (
                          <>
                            <Badge className={statusVariants[item.oldStatus].bgClass.replace('hover:bg-amber-500/20', '').replace('hover:bg-blue-500/20', '').replace('hover:bg-green-500/20', '').replace('hover:bg-red-500/20', '') + ' ' + statusVariants[item.oldStatus].textClass}>
                              {statusVariants[item.oldStatus].label}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <Badge className={statusVariants[item.newStatus].bgClass.replace('hover:bg-amber-500/20', '').replace('hover:bg-blue-500/20', '').replace('hover:bg-green-500/20', '').replace('hover:bg-red-500/20', '') + ' ' + statusVariants[item.newStatus].textClass}>
                          {statusVariants[item.newStatus].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(item.changedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                      {item.notes && (
                        <p className="text-sm mt-2">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  <CardTitle>Admin Notes</CardTitle>
                </div>
              </div>
              <CardDescription>Internal notes and comments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-3">
                      <p className="text-sm">{note.noteText}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  size="sm"
                >
                  {isAddingNote ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 mr-2" />
                      Add Note
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata & Timeline */}
        <div className="space-y-6 lg:col-span-1">
          {/* Reservation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Reservation Information</CardTitle>
              <CardDescription>Key details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Services</p>
                {serviceNames.length > 0 ? (
                  <div className="space-y-1">
                    {serviceNames.map((name, index) => (
                      <p key={index} className="text-lg font-semibold">
                        {name}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {reservation.serviceIds.length} {reservation.serviceIds.length === 1 ? "Service" : "Services"}
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client IP</p>
                <p className="text-sm font-mono">{reservation.clientIp || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Important dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(reservation.submittedAt), "MMMM dd, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.submittedAt), "h:mm a")}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="mt-1 size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(reservation.updatedAt), "MMMM dd, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.updatedAt), "h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

