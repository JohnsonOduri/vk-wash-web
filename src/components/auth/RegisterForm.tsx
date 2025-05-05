
import { useNavigate } from "react-router-dom";
import { Mail, User, Key, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm = ({ onToggleForm }: RegisterFormProps) => {
  const { registerWithEmail } = useFirebaseAuth();
  const navigate = useNavigate();
  
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: ""
    }
  });

  const onSubmit = async (data: RegisterValues) => {
    try {
      // Register with email and password, and set role to "customer"
      const success = await registerWithEmail(data.email, data.password, "customer", {
        name: data.name,
        phone: data.phone,
        address: data.address
      });
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: `Welcome to VK Wash! Your customer ID is: ${data.phone}`
        });
        navigate("/customer-dashboard");
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="name" 
          render={({field}) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <User className="text-muted-foreground" />
                  <Input placeholder="Your full name" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
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
          name="phone" 
          render={({field}) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Phone className="text-muted-foreground" />
                  <Input placeholder="+91 9999999999" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={form.control} 
          name="address" 
          render={({field}) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <MapPin className="text-muted-foreground" />
                  <Input placeholder="Your full address" {...field} />
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
        
        <FormField 
          control={form.control} 
          name="confirmPassword" 
          render={({field}) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
        
        <Button type="submit" className="w-full">
          Register
        </Button>
        
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={onToggleForm}
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </Form>
  );
};
