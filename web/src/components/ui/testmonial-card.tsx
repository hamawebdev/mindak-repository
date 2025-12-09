import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export interface TestimonialAuthor {
    name: string
    handle: string
    avatar: string
}

export interface TestimonialCardProps {
    author: TestimonialAuthor
    text: string
    href?: string
    className?: string
}

export function TestimonialCard({
    author,
    text,
    href,
    className
}: TestimonialCardProps) {
    const Card = href ? 'a' : 'div'

    return (
        <Card
            {...(href ? { href } : {})}
            className={cn(
                "flex flex-col justify-between rounded-xl",
                "bg-white",
                "p-6 text-start sm:p-8",
                "hover:bg-gray-50",
                "w-[300px] sm:w-[350px] h-[300px]", // Fixed size for consistency
                "transition-colors duration-300",
                className
            )}
        >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        className="w-4 h-4 fill-[#FCD34D] text-[#FCD34D]" 
                    />
                ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-[15px] leading-relaxed text-gray-500 font-normal line-clamp-4 mb-6">
                {text}
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-3 mt-auto">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={author.avatar} alt={author.name} className="object-cover" />
                </Avatar>
                <div className="flex flex-col items-start">
                    <h3 className="text-sm font-bold leading-none text-black mb-1">
                        {author.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                        {author.handle.replace('@', '')}
                    </p>
                </div>
            </div>
        </Card>
    )
}