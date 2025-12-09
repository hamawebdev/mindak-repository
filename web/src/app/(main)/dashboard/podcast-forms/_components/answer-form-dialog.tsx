"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, X } from "lucide-react";
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
import {
  createPodcastQuestionAnswer,
  updatePodcastQuestionAnswer,
  uploadPodcastAnswerImage,
} from "@/lib/api/admin/podcast-forms";
import type { QuestionAnswer } from "@/types/admin-api";

const formSchema = z.object({
  answer_text: z.string().min(1, "Answer text is required"),
  answer_value: z.string().optional(),
  order: z.number().int().min(1),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnswerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
  answer?: QuestionAnswer;
  onSuccess: () => void;
}

export function AnswerFormDialog({
  open,
  onOpenChange,
  questionId,
  answer,
  onSuccess,
}: AnswerFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isEdit = !!answer;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer_text: "",
      answer_value: "",
      order: 1,
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (answer) {
      form.reset({
        answer_text: answer.answer_text,
        answer_value: answer.answer_value ?? "",
        order: answer.order,
        is_active: answer.is_active,
      });
      // Set existing image if available
      const existingImage = answer.answer_metadata?.image;
      setImageUrl(existingImage || null);
      setImageFile(null);
    } else {
      form.reset({
        answer_text: "",
        answer_value: "",
        order: 1,
        is_active: true,
      });
      setImageUrl(null);
      setImageFile(null);
    }
  }, [answer, form, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, GIF, WebP, or SVG.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setImageFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Upload image if a new file is selected
      let uploadedImageUrl = imageUrl;
      if (imageFile) {
        try {
          setIsUploadingImage(true);
          uploadedImageUrl = await uploadPodcastAnswerImage(imageFile);
          toast.success("Image uploaded successfully");
        } catch (err) {
          toast.error("Failed to upload image");
          throw err;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const data = {
        answer_text: values.answer_text,
        answer_value: values.answer_value || null,
        answer_metadata: uploadedImageUrl ? { image: uploadedImageUrl } : null,
        order: values.order,
        is_active: values.is_active,
      };

      if (isEdit) {
        await updatePodcastQuestionAnswer(questionId, answer.id, data);
        toast.success("Answer updated successfully");
      } else {
        await createPodcastQuestionAnswer(questionId, data);
        toast.success("Answer created successfully");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save answer";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Answer" : "Create Answer"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the answer details below" : "Add a new answer option"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="answer_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology" {...field} />
                  </FormControl>
                  <FormDescription>Display text shown to users</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer Value (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="tech" {...field} />
                  </FormControl>
                  <FormDescription>Internal value used for processing</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Field */}
            <div className="space-y-2">
              <FormLabel>Answer Image (Optional)</FormLabel>
              <div className="flex flex-col gap-3">
                {imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={imageUrl.startsWith("blob:") ? imageUrl : `${process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:8000"}${imageUrl}`}
                      alt="Answer preview"
                      className="h-32 w-32 rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <FormDescription>
                Upload an image for this answer option (JPEG, PNG, GIF, WebP, SVG - Max 5MB)
              </FormDescription>
            </div>

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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Inactive answers will not be shown to users</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                {(isSubmitting || isUploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploadingImage ? "Uploading..." : isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
