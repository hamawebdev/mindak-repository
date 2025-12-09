"use client";

import * as React from "react";

import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  bulkReorderPodcastQuestionAnswers,
  deletePodcastQuestionAnswer,
  getPodcastQuestionAnswers,
} from "@/lib/api/admin/podcast-forms";
import type { FormQuestion, QuestionAnswer } from "@/types/admin-api";

import { AnswerFormDialog } from "./answer-form-dialog";

interface QuestionAnswersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: FormQuestion;
}

export function QuestionAnswersDialog({ open, onOpenChange, question }: QuestionAnswersDialogProps) {
  const [answers, setAnswers] = React.useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<QuestionAnswer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchAnswers = React.useCallback(async () => {
    if (!question) return;

    try {
      setIsLoading(true);
      const data = await getPodcastQuestionAnswers(question.id);
      setAnswers(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch answers";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [question]);

  React.useEffect(() => {
    if (open && question) {
      fetchAnswers();
    }
  }, [open, question, fetchAnswers]);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!question) return;

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = answers.findIndex((a) => a.id === active.id);
    const newIndex = answers.findIndex((a) => a.id === over.id);

    const reorderedAnswers = arrayMove(answers, oldIndex, newIndex);
    setAnswers(reorderedAnswers);

    try {
      setIsReordering(true);
      await bulkReorderPodcastQuestionAnswers(question.id, {
        answers: reorderedAnswers.map((a, index) => ({
          id: a.id,
          order: index + 1,
        })),
      });
      toast.success("Answers reordered successfully");
      await fetchAnswers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reorder answers";
      toast.error(message);
      await fetchAnswers();
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (answerId: string) => {
    if (!question) return;

    if (!confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    try {
      await deletePodcastQuestionAnswer(question.id, answerId);
      toast.success("Answer deleted successfully");
      await fetchAnswers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete answer";
      toast.error(message);
    }
  };

  const handleEdit = (answer: QuestionAnswer) => {
    setSelectedAnswer(answer);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchAnswers();
  };

  if (!question) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-[700px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Answers</DialogTitle>
            <DialogDescription>
              Manage answer options for: {question.question_text}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Answer
              </Button>
            </div>

            {isLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : answers.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">No answers found. Create your first answer option.</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={answers.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {answers.map((answer) => (
                      <AnswerItem
                        key={answer.id}
                        answer={answer}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isReordering={isReordering}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AnswerFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        questionId={question.id}
        onSuccess={handleSuccess}
      />

      <AnswerFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        questionId={question.id}
        answer={selectedAnswer ?? undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
}

interface AnswerItemProps {
  answer: QuestionAnswer;
  onEdit: (answer: QuestionAnswer) => void;
  onDelete: (answerId: string) => void;
  isReordering: boolean;
}

function AnswerItem({ answer, onEdit, onDelete, isReordering }: AnswerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: answer.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50"
    >
      <button className="cursor-grab touch-none active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{answer.answer_text}</span>
          {!answer.is_active && <Badge variant="secondary">Inactive</Badge>}
        </div>
        {answer.answer_value && (
          <div className="text-sm text-muted-foreground">Value: {answer.answer_value}</div>
        )}
        {answer.answer_metadata && (
          <div className="text-xs text-muted-foreground font-mono">
            {JSON.stringify(answer.answer_metadata)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(answer)} disabled={isReordering}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(answer.id)}
          disabled={isReordering}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
