
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
  export interface Control {}
  export interface FieldValues {}
  export interface FieldPath<T> {}
  export interface ControllerProps<T extends FieldValues, U extends FieldPath<T>> {}
  export interface FieldErrors<T> {}
  export interface UseFormSetValue<T> {}
}

// Zod
declare module 'zod' {
  export const z: any;
  export function object(schema: any): any;
  export function string(): any;
  export function number(): any;
  export function enum(values: any[], options?: any): any;
  export interface ZodType<T> {
    infer: T;
  }
  export namespace z {
    export function object(schema: any): any;
    export function string(): any;
    export function number(): any;
    export function enum(values: any[], options?: any): any;
    export interface infer<T> extends T {}
  }
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
