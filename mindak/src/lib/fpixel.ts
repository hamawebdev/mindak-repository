export const FB_PIXEL_ID = "859664903264992";

// Extend Window interface to include fbq
declare global {
    interface Window {
        fbq: (action: string, eventName: string, options?: Record<string, unknown>) => void;
    }
}

export const pageview = () => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "PageView");
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const event = (name: string, options: any = {}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", name, options);
    }
};
