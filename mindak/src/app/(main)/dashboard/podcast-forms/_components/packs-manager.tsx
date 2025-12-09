"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPacks, deletePack } from "@/lib/api/admin/podcast-configuration";
import type { PackOffer } from "@/types/admin-api";
import { PackFormDialog } from "./pack-form-dialog";

export function PacksManager() {
  const [packs, setPacks] = React.useState<PackOffer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPack, setSelectedPack] = React.useState<PackOffer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const fetchPacks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPacks();
      setPacks(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch packs";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pack?")) {
      return;
    }

    try {
      await deletePack(id);
      toast.success("Pack deleted successfully");
      await fetchPacks();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete pack";
      toast.error(message);
    }
  };

  const handleEdit = (pack: PackOffer) => {
    setSelectedPack(pack);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchPacks();
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
          <CardTitle>Error Loading Packs</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchPacks}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Packs</h2>
          <p className="text-muted-foreground">Manage podcast packages and offers</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pack
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => (
          <Card key={pack.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pack.name}</CardTitle>
                {!pack.isActive && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5em]">
                {pack.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">${pack.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{pack.durationMin} min</span>
                </div>
                {pack.metadata && pack.metadata.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Metadata:</span>
                    <Badge variant="outline">{pack.metadata.length} fields</Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Order: {pack.sortOrder}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pack)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pack.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PackFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <PackFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        pack={selectedPack ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
