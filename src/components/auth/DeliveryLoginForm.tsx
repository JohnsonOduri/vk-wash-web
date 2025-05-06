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

const deliveryLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type DeliveryLoginValues = z.infer<typeof deliveryLoginSchema>;

export const DeliveryLoginForm = ({ onSubmit }: { onSubmit: () => void }) => {
  const { loginWithEmail, user } = useFirebaseAuth();
  const navigate = useNavigate();
  
  const form = useForm<DeliveryLoginValues>({
    resolver: zodResolver(deliveryLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const onSubmitForm = async (data: DeliveryLoginValues) => {
    try {
      const success = await loginWithEmail(data.email, data.password);
      if (success) {
        // Check if the user has the correct role
        if (user && user.role === "delivery") {
          toast({
            title: "Login Successful",
            description: "Welcome to VK Wash Delivery"
          });
          navigate("/delivery-dashboard");
        } else {
          toast({
            title: "Access Denied",
            description: "This account doesn't have delivery staff permissions",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
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
        
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
    </Form>
  );
};
