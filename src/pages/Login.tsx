
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "@/hooks/use-toast";
import { Mail, User, Key } from "lucide-react";
import Navigation from "@/components/Navigation";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { loginWithEmail, registerWithEmail } = useFirebaseAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onCustomerSubmit = async (data: z.infer<typeof emailSchema>) => {
    let success;
    
    if (isRegistering) {
      // Register new customer
      success = await registerWithEmail(data.email, data.password, "customer");
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to VK Wash! You can now login.",
        });
        setIsRegistering(false); // Switch back to login view
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Login existing customer
      success = await loginWithEmail(data.email, data.password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to VK Wash",
        });
        navigate("/customer-dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials, please try again",
          variant: "destructive",
        });
      }
    }
  };

  const onStaffSubmit = async (data: z.infer<typeof emailSchema>) => {
    const success = await loginWithEmail(data.email, data.password);
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to VK Wash Delivery",
      });
      navigate("/delivery-dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials, please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Staff</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>{isRegistering ? "Customer Registration" : "Customer Login"}</CardTitle>
                  <CardDescription>
                    {isRegistering 
                      ? "Create a new customer account" 
                      : "Sign in with your email and password"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
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
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
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
                        {isRegistering ? "Register" : "Log in"}
                      </Button>
                      <div className="text-center mt-4">
                        <button 
                          type="button"
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => {
                            setIsRegistering(!isRegistering);
                            emailForm.reset();
                          }}
                        >
                          {isRegistering ? "Already have an account? Login" : "New customer? Register here"}
                        </button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Staff Login</CardTitle>
                  <CardDescription>
                    Enter your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
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
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
