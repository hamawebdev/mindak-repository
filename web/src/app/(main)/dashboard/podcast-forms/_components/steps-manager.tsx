"use client";

import * as React from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSteps, deleteStep } from "@/lib/api/admin/podcast-configuration";
import type { FormStep } from "@/types/admin-api";
import { StepFormDialog } from "./step-form-dialog";

export function StepsManager() {
  const [steps, setSteps] = React.useState<FormStep[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedStep, setSelectedStep] = React.useState<FormStep | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const fetchSteps = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSteps();
      setSteps(data.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch steps";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this step?")) {
      return;
    }

    try {
      await deleteStep(id);
      toast.success("Step deleted successfully");
      await fetchSteps();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete step";
      toast.error(message);
    }
  };

  const handleEdit = (step: FormStep) => {
    setSelectedStep(step);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchSteps();
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
          <CardTitle>Error Loading Steps</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSteps}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Form Steps</h2>
          <p className="text-muted-foreground">Manage steps in the reservation form wizard</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                {!step.isActive && <Badge variant="secondary">Inactive</Badge>}
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5em]">
                {step.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Order: {step.orderIndex}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(step)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(step.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StepFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <StepFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        step={selectedStep ?? undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
