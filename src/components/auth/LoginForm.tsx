import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onToggleForm: () => void;
  onSubmit: () => void;
}

export const LoginForm = ({ onToggleForm, onSubmit }: LoginFormProps) => {
  const { loginWithEmail } = useFirebaseAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmitForm = async (data: LoginValues) => {
    try {
      setLoginError("");
      const success = await loginWithEmail(data.email, data.password);
      
      if (success) {
        onSubmit();
      } else {
        setLoginError("Invalid login credentials. Please try again.");
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setLoginError(error.message || "An error occurred during login");
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="email" 
          render={({field}) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Mail className="text-muted-foreground" />
                  <Input placeholder="youremail@example.com" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="password" 
          render={({field}) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Key className="text-muted-foreground" />
                  <Input type="password" placeholder="******" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        {loginError && <div className="text-sm text-red-500">{loginError}</div>}

        <Button type="submit" className="w-full">
          Log in
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={onToggleForm}
          >
            New customer? Register here
          </button>
        </div>
      </form>
    </Form>
  );
};
