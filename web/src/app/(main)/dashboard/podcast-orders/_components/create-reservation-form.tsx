"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createReservationSchema, type CreateReservationFormValues } from "./schema";
import {
  createPodcastReservation,
  getAvailableDecors,
  getAvailablePacks,
  getAvailableSupplements
} from "@/lib/api/admin/podcast-reservations";
import { getThemes } from "@/lib/api/admin/podcast-configuration";
import { getPodcastQuestions } from "@/lib/api/admin/podcast-forms";
import type { Decor, PackOffer, Supplement, Theme, FormQuestion } from "@/types/admin-api";
import { useToast } from "@/hooks/use-toast";
import { useModal } from "@/providers/modal-context";

interface CreateReservationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateReservationForm({ onSuccess, onCancel, initialData }: CreateReservationFormProps & { initialData?: any }) {
  const { toast } = useToast();
  const { setClose, data } = useModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [decors, setDecors] = React.useState<Decor[]>([]);
  const [packs, setPacks] = React.useState<PackOffer[]>([]);
  const [supplements, setSupplements] = React.useState<Supplement[]>([]);
  const [themes, setThemes] = React.useState<Theme[]>([]);
  const [questions, setQuestions] = React.useState<FormQuestion[]>([]);

  // Extract initial date and time from modal data (when clicking on a timeslot)
  const eventData = initialData || data as any;
  const initialDate = eventData?.startDate;
  const initialStartTime = initialDate
    ? `${initialDate.getHours().toString().padStart(2, '0')}:00`
    : "09:00";

  React.useEffect(() => {
    async function loadOptions() {
      try {
        const [decorsData, packsData, supplementsData, themesData, questionsData] = await Promise.all([
          getAvailableDecors(),
          getAvailablePacks(),
          getAvailableSupplements(),
          getThemes(),
          getPodcastQuestions()
        ]);
        setDecors(decorsData);
        setPacks(packsData);
        setSupplements(supplementsData);
        setThemes(themesData);
        setQuestions(questionsData.filter(q => q.is_active));
      } catch (error) {
        console.error("Failed to load options", error);
        toast({
          title: "Warning",
          description: "Failed to load some options. Please try refreshing.",
          variant: "destructive",
        });
      }
    }
    loadOptions();
  }, [toast]);

  const form = useForm<CreateReservationFormValues>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      status: "confirmed",
      duration: "1",
      startTime: initialStartTime,
      date: initialDate,
      supplementIds: [],
    },
  });

  async function onSubmit(values: CreateReservationFormValues) {
    try {
      setIsSubmitting(true);

      // Combine date and startTime to create startAt
      const [hours, minutes] = values.startTime.split(":").map(Number);
      const startAt = new Date(values.date);
      startAt.setHours(hours, minutes, 0, 0);

      // Calculate endAt based on duration
      const durationHours = parseInt(values.duration);
      const endAt = new Date(startAt);
      endAt.setHours(startAt.getHours() + durationHours);

      // Format answers
      const answers = values.answers
        ? Object.entries(values.answers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        }))
        : undefined;

      await createPodcastReservation({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status: values.status,
        notes: values.notes,
        // Optional IDs - in a real app these would come from other API calls
        decorId: values.decorId,
        packOfferId: values.packOfferId,
        supplementIds: values.supplementIds,
        assignedAdminId: values.assignedAdminId,
        themeId: values.themeId,
        customTheme: values.customTheme,
        podcastDescription: values.podcastDescription,
        answers: answers,
      });

      toast({
        title: "Success",
        description: "Reservation created successfully",
      });

      form.reset();
      setClose();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    setClose();
    onCancel?.();
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" type="email" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                        {hour.toString().padStart(2, "0")}:00
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
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Hours)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "1"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h} {h === 1 ? "hour" : "hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="decorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select decor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {decors.map((decor) => (
                      <SelectItem key={decor.id} value={decor.id}>
                        {decor.name}
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
            name="themeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Theme</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("themeId") === "custom" && (
            <FormField
              control={form.control}
              name="customTheme"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Custom Theme Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter custom theme" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="packOfferId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pack / Offer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pack" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {packs.map((pack) => (
                      <SelectItem key={pack.id} value={pack.id}>
                        {pack.name} ({pack.basePrice}€)
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
            name="supplementIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplements</FormLabel>
                <div className="flex flex-wrap gap-2 border rounded-md p-3">
                  {supplements.length === 0 && <span className="text-sm text-muted-foreground">No supplements available</span>}
                  {supplements.map((supp) => (
                    <Button
                      key={supp.id}
                      type="button"
                      variant={field.value?.includes(supp.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = field.value || [];
                        if (current.includes(supp.id)) {
                          field.onChange(current.filter(id => id !== supp.id));
                        } else {
                          field.onChange([...current, supp.id]);
                        }
                      }}
                      className="text-xs h-7"
                    >
                      {supp.name} (+{supp.price}€)
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="podcastDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Podcast Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the podcast..."
                  className="resize-none h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {questions.length > 0 && (
          <div className="space-y-4 border rounded-md p-4">
            <h3 className="font-medium">Questionnaire</h3>
            {questions.map((question) => (
              <FormField
                key={question.id}
                control={form.control}
                name={`answers.${question.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {question.question_text}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      {question.question_type === "textarea" ? (
                        <Textarea {...field} value={field.value || ""} placeholder={question.placeholder || ""} />
                      ) : question.question_type === "select" ? (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {question.answers?.map((opt) => (
                              <SelectItem key={opt.id} value={opt.answer_text}>
                                {opt.answer_text}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input {...field} value={field.value || ""} placeholder={question.placeholder || ""} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any internal notes here..."
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Reservation
          </Button>
        </div>
      </form>
    </Form>
  );
}
