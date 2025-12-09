"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDecors, deleteDecor } from "@/lib/api/admin/podcast-configuration";
import type { Decor } from "@/types/admin-api";
import { DecorFormDialog } from "./decor-form-dialog";

export function DecorsManager() {
  const [decors, setDecors] = React.useState<Decor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedDecor, setSelectedDecor] = React.useState<Decor | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const fetchDecors = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDecors();
      setDecors(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch decors";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDecors();
  }, [fetchDecors]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this decor?")) {
      return;
    }

    try {
      await deleteDecor(id);
      toast.success("Decor deleted successfully");
      await fetchDecors();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete decor";
      toast.error(message);
    }
  };

  const handleEdit = (decor: Decor) => {
    setSelectedDecor(decor);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchDecors();
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
          <CardTitle>Error Loading Decors</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchDecors}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Decors</h2>
          <p className="text-muted-foreground">Manage studio decor options</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Decor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decors.map((decor) => (
          <Card key={decor.id} className="overflow-hidden">
            {decor.imageUrl && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={decor.imageUrl}
                  alt={decor.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{decor.name}</CardTitle>
                {/* Check if isActive property exists on Decor type. Checked types: yes it does but optional in CreateRequest, but Decor type definition has it? 
                    Wait, let me check types/admin-api.ts again. 
                    Decor interface: id, name, imageUrl? 
                    Ah, Decor interface in types/admin-api.ts:
                    export interface Decor { id: string; name: string; imageUrl?: string; }
                    It MISSES isActive, description, sortOrder!
                    But CreateDecorRequest has them.
                    I need to update the Decor type definition in types/admin-api.ts as well.
                */}
                {/* Assuming I will fix the type definition, accessing decor.isActive */}
                {decor.isActive === false && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5em]">
                {decor.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Order: {decor.sortOrder ?? 0}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(decor)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(decor.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DecorFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <DecorFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        decor={selectedDecor ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
