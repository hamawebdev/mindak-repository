import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Location Studio Alger – Production Vidéo & Shooting | Mindak",
    description: "Studio de création premium à Alger : production vidéo, shooting produit, espace moderne avec matériel professionnel. Location studio haut de gamme.",
    keywords: [
        "location studio Alger",
        "studio production vidéo Alger",
        "shooting produit Alger",
        "studio création contenu Alger",
        "production vidéo professionnelle",
        "studio photo Alger",
        "location studio premium Alger",
        "Mindak Studio"
    ],
    openGraph: {
        title: "Location Studio Alger – Production Vidéo & Shooting | Mindak",
        description: "Studio de création premium à Alger : production vidéo, shooting produit, espace moderne avec matériel professionnel.",
        url: "https://mindakstudio.com/studio",
        siteName: "Mindak Studio",
        locale: "fr_DZ",
        type: "website",
        images: [
            {
                url: "/Studio/mindakstudiologo.png",
                width: 1200,
                height: 630,
                alt: "Mindak Studio - Location Studio Alger"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Location Studio Alger – Production Vidéo & Shooting | Mindak",
        description: "Studio de création premium à Alger : production vidéo, shooting produit, espace moderne avec matériel professionnel.",
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
        canonical: "https://mindakstudio.com/studio"
    }
};

export default function StudioLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
