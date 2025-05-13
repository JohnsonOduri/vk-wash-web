
import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { toast as shadcnToast } from "@/components/ui/use-toast";

export const useToast = useShadcnToast;
export const toast = shadcnToast;

// Re-export everything else from the shadcn toast
export * from "@/components/ui/use-toast";
