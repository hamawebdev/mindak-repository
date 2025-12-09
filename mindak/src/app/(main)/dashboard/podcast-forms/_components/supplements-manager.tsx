"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupplements, deleteSupplement } from "@/lib/api/admin/podcast-configuration";
import type { Supplement } from "@/types/admin-api";
import { SupplementFormDialog } from "./supplement-form-dialog";

export function SupplementsManager() {
  const [supplements, setSupplements] = React.useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSupplement, setSelectedSupplement] = React.useState<Supplement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const fetchSupplements = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSupplements();
      setSupplements(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch supplements";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplement?")) {
      return;
    }

    try {
      await deleteSupplement(id);
      toast.success("Supplement deleted successfully");
      await fetchSupplements();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete supplement";
      toast.error(message);
    }
  };

  const handleEdit = (supplement: Supplement) => {
    setSelectedSupplement(supplement);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchSupplements();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Supplements</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSupplements}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Supplements</h2>
          <p className="text-muted-foreground">Manage additional services</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {supplements.map((supplement) => (
          <Card key={supplement.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{supplement.name}</CardTitle>
                {!supplement.isActive && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5em]">
                {supplement.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm">Price:</span>
                <span className="font-medium">${supplement.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Order: {supplement.sortOrder}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(supplement)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(supplement.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SupplementFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <SupplementFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        supplement={selectedSupplement ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
