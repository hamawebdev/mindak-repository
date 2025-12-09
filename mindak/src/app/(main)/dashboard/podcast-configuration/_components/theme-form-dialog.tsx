"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTheme, updateTheme } from "@/lib/api/admin/podcast-configuration";
import type { Theme } from "@/types/admin-api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ThemeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: Theme;
  onSuccess: () => void;
}

export function ThemeFormDialog({ open, onOpenChange, theme, onSuccess }: ThemeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEdit = !!theme;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (theme) {
      form.reset({
        name: theme.name,
        description: theme.description ?? "",
        sortOrder: theme.sortOrder,
        isActive: theme.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [theme, form, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const data = {
        name: values.name,
        description: values.description || undefined,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };

      if (isEdit) {
        await updateTheme(theme.id, data);
        toast.success("Theme updated successfully");
      } else {
        await createTheme(data);
        toast.success("Theme created successfully");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save theme";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Theme" : "Create Theme"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the theme details below" : "Add a new theme for podcast reservations"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Theme description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Inactive themes will not be shown to users</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
