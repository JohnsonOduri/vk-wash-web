
// This file contains custom type declarations for the project

// React Router DOM
declare module 'react-router-dom' {
  export function useNavigate(): (path: string) => void;
  export function useLocation(): any;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
}

// React Hook Form
declare module 'react-hook-form' {
  export function useForm<T>(config?: any): any;
  export interface UseFormReturn<T> {
    register: any;
    handleSubmit: (callback: (data: T) => void) => (e: any) => void;
    formState: {
      errors: any;
    };
    watch: (name?: string) => any;
    setValue: (name: string, value: any) => void;
    control: any;
  }
  export const Control: any;
  export type FieldValues = any;
  export type FieldPath<T> = any;
  export type ControllerProps<T = any> = any;
  export type FieldErrors = any;
  export type UseFormSetValue<T = any> = any;
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
}

// Zod
declare module 'zod' {
  export const z: {
    object: (schema: any) => any;
    string: () => any;
    number: () => any;
    enum: (values: any[], options?: any) => any;
    infer: <T>(schema: any) => T;
  };
  export type ZodType<T> = {
    infer: T;
  };
}

// React Day Picker
declare module 'react-day-picker' {
  export const DayPicker: React.ComponentType<any>;
  export type DayPickerProps = any;
}

// Sonner
declare module 'sonner' {
  export const Toaster: React.ComponentType<any>;
  export const toast: any;
}

// Hookform Resolvers
declare module '@hookform/resolvers/zod' {
  export const zodResolver: any;
}

// TanStack React Query
declare module '@tanstack/react-query' {
  export const QueryClientProvider: any;
  export function useQueryClient(): any;
  export const useQuery: any;
}
