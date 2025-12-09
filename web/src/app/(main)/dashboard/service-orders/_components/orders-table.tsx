"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Download, Loader2, Plus, Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableServerPagination } from "@/components/data-table/data-table-server-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { listServiceReservations } from "@/lib/api/admin/service-reservations";
import type { ReservationStatus, ServiceReservationListItem } from "@/types/admin-api";

import { serviceOrderColumns } from "./columns";

interface OrdersTableProps {
  initialData?: ServiceReservationListItem[];
  initialPage?: number;
  initialLimit?: number;
}

export function OrdersTable({ initialData = [], initialPage = 1, initialLimit = 10 }: OrdersTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<ServiceReservationListItem[]>(initialData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  
  // Filter state
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch data from API
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await listServiceReservations({
        page,
        limit,
        status: statusFilter !== "all" ? (statusFilter as ReservationStatus) : undefined,
        search: searchQuery || undefined,
      });
      
      setData(response.reservations);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reservations");
      console.error("Error fetching service reservations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);
  
  // Fetch data on mount and when filters change
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const table = useDataTableInstance({
    data,
    columns: serviceOrderColumns,
    getRowId: (row) => row.id,
  });

  // Handle search with debounce
  const [searchInput, setSearchInput] = React.useState("");
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset to first page on search
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRowClick = (reservation: ServiceReservationListItem) => {
    router.push(`/dashboard/service-orders/${reservation.id}`);
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  // Calculate stats from current data
  const stats = React.useMemo(() => {
    const pending = data.filter((o) => o.status === "pending").length;
    const confirmed = data.filter((o) => o.status === "confirmed").length;
    const completed = data.filter((o) => o.status === "completed").length;
    const cancelled = data.filter((o) => o.status === "cancelled").length;

    return { total, pending, confirmed, completed, cancelled };
  }, [data, total]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Reservations</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl">{stats.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-3xl">{stats.cancelled}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Service Orders</CardTitle>
              <CardDescription>Manage and view all service orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download />
                <span className="hidden lg:inline">Export</span>
              </Button>
              <Button size="sm">
                <Plus />
                <span className="hidden lg:inline">New Order</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="w-40 space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange} disabled={isLoading}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <DataTableViewOptions table={table} />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(statusFilter !== "all" || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => handleStatusFilterChange("all")}
                    className="ml-1 rounded-full hover:bg-muted"
                    aria-label="Remove status filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                    }}
                    className="ml-1 rounded-full hover:bg-muted"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading reservations...</span>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <>
              <div className="overflow-hidden rounded-lg border">
                <div
                  className="[&_tbody_tr]:cursor-pointer [&_tbody_tr]:hover:bg-muted/50"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const row = target.closest("tr");
                    if (row && row.parentElement?.tagName === "TBODY") {
                      const rowId = row.getAttribute("data-row-id");
                      if (rowId) {
                        const reservation = data.find((r) => r.id === rowId);
                        if (reservation) {
                          handleRowClick(reservation);
                        }
                      }
                    }
                  }}
                >
                  <DataTable table={table} columns={serviceOrderColumns} onReorder={setData} />
                </div>
              </div>

              <DataTableServerPagination
                table={table}
                page={page}
                limit={limit}
                total={total}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

