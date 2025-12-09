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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteService, getAllServices, toggleServiceStatus } from "@/lib/api/admin/services";
import {
    bulkReorderServicesQuestions,
    deleteServicesQuestion,
    getServicesQuestions,
} from "@/lib/api/admin/services-forms";
import type { Service } from "@/types/api";
import type { ServicesFormQuestion } from "@/types/admin-api";

import { QuestionAnswersDialog } from "./question-answers-dialog";
import { QuestionFormDialog } from "./question-form-dialog";
import { ServiceFormDialog } from "./service-form-dialog";

export function ServiceFormsManager() {
    const [generalQuestions, setGeneralQuestions] = React.useState<ServicesFormQuestion[]>([]);
    const [serviceSpecificQuestions, setServiceSpecificQuestions] = React.useState<ServicesFormQuestion[]>([]);
    const [services, setServices] = React.useState<Service[]>([]);
    const [selectedServiceId, setSelectedServiceId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = React.useState<ServicesFormQuestion | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isAnswersDialogOpen, setIsAnswersDialogOpen] = React.useState(false);
    const [isReordering, setIsReordering] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<"general" | "service-specific">("general");
    const [selectedService, setSelectedService] = React.useState<Service | null>(null);
    const [isServiceDialogOpen, setIsServiceDialogOpen] = React.useState(false);

    const serviceQuestionsRef = React.useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const fetchServices = React.useCallback(async () => {
        try {
            const services = await getAllServices();
            setServices(services || []);
            if (services && services.length > 0 && !selectedServiceId) {
                setSelectedServiceId(services[0].id);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch services";
            toast.error(message);
            setServices([]);
        }
    }, [selectedServiceId]);

    const fetchQuestions = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const generalData = await getServicesQuestions({ section: "general" });
            setGeneralQuestions(generalData.sort((a, b) => a.order - b.order));

            if (selectedServiceId) {
                const serviceData = await getServicesQuestions({
                    section: "service_specific",
                    serviceId: selectedServiceId,
                });
                setServiceSpecificQuestions(serviceData.sort((a, b) => a.order - b.order));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch questions";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedServiceId]);

    React.useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    React.useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    React.useEffect(() => {
        if (selectedServiceId && serviceQuestionsRef.current) {
            setTimeout(() => {
                serviceQuestionsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [selectedServiceId]);

    const handleDragEnd = async (event: DragEndEvent, section: "general" | "service_specific") => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const questions = section === "general" ? generalQuestions : serviceSpecificQuestions;
        const setQuestions = section === "general" ? setGeneralQuestions : setServiceSpecificQuestions;

        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);

        const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
        setQuestions(reorderedQuestions);

        try {
            setIsReordering(true);
            await bulkReorderServicesQuestions({
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
            await deleteServicesQuestion(questionId);
            toast.success("Question deleted successfully");
            await fetchQuestions();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete question";
            toast.error(message);
        }
    };

    const handleEdit = (question: ServicesFormQuestion) => {
        setSelectedQuestion(question);
        setIsEditDialogOpen(true);
    };

    const handleManageAnswers = (question: ServicesFormQuestion) => {
        setSelectedQuestion(question);
        setIsAnswersDialogOpen(true);
    };

    const handleCreateNew = (sectionType: "general" | "service_specific") => {
        setSelectedQuestion({
            section_type: sectionType,
            service_id: sectionType === "service_specific" ? selectedServiceId : null,
        } as ServicesFormQuestion);
        setIsCreateDialogOpen(true);
    };

    const handleSuccess = () => {
        fetchQuestions();
    };

    const handleServiceSuccess = () => {
        fetchServices();
    };

    const handleCreateService = () => {
        setSelectedService(null);
        setIsServiceDialogOpen(true);
    };

    const handleEditService = (service: Service) => {
        setSelectedService(service);
        setIsServiceDialogOpen(true);
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm("Are you sure you want to delete this service? This will also delete all associated questions and data.")) {
            return;
        }

        try {
            await deleteService(serviceId);
            toast.success("Service deleted successfully");
            await fetchServices();
            if (selectedServiceId === serviceId) {
                setSelectedServiceId(null);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete service";
            toast.error(message);
        }
    };

    const handleToggleServiceStatus = async (serviceId: string) => {
        try {
            await toggleServiceStatus(serviceId);
            toast.success("Service status updated successfully");
            await fetchServices();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update service status";
            toast.error(message);
        }
    };

    if (isLoading && generalQuestions.length === 0) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error && generalQuestions.length === 0) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Service Form Questions</h1>
                    <p className="text-muted-foreground">Manage questions and answers for the service booking form</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                    <TabsTrigger value="general">General Questions</TabsTrigger>
                    <TabsTrigger value="service-specific">Service-Specific Questions</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>General Questions</CardTitle>
                                    <CardDescription>Questions shown for all service bookings</CardDescription>
                                </div>
                                <Button onClick={() => handleCreateNew("general")}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Question
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {generalQuestions.length === 0 ? (
                                <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
                                    No general questions found. Create your first question to get started.
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(e) => handleDragEnd(e, "general")}
                                >
                                    <SortableContext items={generalQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-2">
                                            {generalQuestions.map((question) => (
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
                </TabsContent>

                <TabsContent value="service-specific" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Manage Services</CardTitle>
                                    <CardDescription>Create, edit, or select a service to manage its specific questions</CardDescription>
                                </div>
                                <Button onClick={handleCreateService}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Service
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {services.length === 0 ? (
                                <div className="flex min-h-[100px] items-center justify-center text-muted-foreground">
                                    No services found. Create your first service to get started.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className={`flex items-center justify-between rounded-lg border p-3 ${selectedServiceId === service.id ? "bg-accent" : ""
                                                }`}
                                        >
                                            <button
                                                className="flex-1 text-left"
                                                onClick={() => setSelectedServiceId(service.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{service.name}</span>
                                                    {!service.is_active && <Badge variant="secondary">Inactive</Badge>}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    ${service.price}
                                                </div>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleServiceStatus(service.id)}
                                                >
                                                    {service.is_active ? "Deactivate" : "Activate"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditService(service)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteService(service.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedServiceId && (
                        <Card ref={serviceQuestionsRef}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Service-Specific Questions</CardTitle>
                                        <CardDescription>
                                            Questions shown only for{" "}
                                            {services.find((s) => s.id === selectedServiceId)?.name || "this service"}
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => handleCreateNew("service_specific")}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Question
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {serviceSpecificQuestions.length === 0 ? (
                                    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
                                        No service-specific questions found. Create your first question for this service.
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={(e) => handleDragEnd(e, "service_specific")}
                                    >
                                        <SortableContext
                                            items={serviceSpecificQuestions.map((q) => q.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2">
                                                {serviceSpecificQuestions.map((question) => (
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
                    )}
                </TabsContent>
            </Tabs>

            <QuestionFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                question={selectedQuestion ?? undefined}
                services={services}
                onSuccess={handleSuccess}
            />

            <QuestionFormDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                question={selectedQuestion ?? undefined}
                services={services}
                onSuccess={handleSuccess}
            />

            <QuestionAnswersDialog
                open={isAnswersDialogOpen}
                onOpenChange={setIsAnswersDialogOpen}
                question={selectedQuestion ?? undefined}
            />

            <ServiceFormDialog
                open={isServiceDialogOpen}
                onOpenChange={setIsServiceDialogOpen}
                service={selectedService ?? undefined}
                onSuccess={handleServiceSuccess}
            />
        </div>
    );
}

interface QuestionItemProps {
    question: ServicesFormQuestion;
    onEdit: (question: ServicesFormQuestion) => void;
    onDelete: (questionId: string) => void;
    onManageAnswers: (question: ServicesFormQuestion) => void;
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
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{question.question_type}</Badge>
                    {question.placeholder && <span>• Placeholder: {question.placeholder}</span>}
                    {hasAnswers && question.answers && <span>• {question.answers.length} answer(s)</span>}
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
