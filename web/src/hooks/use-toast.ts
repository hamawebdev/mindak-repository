import { toast as sonnerToast } from "sonner";
import { useMemo } from "react";

export function useToast() {
  return useMemo(() => ({
    toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
        if (props.variant === "destructive") {
            sonnerToast.error(props.title, {
                description: props.description,
            });
        } else {
            sonnerToast.success(props.title, {
                description: props.description,
            });
        }
    },
  }), []);
}
