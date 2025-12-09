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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  bulkReorderPodcastQuestions,
  deletePodcastQuestion,
  getPodcastQuestions,
} from "@/lib/api/admin/podcast-forms";
import type { FormQuestion } from "@/types/admin-api";

import { QuestionAnswersDialog } from "./question-answers-dialog";
import { QuestionFormDialog } from "./question-form-dialog";

export function QuestionsManager() {
  const [questions, setQuestions] = React.useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = React.useState<FormQuestion | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAnswersDialogOpen, setIsAnswersDialogOpen] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchQuestions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPodcastQuestions();
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch questions";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reorderedQuestions);

    try {
      setIsReordering(true);
      await bulkReorderPodcastQuestions({
        questions: reorderedQuestions.map((q, index) => ({
          id: q.id,
          order: index + 1,
        })),
      });
      toast.success("Questions reordered successfully");
      await fetchQuestions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reorder questions";
      toast.error(message);
      await fetchQuestions();
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? This will also delete all associated answers.")) {
      return;
    }

    try {
      await deletePodcastQuestion(questionId);
      toast.success("Question deleted successfully");
      await fetchQuestions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete question";
      toast.error(message);
    }
  };

  const handleEdit = (question: FormQuestion) => {
    setSelectedQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleManageAnswers = (question: FormQuestion) => {
    setSelectedQuestion(question);
    setIsAnswersDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchQuestions();
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
          <CardTitle>Error Loading Questions</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchQuestions}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
          <p className="text-muted-foreground">Manage questions for the reservation form</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question List</CardTitle>
          <CardDescription>Drag and drop to reorder questions</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              No questions found. Create your first question to get started.
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {questions.map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onManageAnswers={handleManageAnswers}
                      isReordering={isReordering}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <QuestionFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <QuestionFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        question={selectedQuestion ?? undefined}
        onSuccess={handleSuccess}
      />

      <QuestionAnswersDialog
        open={isAnswersDialogOpen}
        onOpenChange={setIsAnswersDialogOpen}
        question={selectedQuestion ?? undefined}
      />
    </div>
  );
}

interface QuestionItemProps {
  question: FormQuestion;
  onEdit: (question: FormQuestion) => void;
  onDelete: (questionId: string) => void;
  onManageAnswers: (question: FormQuestion) => void;
  isReordering: boolean;
}

function QuestionItem({ question, onEdit, onDelete, onManageAnswers, isReordering }: QuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasAnswers = ["select", "radio", "checkbox"].includes(question.question_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50"
    >
      <button className="cursor-grab touch-none active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{question.question_text}</span>
          {!question.is_active && <Badge variant="secondary">Inactive</Badge>}
          {question.required && <Badge variant="outline">Required</Badge>}
          {question.fieldName && <Badge variant="outline" className="font-mono text-xs">{question.fieldName}</Badge>}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{question.question_type}</Badge>
          {question.placeholder && <span>• Placeholder: {question.placeholder}</span>}
          {hasAnswers && <span>• {question.answers?.length || 0} answer(s)</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasAnswers && (
          <Button variant="outline" size="sm" onClick={() => onManageAnswers(question)}>
            Manage Answers
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onEdit(question)} disabled={isReordering}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(question.id)}
          disabled={isReordering}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
