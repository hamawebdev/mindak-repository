import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Production Podcast Alger – Studio Enregistrement Pro | Mindak",
    description: "Studio podcast professionnel à Alger : enregistrement, production, montage. Espace équipé, accompagnement complet. Créez votre podcast premium.",
    keywords: [
        "production podcast Alger",
        "studio podcast Alger",
        "enregistrement podcast Alger",
        "création podcast professionnel",
        "studio enregistrement Alger",
        "podcast production Algérie",
        "Mindak Studio podcast",
        "location studio podcast Alger"
    ],
    openGraph: {
        title: "Production Podcast Alger – Studio Enregistrement Pro | Mindak",
        description: "Studio podcast professionnel à Alger : enregistrement, production, montage. Espace équipé, accompagnement complet.",
        url: "https://mindakstudio.com/podcast",
        siteName: "Mindak Studio",
        locale: "fr_DZ",
        type: "website",
        images: [
            {
                url: "/Studio/mindakstudiologo.png",
                width: 1200,
                height: 630,
                alt: "Mindak Studio - Production Podcast Alger"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Production Podcast Alger – Studio Enregistrement Pro | Mindak",
        description: "Studio podcast professionnel à Alger : enregistrement, production, montage. Espace équipé, accompagnement complet.",
        images: ["/Studio/mindakstudiologo.png"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    },
    alternates: {
        canonical: "https://mindakstudio.com/podcast"
    }
};

export default function PodcastLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
