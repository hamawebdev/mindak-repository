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
import { createServicesQuestion, updateServicesQuestion } from "@/lib/api/admin/services-forms";
import type { QuestionType, ServicesFormQuestion } from "@/types/admin-api";
import type { Service } from "@/types/api";

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
  section_type: z.enum(["general", "service_specific"]),
  service_id: z.string().nullable(),
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
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: ServicesFormQuestion;
  services: Service[];
  onSuccess: () => void;
}

export function QuestionFormDialog({ open, onOpenChange, question, services, onSuccess }: QuestionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEdit = !!question?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section_type: "general",
      service_id: null,
      question_text: "",
      question_type: "text",
      required: true,
      order: 1,
      placeholder: "",
      help_text: "",
      is_active: true,
      validation_rules: "",
    },
  });

  const sectionType = form.watch("section_type");

  React.useEffect(() => {
    if (question) {
      form.reset({
        section_type: question.section_type || "general",
        service_id: question.service_id || null,
        question_text: question.question_text || "",
        question_type: question.question_type || "text",
        required: question.required ?? true,
        order: question.order || 1,
        placeholder: question.placeholder ?? "",
        help_text: question.help_text ?? "",
        is_active: question.is_active ?? true,
        validation_rules: question.validation_rules ? JSON.stringify(question.validation_rules, null, 2) : "",
      });
    } else {
      form.reset({
        section_type: "general",
        service_id: null,
        question_text: "",
        question_type: "text",
        required: true,
        order: 1,
        placeholder: "",
        help_text: "",
        is_active: true,
        validation_rules: "",
      });
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
        section_type: values.section_type,
        service_id: values.section_type === "service_specific" ? values.service_id : null,
        question_text: values.question_text,
        question_type: values.question_type,
        required: values.required,
        order: values.order,
        placeholder: values.placeholder || null,
        help_text: values.help_text || null,
        validation_rules: validationRules,
        is_active: values.is_active,
      };

      if (isEdit) {
        await updateServicesQuestion(question.id, data);
        toast.success("Question updated successfully");
      } else {
        await createServicesQuestion(data);
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
            {isEdit ? "Update the question details below" : "Add a new question to the services form"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="section_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="service_specific">Service-Specific</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isEdit
                      ? "Cannot change section type after creation"
                      : "General questions apply to all services, service-specific only to selected service"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sectionType === "service_specific" && (
              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isEdit ? "Cannot change service after creation" : "Select which service this question applies to"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Input placeholder="What is your company name?" {...field} />
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
              name="help_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Help Text (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional help text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validation_rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validation Rules (Optional JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"minLength": 10, "maxLength": 200}'
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Custom validation rules as JSON object</FormDescription>
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
