"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { getServices, getServicesFormQuestions, submitServiceReservation } from "@/lib/api/services";
import type { Service, Question, AnswerSubmission } from "@/types/api";

type FormStage = 'general' | 'services' | 'service-specific';

export function BriefingForm() {
  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [generalQuestions, setGeneralQuestions] = useState<Question[]>([]);
  const [serviceSpecificQuestions, setServiceSpecificQuestions] = useState<Question[]>([]);
  const [servicesFormData, setServicesFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formStage, setFormStage] = useState<FormStage>('general');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<Record<string, string | null>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Calculate current questions based on stage
  const currentQuestions = formStage === 'general' ? generalQuestions : serviceSpecificQuestions;
  const totalSteps = formStage === 'general' 
    ? generalQuestions.length + 1 // +1 for service selection
    : generalQuestions.length + 1 + serviceSpecificQuestions.length;
  const currentStep = formStage === 'general' 
    ? currentQuestionIndex 
    : formStage === 'services'
      ? generalQuestions.length
      : generalQuestions.length + 1 + currentQuestionIndex;
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  
  const currentQuestion = formStage === 'services' ? null : currentQuestions[currentQuestionIndex];
  const answer = currentQuestion ? (answers[currentQuestion.id] || "") : "";
  
  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Check if current answer is valid
  const isCurrentAnswerValid = (): boolean => {
    if (!currentQuestion) return false;
    
    // For email questions, validate email format
    if (currentQuestion.question_type === 'email') {
      return answer.trim().length > 0 && isValidEmail(answer.trim());
    }
    
    // For selection questions, check if answerId is set
    if (currentQuestion.question_type === 'select' || currentQuestion.question_type === 'radio' || currentQuestion.question_type === 'checkbox') {
      return !!selectedAnswerIds[currentQuestion.id];
    }
    
    // For other text inputs, just check if not empty
    return answer.trim().length > 0;
  };
  
  // Refs for animation targets
  const questionContainerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const answersContainerRef = useRef<HTMLDivElement>(null);
  const footerButtonsRef = useRef<HTMLDivElement>(null);

  // Helper function to get full image URL
  // Images are served through Next.js rewrites, so we can use relative paths
  const getImageUrl = (imagePath: string | undefined): string | null => {
    if (!imagePath) return null;
    return imagePath; // Next.js will rewrite /uploads/* to the backend
  };

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll detection for answer containers
  useEffect(() => {
    const container = answersContainerRef.current;
    if (!container || !isMobile) {
      setIsScrolledToBottom(true); // On desktop, always show buttons
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setIsScrolledToBottom(isBottom);
    };

    // Check initial state
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMobile, formStage, currentQuestionIndex]);

  // Fetch services and questions on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch services and form questions in parallel
        const [servicesData, questionsData] = await Promise.all([
          getServices(),
          getServicesFormQuestions(),
        ]);

        setServices(servicesData);
        setServicesFormData(questionsData);
        
        // Sort general questions by order field
        const sortedGeneralQuestions = [...questionsData.general].sort((a, b) => a.order - b.order);
        setGeneralQuestions(sortedGeneralQuestions);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError(err instanceof Error ? err.message : "Failed to load form");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update service-specific questions when services are selected
  useEffect(() => {
    if (selectedServices.length > 0 && servicesFormData) {
      const serviceQuestions: Question[] = [];
      
      // Add service-specific questions for selected services
      selectedServices.forEach(serviceId => {
        const serviceData = servicesFormData.services.find(
          (s: any) => s.service_id === serviceId
        );
        if (serviceData && serviceData.questions) {
          serviceQuestions.push(...serviceData.questions);
        }
      });
      
      // Sort by order field
      serviceQuestions.sort((a, b) => a.order - b.order);
      setServiceSpecificQuestions(serviceQuestions);
    } else {
      setServiceSpecificQuestions([]);
    }
  }, [selectedServices, servicesFormData]);

  const handleNext = async () => {
    if (isAnimating) return;
    
    // Validate current answer before proceeding
    if (formStage !== 'services' && !isCurrentAnswerValid()) {
      // Show error for invalid input
      if (currentQuestion?.question_type === 'email') {
        setError('Please enter a valid email address');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }
    
    // Check if this is the final step and should submit
    const shouldSubmit = 
      (formStage === 'service-specific' && currentQuestionIndex === serviceSpecificQuestions.length - 1) ||
      (formStage === 'services' && serviceSpecificQuestions.length === 0);
    
    if (shouldSubmit) {
      // Submit the form directly without animation
      await handleSubmit();
      return;
    }
    
    setIsAnimating(true);
    
    // Create timeline for smooth transition
    const tl = gsap.timeline({
      onComplete: () => {
        // Determine next stage
        if (formStage === 'general') {
          if (currentQuestionIndex < generalQuestions.length - 1) {
            // Move to next general question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
            // Move to service selection
            setFormStage('services');
            setCurrentQuestionIndex(0);
          }
        } else if (formStage === 'services') {
          // Move to service-specific questions
          if (serviceSpecificQuestions.length > 0) {
            setFormStage('service-specific');
            setCurrentQuestionIndex(0);
          }
        } else if (formStage === 'service-specific') {
          if (currentQuestionIndex < serviceSpecificQuestions.length - 1) {
            // Move to next service-specific question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
        }
        setIsAnimating(false);
      }
    });
    
    // Animate current question out (upward)
    const elementsToAnimate = [labelRef.current, inputRef.current].filter(Boolean);
    tl.to(elementsToAnimate, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.05
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate that services are selected
      if (selectedServices.length === 0) {
        setError("Please select at least one service");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare answers for submission
      const answerSubmissions: AnswerSubmission[] = Object.entries(answers)
        .filter(([_, value]) => value && value.trim()) // Only include non-empty answers
        .map(([questionId, value]) => ({
          questionId,
          value: value.trim(),
          answerId: selectedAnswerIds[questionId] || null,
        }));
      
      const submissionData = {
        serviceIds: selectedServices,
        answers: answerSubmissions,
      };
      
      console.log("Submitting reservation:", submissionData);
      
      // Submit the reservation
      const result = await submitServiceReservation(submissionData);
      
      setConfirmationData(result);
    } catch (err) {
      console.error("Error submitting reservation:", err);
      setError(err instanceof Error ? err.message : "Failed to submit reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (isAnimating) return;
    
    // Don't allow going back from the first general question
    if (formStage === 'general' && currentQuestionIndex === 0) return;
    
    setIsAnimating(true);
    
    // Create timeline for smooth transition
    const tl = gsap.timeline({
      onComplete: () => {
        // Determine previous stage
        if (formStage === 'general' && currentQuestionIndex > 0) {
          // Move to previous general question
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (formStage === 'services') {
          // Move back to last general question
          setFormStage('general');
          setCurrentQuestionIndex(generalQuestions.length - 1);
        } else if (formStage === 'service-specific') {
          if (currentQuestionIndex > 0) {
            // Move to previous service-specific question
            setCurrentQuestionIndex(currentQuestionIndex - 1);
          } else {
            // Move back to service selection
            setFormStage('services');
            setCurrentQuestionIndex(0);
          }
        }
        setIsAnimating(false);
      }
    });
    
    // Animate current question out (upward)
    const elementsToAnimate = [labelRef.current, inputRef.current].filter(Boolean);
    tl.to(elementsToAnimate, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.05
    });
  };

  const handleAnswerChange = (value: string, answerId?: string | null) => {
    if (currentQuestion) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: value,
      });
      
      // Store answerId for questions with predefined answers
      if (answerId !== undefined) {
        setSelectedAnswerIds({
          ...selectedAnswerIds,
          [currentQuestion.id]: answerId,
        });
      }
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSelection = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      return newSelection;
    });
  };
  
  // Animate in new question when step changes
  useEffect(() => {
    // Reset validity tracking when question changes
    prevValidityRef.current = false;
    
    if (questionContainerRef.current) {
      // Collect elements that exist
      const elementsToAnimate = [labelRef.current, inputRef.current].filter(Boolean);
      
      // Set initial state (from bottom, invisible)
      gsap.set(elementsToAnimate, {
        y: 100,
        opacity: 0
      });
      
      // Animate in from bottom
      gsap.to(elementsToAnimate, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.1
      });
    }
  }, [formStage, currentQuestionIndex]);

  // Get primary color from design system
  const getPrimaryColor = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim();
      const primaryForegroundColor = getComputedStyle(root).getPropertyValue('--primary-foreground').trim();
      return {
        background: primaryColor || 'oklch(0.6522 0.1912 251.8346)',
        foreground: primaryForegroundColor || 'oklch(1.0000 0 0)',
      };
    }
    return {
      background: 'oklch(0.6522 0.1912 251.8346)',
      foreground: 'oklch(1.0000 0 0)',
    };
  };

  // Track previous validity state to prevent unnecessary animations
  const prevValidityRef = useRef<boolean>(false);
  
  // Animate Next button visibility based on answer validity and scroll state
  useEffect(() => {
    const hasContent = (formStage === 'services' && selectedServices.length > 0) || 
      (formStage !== 'services' && isCurrentAnswerValid());
    
    // On mobile, also check if scrolled to bottom
    const shouldShowButton = hasContent && (isMobile ? isScrolledToBottom : true);
    
    // Only animate if visibility state has changed
    if (shouldShowButton === prevValidityRef.current) {
      return;
    }
    
    prevValidityRef.current = shouldShowButton;
    
    if (nextButtonRef.current) {
      // Get colors from design system
      const colors = getPrimaryColor();
      // Always ensure colors are set, especially for services stage
      nextButtonRef.current.style.setProperty('background-color', colors.background, 'important');
      nextButtonRef.current.style.setProperty('color', colors.foreground, 'important');
      
      // Kill any existing animations on this element to prevent conflicts
      gsap.killTweensOf(nextButtonRef.current);
      
      if (shouldShowButton) {
        // Fade in and slide up when answer is provided and scrolled to bottom
        gsap.to(nextButtonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: false, // Don't clear inline styles
        });
      } else {
        // Fade out and slide down when answer is cleared or not scrolled to bottom
        gsap.to(nextButtonRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: "power2.in",
          clearProps: false, // Don't clear inline styles
        });
      }
    }
  }, [answer, formStage, selectedServices.length, currentQuestion?.id, selectedAnswerIds, isScrolledToBottom, isMobile]);
  
  // Animate footer buttons (Previous Question) on mobile based on scroll state
  useEffect(() => {
    if (!footerButtonsRef.current || !isMobile) return;
    
    // Kill any existing animations
    gsap.killTweensOf(footerButtonsRef.current);
    
    if (isScrolledToBottom) {
      // Fade in and slide up when scrolled to bottom
      gsap.to(footerButtonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      // Fade out and slide down when not at bottom
      gsap.to(footerButtonsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [isScrolledToBottom, isMobile, formStage, currentQuestionIndex]);

  // Specifically handle services stage button colors
  useEffect(() => {
    if (formStage === 'services' && nextButtonRef.current && selectedServices.length > 0) {
      // Get colors from design system
      const colors = getPrimaryColor();
      // Force set colors when in services stage
      nextButtonRef.current.style.setProperty('background-color', colors.background, 'important');
      nextButtonRef.current.style.setProperty('color', colors.foreground, 'important');
    }
  }, [formStage, selectedServices.length]);

  // Show loading state
  if (loading) {
    return (
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#000000",
          padding: "clamp(12px, 3vw, 19.2px)",
        }}
      >
        <div style={{
          color: "hsl(60, 14%, 95%)",
          fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
          fontSize: "clamp(18px, 3vw, 24px)",
          textAlign: "center",
        }}>
          Loading form...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#000000",
          padding: "clamp(12px, 3vw, 19.2px)",
        }}
      >
        <div style={{
          color: "hsl(0, 70%, 60%)",
          fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
          fontSize: "clamp(18px, 3vw, 24px)",
          textAlign: "center",
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  // Show confirmation state
  if (confirmationData) {
    return (
      <div 
        className="relative min-h-screen flex flex-col items-center justify-center gap-8"
        style={{
          backgroundColor: "#000000",
          padding: "clamp(24px, 5vw, 48px)",
        }}
      >
        <h1 
          className="text-center uppercase"
          style={{
            color: "#FFFFFF",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            fontSize: "clamp(20px, 5vw, 64px)",
            fontWeight: 800,
            letterSpacing: "0.02em",
            lineHeight: "1.2",
            maxWidth: "95vw",
            wordBreak: "keep-all" as const,
            whiteSpace: "nowrap" as const,
          }}
        >
          THANK YOU FOR YOUR TIME
          <br />
          WE WILL GET TO YOU SHORTLY
        </h1>
        <Link 
          href="/"
          className="uppercase bg-primary text-primary-foreground hover:opacity-90"
          style={{
            display: "inline-block",
            padding: "clamp(14px, 2.5vw, 18px) clamp(40px, 8vw, 80px)",
            borderRadius: "var(--radius)",
            fontSize: "clamp(14px, 2vw, 18px)",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textDecoration: "none",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            transition: "opacity 0.2s ease",
          }}
        >
          RETURN TO MAIN
        </Link>
      </div>
    );
  }

  // Show form if we have questions or are in service selection stage
  if (!currentQuestion && formStage !== 'services') {
    return null;
  }

  return (
    <div 
      className="relative min-h-screen flex flex-col box-border"
      style={{
        backgroundColor: "#000000",
        padding: "clamp(12px, 3vw, 19.2px)",
      }}
    >
      {/* Header */}
      <header 
        className="flex items-start justify-between relative box-border"
        style={{
          padding: "clamp(12px, 3vw, 19.2px) clamp(12px, 3vw, 19.2px) 0px",
        }}
      >
        {/* Back Link */}
        <Link 
          href="/"
          className="flex items-center gap-[4.8px] cursor-pointer"
          style={{
            color: "hsl(60, 14%, 95%)",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            fontSize: "clamp(14px, 2.5vw, 19.2px)",
            fontWeight: 500,
            letterSpacing: "0.5px",
            lineHeight: "1.2",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
            style={{
              display: "inline",
              overflow: "hidden",
            }}
          >
            <path 
              d="M10 4L6 8L10 12" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden md:inline">BACK TO THE MAIN SITE</span>
          <span className="md:hidden">BACK</span>
        </Link>

        {/* Briefing Label */}
        <div
          style={{
            color: "hsl(60, 15%, 95%)",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            fontSize: "clamp(14px, 2.5vw, 19.2px)",
            fontWeight: 500,
            letterSpacing: "0.5px",
            lineHeight: "1.2",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          BRIEFING
        </div>
      </header>

      {/* Main Form Content */}
      <main 
        className="flex-1 flex items-center justify-center flex-col relative"
        style={{
          padding: "clamp(24px, 5vw, 48px) clamp(12px, 3vw, 19.2px)",
        }}
      >
        <div 
          ref={questionContainerRef}
          className="flex flex-col items-center justify-center relative w-full"
          style={{
            gap: "clamp(32px, 6vw, 48px)",
          }}
        >
          {/* Hero Title */}
          <label
            ref={labelRef}
            htmlFor="field-1"
            style={{
              color: "hsl(60, 14%, 95%)",
              fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
              fontSize: "clamp(20px, 4vw, 38.4px)",
              fontWeight: 800,
              letterSpacing: "clamp(0.5px, 0.15vw, 1.6px)",
              lineHeight: "1.2",
              textAlign: "center",
              textTransform: "uppercase",
              WebkitFontSmoothing: "antialiased",
              cursor: "default",
              maxWidth: "100%",
              wordWrap: "break-word",
              padding: "0 clamp(12px, 3vw, 24px)",
            }}
          >
            {formStage === 'services' ? 'Which services are you interested in?' : currentQuestion?.question_text}
          </label>

          {/* Input Field or Service Selection */}
          {formStage === 'services' ? (
            <div 
              ref={inputRef} 
              className="relative w-full overflow-y-auto"
              style={{
                maxHeight: "calc(100vh - 400px)",
                minHeight: "200px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.3);
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(255, 255, 255, 0.5);
                }
              `}</style>
              <div 
                className="grid"
                style={{
                  gap: "clamp(8px, 1.5vw, 9.6px)",
                  gridTemplateColumns: "repeat(auto-fit, minmax(clamp(140px, 20vw, 209.663px), 1fr))",
                  gridAutoRows: "clamp(100px, 18vw, 140.788px)",
                  justifyContent: "center",
                  alignContent: "center",
                  maxWidth: "1300px",
                  margin: "0 auto",
                  padding: "0 clamp(8px, 2vw, 16px)",
                  paddingBottom: "clamp(16px, 3vw, 24px)",
                }}
              >
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <label
                      key={service.id}
                      className="relative cursor-pointer group"
                      style={{
                        borderRadius: "16px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleServiceToggle(service.id)}
                        className="absolute opacity-0 w-0 h-0"
                        style={{
                          cursor: "pointer",
                        }}
                      />
                      <div
                        className="h-full flex items-center justify-center text-center px-4 relative"
                        style={{
                          borderRadius: "clamp(12px, 2vw, 16px)",
                          border: isSelected 
                            ? "2.5px solid var(--primary)" 
                            : "1.5px solid rgba(255, 255, 255, 0.15)",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          color: "#FFFFFF",
                          fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                          fontSize: "clamp(14px, 2vw, 18px)",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          transition: "all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)",
                          whiteSpace: "pre-line",
                          lineHeight: "1.2",
                          padding: "clamp(8px, 2vw, 16px)",
                        }}
                      >
                        {service.name}
                        {isSelected && (
                          <div
                            className="absolute"
                            style={{
                              top: "clamp(8px, 1.5vw, 12px)",
                              right: "clamp(8px, 1.5vw, 12px)",
                              width: "clamp(24px, 4vw, 32px)",
                              height: "clamp(24px, 4vw, 32px)",
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="clamp(12, 2.5vw, 16)"
                              height="clamp(12, 2.5vw, 16)"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{
                                width: "clamp(12px, 2.5vw, 16px)",
                                height: "clamp(12px, 2.5vw, 16px)",
                              }}
                            >
                              <path
                                d="M3 8L6.5 11.5L13 5"
                                stroke="var(--primary)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : currentQuestion && (currentQuestion.question_type === 'select' || currentQuestion.question_type === 'radio') && currentQuestion.answers.length > 0 ? (
            <div ref={inputRef} className="relative w-full max-w-[600px]">
              <div 
                ref={answersContainerRef}
                className="flex flex-col gap-3 overflow-y-auto"
                style={{
                  maxHeight: isMobile 
                    ? 'calc(100vh - 350px)' 
                    : currentQuestion.answers.length > 4 
                      ? 'calc(4 * (clamp(56px, 10vw, 72px) + 12px))' 
                      : 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
                  paddingRight: '4px',
                  position: 'relative',
                }}
                role="radiogroup"
                aria-label={currentQuestion.question_text}
                tabIndex={0}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 6px;
                  }
                  div::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                  }
                  @keyframes bounce {
                    0%, 100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-10px);
                    }
                  }
                `}</style>
                {/* Scroll indicator for mobile */}
                {isMobile && !isScrolledToBottom && currentQuestion.answers.length > 4 && (
                  <div
                    className="sticky bottom-0 left-0 right-0 pointer-events-none"
                    style={{
                      height: '60px',
                      background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8))',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingBottom: '12px',
                      zIndex: 10,
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        animation: 'bounce 2s infinite',
                      }}
                    >
                      <path
                        d="M12 5V19M12 19L5 12M12 19L19 12"
                        stroke="rgba(255, 255, 255, 0.6)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                {currentQuestion.answers.sort((a, b) => a.order - b.order).map((answerOption) => (
                  <label
                    key={answerOption.id}
                    className="relative cursor-pointer group"
                    style={{
                      borderRadius: "12px",
                      minHeight: "clamp(56px, 10vw, 72px)",
                    }}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      checked={selectedAnswerIds[currentQuestion.id] === answerOption.id}
                      onChange={() => handleAnswerChange(answerOption.answer_text, answerOption.id)}
                      className="absolute opacity-0 w-0 h-0"
                      aria-label={answerOption.answer_text}
                    />
                    <div
                      className="px-6 py-4 text-center h-full flex items-center justify-center gap-3"
                      style={{
                        borderRadius: "12px",
                        border: selectedAnswerIds[currentQuestion.id] === answerOption.id
                          ? "2.5px solid var(--primary)"
                          : "1.5px solid rgba(255, 255, 255, 0.15)",
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        color: "#FFFFFF",
                        fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                        fontSize: "clamp(16px, 2.5vw, 20px)",
                        fontWeight: 500,
                        transition: "all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)",
                        minHeight: "clamp(56px, 10vw, 72px)",
                      }}
                    >
                      {answerOption.answer_metadata?.image && (
                        <img
                          src={getImageUrl(answerOption.answer_metadata.image) || ""}
                          alt={answerOption.answer_text}
                          loading="lazy"
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                      {answerOption.answer_text}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : currentQuestion && currentQuestion.question_type === 'checkbox' && currentQuestion.answers.length > 0 ? (
            <div ref={inputRef} className="relative w-full max-w-[600px]">
              <div 
                ref={answersContainerRef}
                className="flex flex-col gap-3 overflow-y-auto"
                style={{
                  maxHeight: isMobile 
                    ? 'calc(100vh - 350px)' 
                    : currentQuestion.answers.length > 4 
                      ? 'calc(4 * (clamp(56px, 10vw, 72px) + 12px))' 
                      : 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
                  paddingRight: '4px',
                  position: 'relative',
                }}
                role="group"
                aria-label={currentQuestion.question_text}
                tabIndex={0}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 6px;
                  }
                  div::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                  }
                  @keyframes bounce {
                    0%, 100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-10px);
                    }
                  }
                `}</style>
                {/* Scroll indicator for mobile */}
                {isMobile && !isScrolledToBottom && currentQuestion.answers.length > 4 && (
                  <div
                    className="sticky bottom-0 left-0 right-0 pointer-events-none"
                    style={{
                      height: '60px',
                      background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8))',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingBottom: '12px',
                      zIndex: 10,
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        animation: 'bounce 2s infinite',
                      }}
                    >
                      <path
                        d="M12 5V19M12 19L5 12M12 19L19 12"
                        stroke="rgba(255, 255, 255, 0.6)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                {currentQuestion.answers.sort((a, b) => a.order - b.order).map((answerOption) => {
                  const selectedAnswers = answer.split(',').map(a => a.trim()).filter(Boolean);
                  const isSelected = selectedAnswers.includes(answerOption.answer_text);
                  
                  return (
                    <label
                      key={answerOption.id}
                      className="relative cursor-pointer group"
                      style={{
                        borderRadius: "12px",
                        minHeight: "clamp(56px, 10vw, 72px)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newSelectedAnswers = isSelected
                            ? selectedAnswers.filter(a => a !== answerOption.answer_text)
                            : [...selectedAnswers, answerOption.answer_text];
                          const newValue = newSelectedAnswers.join(', ');
                          const newAnswerIds = isSelected
                            ? (selectedAnswerIds[currentQuestion.id] || '').split(',').filter(id => id !== answerOption.id).join(',')
                            : [(selectedAnswerIds[currentQuestion.id] || ''), answerOption.id].filter(Boolean).join(',');
                          handleAnswerChange(newValue, newAnswerIds);
                        }}
                        className="absolute opacity-0 w-0 h-0"
                        aria-label={answerOption.answer_text}
                      />
                      <div
                        className="px-6 py-4 text-center relative h-full flex items-center justify-center"
                        style={{
                          borderRadius: "12px",
                          border: isSelected
                            ? "2.5px solid var(--primary)"
                            : "1.5px solid rgba(255, 255, 255, 0.15)",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          color: "#FFFFFF",
                          fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                          fontSize: "clamp(16px, 2.5vw, 20px)",
                          fontWeight: 500,
                          transition: "all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)",
                          minHeight: "clamp(56px, 10vw, 72px)",
                        }}
                      >
                        {answerOption.answer_text}
                        {isSelected && (
                          <div
                            className="absolute"
                            style={{
                              top: "12px",
                              right: "12px",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M3 8L6.5 11.5L13 5"
                                stroke="var(--primary)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div ref={inputRef} className="relative w-full max-w-[600px]">
            <input
              id="field-1"
              type={currentQuestion?.question_type === 'email' ? 'email' : currentQuestion?.question_type === 'number' ? 'number' : currentQuestion?.question_type === 'url' ? 'url' : 'text'}
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isCurrentAnswerValid()) {
                  e.preventDefault();
                  handleNext();
                }
              }}
              placeholder={currentQuestion?.placeholder || "Type your answer here"}
              className="w-full bg-transparent outline-none"
              style={{
                borderBottom: currentQuestion?.question_type === 'email' && answer.trim() && !isValidEmail(answer.trim())
                  ? "0.8px solid hsl(0, 70%, 60%)"
                  : "0.8px solid hsl(60, 1%, 28%)",
                padding: "0px clamp(12px, 3vw, 24px)",
                paddingBottom: "2px",
                color: "hsl(60, 14%, 95%)",
                fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                fontSize: "clamp(18px, 3vw, 24px)",
                fontWeight: 400,
                lineHeight: "1.2",
                textAlign: "center",
                transition: "border 0.25s ease-in",
              }}
              onFocus={(e) => {
                if (currentQuestion?.question_type === 'email' && answer.trim() && !isValidEmail(answer.trim())) {
                  e.target.style.borderBottom = "0.8px solid hsl(0, 70%, 60%)";
                } else {
                  e.target.style.borderBottom = "0.8px solid hsl(60, 14%, 95%)";
                }
              }}
              onBlur={(e) => {
                if (currentQuestion?.question_type === 'email' && answer.trim() && !isValidEmail(answer.trim())) {
                  e.target.style.borderBottom = "0.8px solid hsl(0, 70%, 60%)";
                } else {
                  e.target.style.borderBottom = "0.8px solid hsl(60, 1%, 28%)";
                }
              }}
            />
            {currentQuestion?.question_type === 'email' && answer.trim() && !isValidEmail(answer.trim()) && (
              <div
                style={{
                  marginTop: "8px",
                  color: "hsl(0, 70%, 60%)",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                  textAlign: "center",
                }}
              >
                Please enter a valid email address
              </div>
            )}
            <style jsx>{`
              input::placeholder {
                color: hsl(60, 1%, 28%);
                opacity: 1;
              }
            `}</style>
          </div>
          )}

          {/* Next Button - Shows when user provides valid answer or selects services */}
          {((formStage === 'services' && selectedServices.length > 0) || (formStage !== 'services' && isCurrentAnswerValid())) && (
            <button
              ref={nextButtonRef}
              onClick={handleNext}
              disabled={isAnimating || isSubmitting}
              className="absolute hover:opacity-90 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                bottom: "clamp(-80px, -15vw, -120px)",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "clamp(12px, 2vw, 16px) clamp(32px, 6vw, 48px)",
                border: "none",
                cursor: "pointer",
                fontSize: "clamp(16px, 2.5vw, 19.2px)",
                fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                opacity: 0,
                whiteSpace: "nowrap",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
              aria-label={
                (formStage === 'service-specific' && currentQuestionIndex === serviceSpecificQuestions.length - 1) ||
                (formStage === 'services' && serviceSpecificQuestions.length === 0)
                  ? 'Submit form'
                  : 'Go to next question'
              }
            >
              {(formStage === 'service-specific' && currentQuestionIndex === serviceSpecificQuestions.length - 1) ||
               (formStage === 'services' && serviceSpecificQuestions.length === 0)
                ? 'Submit'
                : 'Next'}
            </button>
          )}
        </div>
      </main>

      {/* Progress Footer */}
      <footer 
        className="relative flex items-center justify-between flex-wrap gap-4"
        style={{
          padding: "0 clamp(12px, 3vw, 19.2px) 0",
        }}
      >
        {/* Left side - Progress Text */}
        <div
          style={{
            color: "hsl(60, 14%, 95%)",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            fontSize: "clamp(16px, 2.5vw, 19.2px)",
            fontWeight: 500,
            letterSpacing: "0.5px",
            lineHeight: "1.2",
            marginBottom: "clamp(12px, 3vw, 19.2px)",
          }}
        >
       {currentStep + 1}<span style={{ padding: '0 16px' }}> / </span>{totalSteps}
        </div>

        {/* Right side - Previous Question Button */}
        {(formStage !== 'general' || currentQuestionIndex > 0) && (
          <div
            ref={footerButtonsRef}
            style={{
              opacity: isMobile ? 0 : 1,
            }}
          >
            <button
              onClick={handlePrevious}
              className="text-muted-foreground md:absolute md:left-1/2 md:transform md:-translate-x-1/2"
              style={{
                fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
                fontSize: "clamp(12px, 2vw, 16px)",
                fontWeight: 500,
                letterSpacing: "0.5px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                marginBottom: "clamp(12px, 3vw, 19.2px)",
              }}
              aria-label="Go to previous question"
            >
              PREVIOUS QUESTION
            </button>
          </div>
        )}

      </footer>

      {/* Progress Bar - Positioned at the very bottom of the container */}
      <div 
        className="absolute bottom-0 bg-muted"
        style={{
          height: "clamp(3px, 0.5vw, 4px)",
          marginBottom: "0",
          left: "clamp(12px, 3vw, 19.2px)",
          right: "clamp(12px, 3vw, 19.2px)",
          width: "auto",
        }}
      >
        <div
          className="absolute top-0 left-0 h-full transition-all duration-300 bg-primary"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
    </div>
  );
}
