"use client"

import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "./testmonial-card"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface TestimonialsSectionProps {
  title?: string
  description?: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
  renderSection?: boolean
}

export function TestimonialsSection({
  title,
  description = "",
  testimonials,
  className,
  renderSection = true
}: TestimonialsSectionProps) {
  const marqueeRef1 = useRef<HTMLDivElement>(null)
  const marqueeRef2 = useRef<HTMLDivElement>(null)

  const animation1Ref = useRef<gsap.core.Tween | null>(null)
  const animation2Ref = useRef<gsap.core.Tween | null>(null)

  const clickTimeout1 = useRef<NodeJS.Timeout | null>(null)
  const clickTimeout2 = useRef<NodeJS.Timeout | null>(null)

  const isHovering1 = useRef(false)
  const isHovering2 = useRef(false)

  useEffect(() => {
    if (!marqueeRef1.current || !marqueeRef2.current) return

    const marquee1 = marqueeRef1.current
    const marquee2 = marqueeRef2.current

    // Using 4 sets for seamless looping on large screens
    const REPEAT_COUNT = 4

    // Get the width of one set of cards
    const marqueeWidth1 = marquee1.scrollWidth / REPEAT_COUNT
    const marqueeWidth2 = marquee2.scrollWidth / REPEAT_COUNT

    // Row 1: Left to Right
    // Start shifted left by one set width, animate to 0
    gsap.set(marquee1, { x: -marqueeWidth1 })
    const animation1 = gsap.to(marquee1, {
      x: 0,
      duration: 40,
      ease: "none",
      repeat: -1,
    })
    animation1Ref.current = animation1

    // Row 2: Right to Left
    // Start at 0, animate left by one set width
    gsap.set(marquee2, { x: 0 })
    const animation2 = gsap.to(marquee2, {
      x: -marqueeWidth2,
      duration: 40,
      ease: "none",
      repeat: -1,
    })
    animation2Ref.current = animation2

    return () => {
      animation1.kill()
      animation2.kill()
    }
  }, [testimonials])

  useEffect(() => {
    return () => {
      if (clickTimeout1.current) clearTimeout(clickTimeout1.current)
      if (clickTimeout2.current) clearTimeout(clickTimeout2.current)
    }
  }, [])

  // Handlers for Row 1
  const handleMouseEnter1 = () => {
    isHovering1.current = true
    animation1Ref.current?.pause()
  }

  const handleMouseLeave1 = () => {
    isHovering1.current = false
    if (!clickTimeout1.current) {
      animation1Ref.current?.play()
    }
  }

  const handleClick1 = () => {
    animation1Ref.current?.pause()
    if (clickTimeout1.current) {
      clearTimeout(clickTimeout1.current)
    }
    clickTimeout1.current = setTimeout(() => {
      clickTimeout1.current = null
      if (!isHovering1.current) {
        animation1Ref.current?.play()
      }
    }, 10000)
  }

  // Handlers for Row 2
  const handleMouseEnter2 = () => {
    isHovering2.current = true
    animation2Ref.current?.pause()
  }

  const handleMouseLeave2 = () => {
    isHovering2.current = false
    if (!clickTimeout2.current) {
      animation2Ref.current?.play()
    }
  }

  const handleClick2 = () => {
    animation2Ref.current?.pause()
    if (clickTimeout2.current) {
      clearTimeout(clickTimeout2.current)
    }
    clickTimeout2.current = setTimeout(() => {
      clickTimeout2.current = null
      if (!isHovering2.current) {
        animation2Ref.current?.play()
      }
    }, 10000)
  }


  // Split testimonials into two rows
  const midPoint = Math.ceil(testimonials.length / 2)
  const row1Testimonials = testimonials.slice(0, midPoint)
  const row2Testimonials = testimonials.slice(midPoint)

  const content = (
    <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
      {title && (
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-md max-w-[600px] font-medium text-white/70 sm:text-xl">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative flex w-full flex-col gap-4 overflow-hidden">
        {/* First Row - Left to Right */}
        <div
          className="flex overflow-hidden p-2 flex-row cursor-pointer"
          onMouseEnter={handleMouseEnter1}
          onMouseLeave={handleMouseLeave1}
          onClick={handleClick1}
        >
          <div
            ref={marqueeRef1}
            className="flex shrink-0 gap-4 flex-row"
          >
            {/* Repeat 4 times for seamless looping */}
            {[...Array(4)].map((_, setIndex) => (
              row1Testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`row1-set${setIndex}-${i}`}
                  {...testimonial}
                />
              ))
            ))}
          </div>
        </div>

        {/* Second Row - Right to Left */}
        <div
          className="flex overflow-hidden p-2 flex-row cursor-pointer"
          onMouseEnter={handleMouseEnter2}
          onMouseLeave={handleMouseLeave2}
          onClick={handleClick2}
        >
          <div
            ref={marqueeRef2}
            className="flex shrink-0 gap-4 flex-row"
          >
            {/* Repeat 4 times for seamless looping */}
            {[...Array(4)].map((_, setIndex) => (
              row2Testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`row2-set${setIndex}-${i}`}
                  {...testimonial}
                />
              ))
            ))}
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black to-transparent z-10" />
      </div>
    </div>
  )

  return renderSection ? (
    <section className={cn(
      "bg-black text-white",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      {content}
    </section>
  ) : content
}
