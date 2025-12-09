"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import type { ServiceReservationListItem } from "./schema";

const statusVariants: Record<
  ServiceReservationListItem["status"],
  { 
    variant: "default" | "secondary" | "destructive" | "outline"; 
    label: string;
    className: string;
  }
> = {
  pending: { 
    variant: "outline", 
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400"
  },
  confirmed: { 
    variant: "secondary", 
    label: "Confirmed",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400"
  },
  completed: { 
    variant: "default", 
    label: "Completed",
    className: "bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400"
  },
  cancelled: { 
    variant: "destructive", 
    label: "Cancelled",
    className: "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400"
  },
};

export const serviceOrderColumns: ColumnDef<ServiceReservationListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "confirmationId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Confirmation ID" />,
    cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.confirmationId}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client ID" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">{row.original.clientId.slice(0, 8)}...</span>
    ),
  },
  {
    accessorKey: "serviceIds",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Services" />,
    cell: ({ row }) => {
      const count = row.original.serviceIds.length;
      return (
        <Badge variant="outline">
          {count} {count === 1 ? "Service" : "Services"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const { label, className } = statusVariants[status];
      return <Badge className={className}>{label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
    cell: ({ row }) => {
      const date = new Date(row.original.submittedAt);
      return <span className="text-muted-foreground tabular-nums">{format(date, "MMM dd, yyyy HH:mm")}</span>;
    },
  },
];

