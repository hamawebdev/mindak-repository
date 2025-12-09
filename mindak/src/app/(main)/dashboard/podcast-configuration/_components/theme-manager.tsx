"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getThemes, deleteTheme } from "@/lib/api/admin/podcast-configuration";
import type { Theme } from "@/types/admin-api";
import { ThemeFormDialog } from "./theme-form-dialog";

export function ThemeManager() {
  const [themes, setThemes] = React.useState<Theme[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = React.useState<Theme | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const fetchThemes = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getThemes();
      setThemes(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch themes";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) {
      return;
    }

    try {
      await deleteTheme(id);
      toast.success("Theme deleted successfully");
      await fetchThemes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete theme";
      toast.error(message);
    }
  };

  const handleEdit = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchThemes();
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
          <CardTitle>Error Loading Themes</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchThemes}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Themes</h2>
          <p className="text-muted-foreground">Manage podcast themes available for selection</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Theme
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card key={theme.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{theme.name}</CardTitle>
                {!theme.isActive && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5em]">
                {theme.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Order: {theme.sortOrder}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(theme)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(theme.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ThemeFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <ThemeFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        theme={selectedTheme ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
