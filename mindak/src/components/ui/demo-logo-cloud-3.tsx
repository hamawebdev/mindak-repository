import { cn } from "@/lib/utils";
import { LogoCloud } from "@/components/ui/logo-cloud-3";

export default function DemoOne() {
    return (
        <div className="w-full bg-black py-12 dark">
            <section className="relative mx-auto max-w-3xl px-6">
                <h2 className="mb-8 text-center font-medium text-white text-xl tracking-tight md:text-3xl">
                    <span className="text-gray-400">Trusted by experts.</span>
                    <br />
                    <span className="font-semibold">Used by the leaders.</span>
                </h2>
                <div className="mx-auto my-8 h-px max-w-sm bg-gray-800 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

                <LogoCloud logos={logos} />

                <div className="mt-8 h-px bg-gray-800 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
            </section>
        </div>
    );
}


const logos = [
    {
        src: "https://svgl.app/library/nvidia-wordmark-light.svg",
        alt: "Nvidia Logo",
    },
    {
        src: "https://svgl.app/library/supabase_wordmark_light.svg",
        alt: "Supabase Logo",
    },
    {
        src: "https://svgl.app/library/openai_wordmark_light.svg",
        alt: "OpenAI Logo",
    },
    {
        src: "https://svgl.app/library/turso-wordmark-light.svg",
        alt: "Turso Logo",
    },
    {
        src: "https://svgl.app/library/vercel_wordmark.svg",
        alt: "Vercel Logo",
    },
    {
        src: "https://svgl.app/library/github_wordmark_light.svg",
        alt: "GitHub Logo",
    },
    {
        src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
        alt: "Claude AI Logo",
    },
    {
        src: "https://svgl.app/library/clerk-wordmark-light.svg",
        alt: "Clerk Logo",
    },
];
