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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPodcastQuestion, updatePodcastQuestion } from "@/lib/api/admin/podcast-forms";
import { getSteps } from "@/lib/api/admin/podcast-configuration";
import type { FormQuestion, QuestionType, FormStep } from "@/types/admin-api";

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "date", label: "Date" },
  { value: "file", label: "File Upload" },
  { value: "number", label: "Number" },
  { value: "url", label: "URL" },
];

const formSchema = z.object({
  question_text: z.string().min(1, "Question text is required"),
  question_type: z.enum([
    "text",
    "email",
    "phone",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "date",
    "file",
    "number",
    "url",
  ]),
  required: z.boolean(),
  order: z.number().int().min(1),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  is_active: z.boolean(),
  validation_rules: z.string().optional(),
  fieldName: z.string().optional(),
  stepId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: FormQuestion;
  onSuccess: () => void;
}

export function QuestionFormDialog({ open, onOpenChange, question, onSuccess }: QuestionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [steps, setSteps] = React.useState<FormStep[]>([]);
  const isEdit = !!question;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_text: "",
      question_type: "text",
      required: true,
      order: 1,
      placeholder: "",
      help_text: "",
      is_active: true,
      validation_rules: "",
      fieldName: "",
      stepId: "unassigned", // Default or unassigned
    },
  });

  React.useEffect(() => {
    if (open) {
      getSteps().then((data) => {
        setSteps(data.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)));
      }).catch(console.error);

      if (question) {
        form.reset({
          question_text: question.question_text,
          question_type: question.question_type,
          required: question.required,
          order: question.order,
          placeholder: question.placeholder ?? "",
          help_text: question.help_text ?? "",
          is_active: question.is_active,
          validation_rules: question.validation_rules ? JSON.stringify(question.validation_rules, null, 2) : "",
          fieldName: question.fieldName ?? "",
          stepId: question.stepId ?? "unassigned",
        });
      } else {
        form.reset({
          question_text: "",
          question_type: "text",
          required: true,
          order: 1,
          placeholder: "",
          help_text: "",
          is_active: true,
          validation_rules: "",
          fieldName: "",
          stepId: "unassigned",
        });
      }
    }
  }, [question, form, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      let validationRules = null;
      if (values.validation_rules) {
        try {
          validationRules = JSON.parse(values.validation_rules);
        } catch {
          toast.error("Invalid JSON in validation rules");
          return;
        }
      }

      const data = {
        question_text: values.question_text,
        question_type: values.question_type,
        required: values.required,
        order: values.order,
        placeholder: values.placeholder || null,
        help_text: values.help_text || null,
        validation_rules: validationRules,
        is_active: values.is_active,
        fieldName: values.fieldName || undefined,
        stepId: values.stepId === "unassigned" ? undefined : values.stepId,
      };

      if (isEdit) {
        await updatePodcastQuestion(question.id, data);
        toast.success("Question updated successfully");
      } else {
        await createPodcastQuestion(data);
        toast.success("Question created successfully");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save question";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Question" : "Create Question"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the question details below" : "Add a new question to the podcast form"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Input placeholder="What is your podcast topic?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stepId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Step</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a step" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                      {steps.map((step) => (
                        <SelectItem key={step.id} value={step.id}>
                          {step.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Assign this question to a specific step in the wizard</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Required</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter placeholder text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Name (Internal Key)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. customer_email" {...field} />
                  </FormControl>
                  <FormDescription>Unique key for mapping (required for system fields)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Inactive questions will not be shown to users</FormDescription>
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
