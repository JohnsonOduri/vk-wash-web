
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
  const { loginWithGoogle, loginWithEmail } = useFirebaseAuth();
  const navigate = useNavigate();
  
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to VK Wash",
      });
      navigate("/customer-dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
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
                  <CardTitle>Customer Login</CardTitle>
                  <CardDescription>
                    Sign in with your Google account
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Button 
                    className="w-full mb-4 flex items-center" 
                    onClick={handleGoogleLogin}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
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
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
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
