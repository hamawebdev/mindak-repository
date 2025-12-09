"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Clock, ArrowLeft } from "lucide-react";
import {
    getFormConfig,
    getAvailability,
    createReservation,
    validateEmail,
    validateReservation,
    PodcastApiError,
    type FormConfig,
    type PackOffer,
    type DecorOption,
    type SupplementService,
    type Theme,
    type FormQuestion,
    type TimeSlot,
    type CreateReservationRequest,
    type ReservationAnswer,
} from "@/lib/api/client/podcast";
import { PodcastCalendar } from "./podcast-calendar";
import { format } from "date-fns";
import * as fpixel from "@/lib/fpixel";

// ============================================================================
// Types
// ============================================================================

type FormStep =
    | "decor"
    | "pack"
    | "supplements"
    | "theme"
    | "datetime"
    | "questions"
    | "contact"
    | "review";

const STEP_ORDER: FormStep[] = [
    "decor",
    "pack",
    "supplements",
    "theme",
    "datetime",
    "questions",
    "contact",
    "review",
];

interface FormData {
    decorId?: string;
    packOfferId?: string;
    supplementIds: string[];
    themeId?: string;
    customTheme: string;
    podcastDescription: string;
    requestedDate?: string;
    requestedStartTime?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string;
    answers: Record<string, ReservationAnswer>;
}

interface ValidationErrors {
    [key: string]: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function PodcastReservationForm() {
    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<FormConfig | null>(null);
    const [currentStep, setCurrentStep] = useState<FormStep>("decor");
    const [formData, setFormData] = useState<FormData>({
        supplementIds: [],
        customTheme: "",
        podcastDescription: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        notes: "",
        answers: {},
    });
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [reservationId, setReservationId] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const router = useRouter();

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const continueButtonRef = useRef<HTMLDivElement>(null);

    // ============================================================================
    // Effects
    // ============================================================================

    // Load form configuration
    useEffect(() => {
        const loadConfig = async () => {
            try {
                setLoading(true);
                const data = await getFormConfig();
                setConfig(data);
                setError(null);
            } catch (err) {
                console.error("Error loading form config:", err);
                setError(
                    err instanceof PodcastApiError
                        ? err.message
                        : "Failed to load form. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    // Animate logo when loading
    useEffect(() => {
        if (loading && logoRef.current) {
            const logo = logoRef.current;
            gsap.set(logo, { opacity: 0, scale: 0.8, y: 0 });
            const tl = gsap.timeline({ repeat: -1 });
            tl.to(logo, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" })
                .to(logo, { y: -15, duration: 1.5, ease: "sine.inOut" })
                .to(logo, { y: 0, duration: 1.5, ease: "sine.inOut" });

            return () => {
                tl.kill();
            };
        }
    }, [loading]);

    // Fetch availability when pack and date are selected
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!formData.packOfferId || !selectedDate) {
                setAvailability([]);
                return;
            }

            try {
                setLoadingAvailability(true);
                const data = await getAvailability(selectedDate, formData.packOfferId);
                setAvailability(data.availableSlots);
            } catch (err) {
                console.error("Error fetching availability:", err);
                setAvailability([]);
            } finally {
                setLoadingAvailability(false);
            }
        };

        fetchAvailability();
    }, [formData.packOfferId, selectedDate]);

    // Animate step transitions
    useEffect(() => {
        if (containerRef.current && !loading) {
            gsap.fromTo(
                containerRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, [currentStep, loading]);

    // ============================================================================
    // Handlers
    // ============================================================================

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        // Clear validation errors for updated fields
        const updatedKeys = Object.keys(updates);
        setValidationErrors((prev) => {
            const newErrors = { ...prev };
            updatedKeys.forEach((key) => delete newErrors[key]);
            return newErrors;
        });
    };

    const handleToggleSupplement = (id: string) => {
        const newSupplements = formData.supplementIds.includes(id)
            ? formData.supplementIds.filter((s) => s !== id)
            : [...formData.supplementIds, id];
        updateFormData({ supplementIds: newSupplements });
    };

    const handleAnswerChange = (questionId: string, answer: ReservationAnswer) => {
        updateFormData({
            answers: {
                ...formData.answers,
                [questionId]: answer,
            },
        });
    };

    const validateCurrentStep = (): boolean => {
        const errors: ValidationErrors = {};

        switch (currentStep) {
            case "pack":
                if (!formData.packOfferId) {
                    errors.pack = "Please select a recording package";
                }
                break;
            case "theme":
                if (!formData.themeId && !formData.customTheme.trim()) {
                    errors.theme = "Please select a theme or enter a custom theme";
                }
                if (!formData.podcastDescription.trim()) {
                    errors.podcastDescription = "Please provide a podcast description";
                }
                break;
            case "datetime":
                if (!formData.requestedDate) {
                    errors.date = "Please select a date";
                }
                if (!formData.requestedStartTime) {
                    errors.time = "Please select a time slot";
                }
                break;
            case "contact":
                if (!formData.customerName.trim()) {
                    errors.customerName = "Name is required";
                }
                if (!formData.customerEmail.trim()) {
                    errors.customerEmail = "Email is required";
                } else if (!validateEmail(formData.customerEmail)) {
                    errors.customerEmail = "Please enter a valid email";
                }
                break;
            case "questions":
                if (config) {
                    const currentQuestion = config.questions[currentQuestionIndex];
                    if (currentQuestion?.isRequired) {
                        const answer = formData.answers[currentQuestion.id];
                        if (
                            !answer ||
                            (!answer.answerText?.trim() && !answer.answerOptionIds?.length)
                        ) {
                            errors.question = `${currentQuestion.label} is required`;
                        }
                    }
                }
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;

        if (currentStep === "questions" && config) {
            if (currentQuestionIndex < config.questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
                return;
            }
        }

        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
            let nextStep = STEP_ORDER[currentIndex + 1];

            // Skip questions step if there are no questions
            if (nextStep === "questions" && (!config?.questions || config.questions.length === 0)) {
                nextStep = STEP_ORDER[currentIndex + 2];
            }

            if (currentStep === "decor") {
                fpixel.event("Lead");
            }

            setCurrentStep(nextStep);
            if (nextStep === "questions") {
                setCurrentQuestionIndex(0);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep === "questions" && currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
            return;
        }

        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex > 0) {
            let prevStep = STEP_ORDER[currentIndex - 1];

            // Skip questions step if there are no questions
            if (prevStep === "questions" && (!config?.questions || config.questions.length === 0)) {
                prevStep = STEP_ORDER[currentIndex - 2];
            }

            setCurrentStep(prevStep);
            if (prevStep === "questions" && config) {
                setCurrentQuestionIndex(config.questions.length - 1);
            }
        }
    };

    const handleSubmit = async () => {
        if (!config || !formData.packOfferId || !formData.requestedDate || !formData.requestedStartTime) {
            setValidationErrors({ submit: "Please complete all required fields" });
            return;
        }

        // Build answers array
        const answers: ReservationAnswer[] = Object.values(formData.answers);

        // Validate
        const validationErrors = validateReservation(
            {
                ...formData,
                packOfferId: formData.packOfferId,
                podcastDescription: formData.podcastDescription,
                requestedDate: formData.requestedDate,
                requestedStartTime: formData.requestedStartTime,
                answers,
            },
            config.questions.filter((q) => q.isRequired)
        );

        if (validationErrors.length > 0) {
            const errorsObj: ValidationErrors = {};
            validationErrors.forEach((err) => {
                errorsObj[err.field] = err.message;
            });
            setValidationErrors(errorsObj);
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createReservation({
                decorId: formData.decorId,
                packOfferId: formData.packOfferId,
                supplementIds: formData.supplementIds,
                themeId: formData.themeId,
                customTheme: formData.customTheme,
                podcastDescription: formData.podcastDescription,
                requestedDate: formData.requestedDate,
                requestedStartTime: formData.requestedStartTime,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                notes: formData.notes,
                answers,
            });

            setReservationId(response.id);
            setSubmitSuccess(true);
            fpixel.event("Schedule");
        } catch (err) {
            console.error("Error submitting reservation:", err);
            if (err instanceof PodcastApiError) {
                if (err.details) {
                    const errorsObj: ValidationErrors = {};
                    err.details.forEach((detail) => {
                        errorsObj[detail.field] = detail.message;
                    });
                    setValidationErrors(errorsObj);
                } else {
                    setValidationErrors({ submit: err.message });
                }
            } else {
                setValidationErrors({
                    submit: "Failed to submit reservation. Please try again.",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================================================
    // Render Helpers
    // ============================================================================

    const calculateTotalPrice = (): number => {
        if (!config) return 0;
        const pack = config.packOffers.find((p) => p.id === formData.packOfferId);
        const supplements = config.supplementServices.filter((s) =>
            formData.supplementIds.includes(s.id)
        );
        return (
            (pack?.basePrice || 0) +
            supplements.reduce((sum, s) => sum + s.price, 0)
        );
    };

    const renderPackSelection = () => {
        if (!config) return null;

        const totalPrice = calculateTotalPrice();

        return (
            <div className="space-y-8 w-full max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="relative flex items-center justify-center mb-12">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight text-center">
                        Choose your <span className="italic-riccione font-normal">Package</span>
                    </h2>

                    {/* Total Price Pill - Absolute positioned to right */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg whitespace-nowrap">
                            Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                        </div>
                    </div>
                </div>

                {/* Mobile Total Price */}
                <div className="lg:hidden flex justify-center mb-8">
                    <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                        Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {config.packOffers.map((pack, index) => {
                        const isSelected = formData.packOfferId === pack.id;

                        return (
                            <button
                                key={pack.id}
                                onClick={() => updateFormData({ packOfferId: pack.id })}
                                className={`relative group rounded-[2rem] transition-all duration-300 text-left flex flex-col h-full
                                    ${isSelected ? 'p-[2px]' : `p-[1px] border ${index === 1 ? 'border-[#71ff7b]' : 'border-white/10'}`}
                                    ${index === 1 ? 'scale-105' : ''}
                                `}
                                style={{
                                    background: isSelected
                                        ? "linear-gradient(90deg, rgba(113,255,123,1) 0%, rgba(31,139,255,1) 100%)"
                                        : ""
                                }}
                            >
                                {/* Most Popular Badge */}
                                {index === 1 && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-[#71ff7b] to-[#1f8bff] text-black px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-lg whitespace-nowrap">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                {/* Inner Card Content */}
                                <div className={`flex flex-col h-full w-full rounded-[calc(2rem-2px)] p-8 ${isSelected ? 'bg-[#242424]' : 'bg-[#242424]/40 hover:bg-[#242424]/60'}`}>

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                            {pack.name}
                                        </h3>
                                        <div className="text-4xl font-bold text-white mt-4">
                                            {Math.floor(pack.basePrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                                        </div>
                                    </div>

                                    {/* Features / Description */}
                                    <div className="flex-grow mb-8 text-center">
                                        <div className="text-white/80 text-sm leading-relaxed space-y-2">
                                            {pack.description ? (
                                                pack.description.split('\n').map((line, i) => (
                                                    <p key={i} className="flex items-center justify-center gap-2">
                                                        {line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`}
                                                    </p>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span>{pack.durationMin} Minutes Session</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Select Button */}
                                    <div
                                        className={`w-full py-3 rounded-full font-bold text-center transition-all duration-300 mt-auto
                                            ${isSelected
                                                ? 'text-black shadow-[0_0_20px_rgba(85,255,109,0.3)]'
                                                : 'bg-white text-black hover:bg-gray-200'
                                            }
                                        `}
                                        style={{
                                            background: isSelected
                                                ? "linear-gradient(90deg, rgba(113,255,123,1) 0%, rgba(31,139,255,1) 100%)"
                                                : ""
                                        }}
                                    >
                                        {isSelected ? "Selected" : "Select"}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {
                    validationErrors.pack && (
                        <p className="text-red-400 text-sm text-center">{validationErrors.pack}</p>
                    )
                }
            </div >
        );
    };

    const renderDecorSelection = () => {
        if (!config) return null;

        return (
            <div className="space-y-12 w-full max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight text-center">
                    Choose your <span className="italic-riccione font-normal">Decoration</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                    {config.decorOptions.map((decor) => {
                        const isSelected = formData.decorId === decor.id;

                        return (
                            <button
                                key={decor.id}
                                onClick={() => updateFormData({ decorId: decor.id })}
                                className={`relative overflow-hidden rounded-[2rem] transition-all duration-300 group h-[400px] ${isSelected
                                    ? "ring-4 ring-[#71ff7b] scale-[1.02] shadow-2xl shadow-[#71ff7b]/30"
                                    : "ring-2 ring-white/10 hover:ring-white/30 hover:scale-[1.01]"
                                    }`}
                            >
                                {/* Card Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1d2e] to-[#252837]" />

                                {/* Image Container - fill entire container */}
                                <div className="absolute inset-0">
                                    <img
                                        src={decor.imageUrl}
                                        alt={decor.name}
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-[#71ff7b]/10 pointer-events-none" />
                                    )}
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-[#71ff7b] flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-black"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSupplementSelection = () => {
        if (!config) return null;

        const totalPrice = calculateTotalPrice();

        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div className="relative flex items-center justify-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight text-center">
                        <span className="font-helvetica-medium">Add</span><br className="md:hidden" /> <span className="italic-riccione">supplements</span>
                    </h2>

                    {/* Total Price Pill - Absolute positioned to right */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg whitespace-nowrap">
                            Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                        </div>
                    </div>
                </div>

                {/* Mobile Total Price */}
                <div className="lg:hidden flex justify-center mb-8">
                    <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                        Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                    </div>
                </div>
                <div className="space-y-4">
                    {config.supplementServices.map((supplement) => (
                        <button
                            key={supplement.id}
                            onClick={() => handleToggleSupplement(supplement.id)}
                            className={`w-full p-4 sm:p-8 rounded-3xl border-2 transition-all duration-300 text-left flex items-center justify-between group ${formData.supplementIds.includes(supplement.id)
                                ? "border-primary-solid bg-[#242424]"
                                : "border-white/10 bg-[#242424] hover:border-white/30 hover:bg-[#242424]"
                                }`}
                        >
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1 font-helvetica-medium whitespace-nowrap">
                                    {supplement.name}
                                </h3>
                                <p className="text-base text-white/70 font-helvetica-medium mb-2">{supplement.description}</p>
                                <span className="text-2xl font-black text-white">
                                    €{supplement.price.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.supplementIds.includes(supplement.id)
                                        ? "bg-gradient-primary border-transparent"
                                        : "border-white/30 group-hover:border-white/50"
                                        }`}
                                >
                                    {formData.supplementIds.includes(supplement.id) && (
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div >
        );
    };

    const renderThemeSelection = () => {
        if (!config) return null;

        const totalPrice = calculateTotalPrice();

        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div className="relative flex items-center justify-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight text-center">
                        <span className="font-helvetica-medium">Choose</span><br className="md:hidden" /> <span className="italic-riccione">Your Theme</span>
                    </h2>

                </div>


                <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-semibold text-white/80 mb-2">
                            Podcast Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.podcastDescription}
                            onChange={(e) => updateFormData({ podcastDescription: e.target.value })}
                            rows={4}
                            className="w-full px-6 py-4 bg-[#242424] border-gradient rounded-2xl text-white focus:outline-none focus:bg-[#242424] transition-all resize-none text-lg placeholder:text-white/30"
                            placeholder="Describe your podcast and what you'd like to record..."
                        />
                        {validationErrors.podcastDescription && (
                            <p className="text-red-400 text-sm mt-1">{validationErrors.podcastDescription}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-white/80 mb-3">
                            Select a Theme or Create Custom
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {config.themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => updateFormData({ themeId: theme.id, customTheme: "" })}
                                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${formData.themeId === theme.id
                                        ? "border-primary-solid bg-[#242424]"
                                        : "border-white/10 bg-[#242424] hover:border-white/30 hover:bg-[#242424]"
                                        }`}
                                >
                                    <h3 className="text-lg font-bold text-white mb-1">{theme.name}</h3>
                                    <p className="text-sm text-white/70">{theme.description}</p>
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px bg-white/20"></div>
                                <span className="text-sm text-white/60 uppercase tracking-wide">Or</span>
                                <div className="flex-1 h-px bg-white/20"></div>
                            </div>
                            <input
                                type="text"
                                value={formData.customTheme}
                                onChange={(e) => updateFormData({ customTheme: e.target.value, themeId: undefined })}
                                className="w-full px-6 py-4 bg-[#242424] border-gradient rounded-2xl text-white focus:outline-none focus:bg-[#242424] transition-all text-lg placeholder:text-white/30"
                                placeholder="Enter a custom theme..."
                            />
                        </div>

                        {validationErrors.theme && (
                            <p className="text-red-400 text-sm mt-2">{validationErrors.theme}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDateTimeSelection = () => {
        const totalPrice = calculateTotalPrice();

        return (
            <div className="mt-32 space-y-8 w-full max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="relative flex items-center justify-center mb-12">
                    {/* Back Button - Absolute Left */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight text-center">
                        Select <br className="block md:hidden" /> <span className="italic-riccione font-normal">Date and Time</span>
                    </h2>
                </div>

                <PodcastCalendar
                    selectedDate={selectedDate ? new Date(selectedDate) : undefined}
                    onDateSelect={(date) => {
                        if (date) {
                            const dateStr = format(date, "yyyy-MM-dd");
                            setSelectedDate(dateStr);
                            updateFormData({ requestedDate: dateStr, requestedStartTime: undefined });
                        } else {
                            setSelectedDate("");
                            updateFormData({ requestedDate: undefined, requestedStartTime: undefined });
                        }
                    }}
                    selectedTime={formData.requestedStartTime}
                    onTimeSelect={(time) => {
                        updateFormData({ requestedStartTime: time });
                        setTimeout(() => {
                            continueButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                    }}
                    availability={availability}
                    loadingAvailability={loadingAvailability}
                />

            </div>
        );
    };

    const renderQuestions = () => {
        if (!config || config.questions.length === 0) return null;

        const question = config.questions[currentQuestionIndex];
        if (!question) return null;

        const totalPrice = calculateTotalPrice();

        const renderQuestionInput = () => {
            switch (question.questionType) {
                case "text":
                case "email":
                case "phone":
                case "number":
                case "date":
                    return (
                        <input
                            type={question.questionType}
                            value={formData.answers[question.id]?.answerText || ""}
                            onChange={(e) =>
                                handleAnswerChange(question.id, { questionId: question.id, answerText: e.target.value })
                            }
                            className="w-full px-6 py-4 bg-[#242424] border-gradient rounded-2xl text-white focus:outline-none focus:bg-[#242424] transition-all text-lg placeholder:text-white/30"
                            placeholder="Type your answer..."
                        />
                    );
                case "textarea":
                    return (
                        <textarea
                            value={formData.answers[question.id]?.answerText || ""}
                            onChange={(e) =>
                                handleAnswerChange(question.id, { questionId: question.id, answerText: e.target.value })
                            }
                            rows={4}
                            className="w-full px-6 py-4 bg-[#242424] border-gradient rounded-2xl text-white focus:outline-none focus:bg-[#242424] transition-all resize-none text-lg placeholder:text-white/30"
                            placeholder="Type your answer..."
                        />
                    );
                case "select":
                    return (
                        <select
                            value={formData.answers[question.id]?.answerOptionIds?.[0] || ""}
                            onChange={(e) =>
                                handleAnswerChange(question.id, {
                                    questionId: question.id,
                                    answerOptionIds: e.target.value ? [e.target.value] : [],
                                })
                            }
                            className="w-full px-6 py-4 bg-[#242424] border-gradient rounded-2xl text-white focus:outline-none focus:bg-[#242424] transition-all text-lg"
                        >
                            <option value="">Select an option</option>
                            {question.options.map((opt) => (
                                <option key={opt.id} value={opt.id} className="bg-black">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    );
                case "radio":
                    return (
                        <div className="space-y-3">
                            {question.options.map((opt) => (
                                <label
                                    key={opt.id}
                                    className="flex items-center gap-4 p-6 bg-[#242424] border border-white/10 rounded-2xl cursor-pointer hover:border-white/30 hover:bg-[#242424] transition-all"
                                >
                                    <input
                                        type="radio"
                                        name={question.id}
                                        checked={
                                            formData.answers[question.id]?.answerOptionIds?.[0] === opt.id
                                        }
                                        onChange={() =>
                                            handleAnswerChange(question.id, {
                                                questionId: question.id,
                                                answerOptionIds: [opt.id],
                                            })
                                        }
                                        className="w-6 h-6 text-primary accent-primary"
                                    />
                                    <span className="text-white text-lg font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    );
                case "multi_select":
                    return (
                        <div className="space-y-3">
                            {question.options.map((opt) => (
                                <label
                                    key={opt.id}
                                    className="flex items-center gap-4 p-6 bg-[#242424] border border-white/10 rounded-2xl cursor-pointer hover:border-white/30 hover:bg-[#242424] transition-all"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            formData.answers[question.id]?.answerOptionIds?.includes(
                                                opt.id
                                            ) || false
                                        }
                                        onChange={(e) => {
                                            const current =
                                                formData.answers[question.id]?.answerOptionIds || [];
                                            const updated = e.target.checked
                                                ? [...current, opt.id]
                                                : current.filter((id) => id !== opt.id);
                                            handleAnswerChange(question.id, {
                                                questionId: question.id,
                                                answerOptionIds: updated,
                                            });
                                        }}
                                        className="w-5 h-5 text-primary rounded"
                                    />
                                    <span className="text-white">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div className="relative flex items-center justify-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide text-center">
                        Question {currentQuestionIndex + 1} of {config.questions.length}
                    </h2>

                    {/* Total Price Pill - Absolute positioned to right */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg whitespace-nowrap">
                            Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                        </div>
                    </div>
                </div>

                {/* Mobile Total Price */}
                <div className="lg:hidden flex justify-center mb-8">
                    <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                        Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-xl text-white font-medium mb-2 block">
                            {question.label}
                            {question.isRequired && <span className="text-red-400 ml-1">*</span>}
                        </span>
                        {question.helpText && (
                            <span className="text-sm text-white/60 block mb-3">
                                {question.helpText}
                            </span>
                        )}
                        {renderQuestionInput()}
                    </label>
                    {validationErrors.question && (
                        <p className="text-red-400 text-sm">{validationErrors.question}</p>
                    )}
                </div>
            </div>
        );
    };

    const renderContactInfo = () => {
        const totalPrice = calculateTotalPrice();

        return (
            <div className="mt-32 space-y-8 w-full max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="relative flex items-center justify-center mb-12">
                    {/* Back Button - Absolute Left */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight text-center">
                        Contact <span className="italic-riccione font-normal">Information</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Left Column - Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-bold text-white mb-3">
                                Full name:
                            </label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => updateFormData({ customerName: e.target.value })}
                                className="w-full px-6 py-4 bg-[#242424] border-none rounded-2xl text-white/80 focus:outline-none focus:ring-2 focus:ring-[#71ff7b] transition-all text-lg placeholder:text-white/30"
                                placeholder="Your full name.."
                            />
                            {validationErrors.customerName && (
                                <p className="text-red-400 text-sm mt-2 pl-2">{validationErrors.customerName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-white mb-3">
                                Email:
                            </label>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => updateFormData({ customerEmail: e.target.value })}
                                className="w-full px-6 py-4 bg-[#242424] border-none rounded-2xl text-white/80 focus:outline-none focus:ring-2 focus:ring-[#71ff7b] transition-all text-lg placeholder:text-white/30"
                                placeholder="your@email.com"
                            />
                            {validationErrors.customerEmail && (
                                <p className="text-red-400 text-sm mt-2 pl-2">{validationErrors.customerEmail}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-white mb-3">
                                Phone:
                            </label>
                            <input
                                type="tel"
                                value={formData.customerPhone}
                                onChange={(e) => updateFormData({ customerPhone: e.target.value })}
                                className="w-full px-6 py-4 bg-[#242424] border-none rounded-2xl text-white/80 focus:outline-none focus:ring-2 focus:ring-[#71ff7b] transition-all text-lg placeholder:text-white/30"
                                placeholder="+213 745 27 84 85"
                            />
                        </div>
                    </div>

                    {/* Right Column - Notes */}
                    <div className="flex flex-col h-full">
                        <label className="block text-lg font-bold text-white mb-3">
                            Additional notes:
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => updateFormData({ notes: e.target.value })}
                            className="w-full flex-grow px-6 py-4 bg-[#242424] border-none rounded-2xl text-white/80 focus:outline-none focus:ring-2 focus:ring-[#71ff7b] transition-all text-lg placeholder:text-white/30 resize-none min-h-[200px]"
                            placeholder="Any specific requests or recommendations.."
                        />
                    </div>
                </div>


            </div>
        );
    };

    const renderReview = () => {
        if (!config) return null;

        const selectedPack = config.packOffers.find((p) => p.id === formData.packOfferId);
        const selectedDecor = config.decorOptions.find((d) => d.id === formData.decorId);
        const selectedSupplements = config.supplementServices.filter((s) =>
            formData.supplementIds.includes(s.id)
        );
        const selectedTheme = config.themes.find((t) => t.id === formData.themeId);
        const totalPrice = calculateTotalPrice();

        return (
            <div className="mt-16 sm:mt-32 w-full max-w-5xl mx-auto px-4 sm:px-6 font-sans">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12 relative flex items-center justify-center">
                    {/* Total Price Pill - Absolute positioned to center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg whitespace-nowrap">
                            Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                        </div>
                    </div>
                </div>

                {/* Mobile Total Price */}
                <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
                    <div className="bg-white text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-base sm:text-lg shadow-lg">
                        Total : {Math.floor(totalPrice).toLocaleString('fr-FR').replace(/\s/g, ' ')} DA
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-[#111111] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 md:p-16 shadow-2xl relative overflow-hidden border border-white/5">
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-x-12 md:gap-y-12">

                        {/* Package */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-[#888888] text-base sm:text-lg md:text-xl font-normal">Package</h3>
                            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">
                                {selectedPack?.name || "Not selected"}
                            </p>
                        </div>

                        {/* Supplements */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-[#888888] text-base sm:text-lg md:text-xl font-normal">Supplements</h3>
                            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">
                                {selectedSupplements.length > 0
                                    ? selectedSupplements.map(s => s.name).join(", ")
                                    : "None"}
                            </p>
                        </div>

                        {/* Theme */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-[#888888] text-base sm:text-lg md:text-xl font-normal">Theme</h3>
                            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">
                                {selectedTheme ? selectedTheme.name : formData.customTheme || "Not selected"}
                            </p>
                        </div>

                        {/* Podcast Description */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-[#888888] text-base sm:text-lg md:text-xl font-normal">Podcats description</h3>
                            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words line-clamp-3 sm:line-clamp-2">
                                {formData.podcastDescription || "No description"}
                            </p>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-[#888888] text-base sm:text-lg md:text-xl font-normal">Date and time</h3>
                            <div className="flex flex-col">
                                <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                                    {formData.requestedDate ? format(new Date(formData.requestedDate), "d MMM yyyy").toLowerCase() : "Date not set"}
                                </p>
                                <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                                    {formData.requestedStartTime || "Time not set"}
                                </p>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-[#888888] text-base sm:text-lg md:text-xl font-normal">Contact</h3>
                            <div className="flex flex-col space-y-0.5 sm:space-y-1">
                                <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">
                                    {formData.customerName || "Name not set"}
                                </p>
                                <p className="text-white text-base sm:text-lg md:text-2xl font-bold tracking-tight break-words">
                                    {formData.customerEmail || "Email not set"}
                                </p>
                                <p className="text-white text-base sm:text-lg md:text-2xl font-bold tracking-tight">
                                    {formData.customerPhone || "Phone not set"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    };

    // ============================================================================
    // Loading & Error States
    // ============================================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <img
                    ref={logoRef}
                    src="/mindaklogowhite.png"
                    alt="Mindak Logo"
                    className="w-32 md:w-48"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-6">
                <div className="text-center space-y-4">
                    <p className="text-red-400 text-xl">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Success State
    // ============================================================================

    if (submitSuccess && reservationId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 relative">
                <div className="text-center space-y-8 max-w-2xl">
                    {/* Gradient Checkmark Icon */}
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[#85f47b] via-[#4dd4ac] to-[#4583ff]">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    {/* Title - HelveticaNeue */}
                    <h1
                        className="text-5xl md:text-6xl font-bold text-white uppercase tracking-tight"
                        style={{ fontFamily: 'Helvetica Neue Medium, sans-serif' }}
                    >
                        RESERVATION<br />SUBMITTED!
                    </h1>

                    {/* Subtitle - Riccione Italic */}
                    <div className="space-y-2">
                        <p
                            className="text-lg text-white/70 italic-riccione"
                            style={{ fontFamily: 'Riccione Serial, serif' }}
                        >
                            Thank you for your reservation.
                        </p>
                        <p
                            className="text-lg text-white/70 italic-riccione"
                            style={{ fontFamily: 'Riccione Serial, serif' }}
                        >
                            We will hit you back as soon as possible &lt;3
                        </p>
                    </div>

                    {/* Circular Back Button */}
                    <div className="pt-12">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-white/30 hover:border-white/60 transition-all group"
                        >
                            <svg
                                className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    // ============================================================================
    // Main Form
    // ============================================================================

    return (
        <div>
            {/* Progress Bar - Full width at the very top */}
            <div className="w-full mb-12">
                <div className="flex gap-3">
                    {[1, 2, 3, 4].map((step) => {
                        const currentStepIndex = STEP_ORDER.indexOf(currentStep);
                        const currentProgressStep = Math.floor(currentStepIndex / 2) + 1;
                        return (
                            <div
                                key={step}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step <= currentProgressStep
                                    ? 'bg-white'
                                    : 'bg-gray-700'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="w-full max-w-[1200px] mx-auto">
                {/* Back Arrow - Below progress bar on the left */}
                {currentStep !== "datetime" && currentStep !== "contact" && (
                    <div className="mb-4 pl-0 pr-2">
                        <button
                            onClick={() => {
                                if (currentStep === "decor") {
                                    router.push("/");
                                } else {
                                    handlePrevious();
                                }
                            }}
                            className="relative z-50 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/20 hover:border-white/40 text-white/80 hover:text-white transition-all"
                        >
                            <svg
                                className="w-4 h-4 md:w-6 md:h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="w-full px-4 -mt-20">
                    <div ref={containerRef} className="space-y-12 pb-40">
                        {currentStep === "pack" && renderPackSelection()}
                        {currentStep === "decor" && renderDecorSelection()}
                        {currentStep === "supplements" && renderSupplementSelection()}
                        {currentStep === "theme" && renderThemeSelection()}
                        {currentStep === "datetime" && renderDateTimeSelection()}
                        {currentStep === "questions" && renderQuestions()}
                        {currentStep === "contact" && renderContactInfo()}
                        {currentStep === "review" && renderReview()}
                    </div>

                    {/* Navigation - Continue Button */}
                    <div
                        ref={continueButtonRef}
                        className={`group z-50 w-full max-w-md px-4 ${currentStep === "datetime"
                            ? "relative mx-auto mt-6"
                            : "fixed bottom-8 left-1/2 -translate-x-1/2"
                            }`}
                    >
                        <div className="absolute inset-0 duration-1000 opacity-80 transition-all rounded-full blur-lg filter group-hover:opacity-100 group-hover:duration-200" style={{ background: 'linear-gradient(90deg, rgba(113,255,123,1) 0%, rgba(31,139,255,1) 100%)' }} />
                        <button
                            onClick={currentStep === "review" ? handleSubmit : handleNext}
                            disabled={isSubmitting}
                            className="relative w-full bg-white text-black px-8 sm:px-12 md:px-16 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl md:text-2xl hover:opacity-90 transition-all"
                        >
                            {currentStep === "review"
                                ? (isSubmitting ? "Submitting..." : "Continue")
                                : "Continue"
                            }
                        </button>
                        {validationErrors.submit && currentStep === "review" && (
                            <p className="text-red-400 text-sm text-center mt-4">
                                {validationErrors.submit}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
