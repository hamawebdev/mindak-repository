import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Mindak Studio – Votre contenu, notre expertise | Alger",
    description: "Studio de création haut de gamme à Alger : production vidéo, podcasts, shootings produits. Matériel professionnel, espace moderne, qualité premium.",
    keywords: [
        "Mindak Studio",
        "studio création Alger",
        "production contenu Alger",
        "studio professionnel Alger",
        "création vidéo Alger",
        "studio podcast Alger",
        "shooting produit Alger",
        "location studio Alger"
    ],
    openGraph: {
        title: "Mindak Studio – Votre contenu, notre expertise",
        description: "Studio de création haut de gamme à Alger : production vidéo, podcasts, shootings produits. Matériel professionnel, espace moderne, qualité premium.",
        url: "https://mindakstudio.com",
        siteName: "Mindak Studio",
        locale: "fr_DZ",
        type: "website",
        images: [
            {
                url: "/Studio/mindakstudiologo.png",
                width: 1200,
                height: 630,
                alt: "Mindak Studio - Création de contenu premium à Alger"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Mindak Studio – Votre contenu, notre expertise",
        description: "Studio de création haut de gamme à Alger : production vidéo, podcasts, shootings produits. Matériel professionnel, espace moderne, qualité premium.",
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
        canonical: "https://mindakstudio.com"
    }
};

export default function ExternalLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
